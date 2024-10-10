const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let votingContract, organizer, owner, voter1, voter2, candidate1;

  beforeEach(async function () {
    // Deploy the Voting contract
    const Voting = await ethers.getContractFactory("Voting");
    votingContract = await Voting.deploy();
    await votingContract.waitForDeployment();

    // Get signers with descriptive names
    [organizer, owner, voter1, voter2, candidate1] = await ethers.getSigners();
  });

  it("Should create a new voting event", async function () {
    await votingContract.createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7205, // start time 2 hours from now
      3600, // 1 hour duration
      3 // Max 3 candidates
    );

    const event = await votingContract.getVotingEvent(0);
    expect(event.name).to.equal("Election");
    expect(event.purpose).to.equal("Student council election");
    console.log(event.startTime, event.endTime);
  });

  it("Should not allow voter registration with an invalid key", async function () {
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7300, // start time 2 hours from now
      3600, // 1 hour duration
      3 // Max 3 candidates
    );
    const eventId = 0;
    const invalidKey = "wrongKey"; // Use an invalid key
    await expect(votingContract.connect(voter1).registerVoter(eventId, invalidKey))
      .to.be.revertedWith("Invalid key");
  });

  it("Should not allow candidate registration with an invalid key", async function () {
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7300, // start time 2 hours from now
      3600, // 1 hour duration
      3 // Max 3 candidates
    );
    const eventId = 0;
    const invalidKey = "wrongKey"; // Use an invalid key
    await expect(votingContract.connect(candidate1).registerCandidate(eventId, "John Doe", invalidKey))
      .to.be.revertedWith("Invalid key");
  });

  it("Should allow voter registration with correct key", async function () {
    // Create a voting event
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7305, // start time 2 hours from now
      3600, // 1 hour duration
      3 // Max 3 candidates
    );

    // Register a voter
    await votingContract.connect(voter1).registerVoter(0, "secretKey");

    // Check if the voter is registered using the new isVoterRegistered function
    const isRegistered = await votingContract.isVoterRegistered(0, voter1.address);
    expect(isRegistered).to.equal(true);
  });

  it("Should allow candidate registration and approval", async function () {
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7310,
      3600,
      3
    );

    await votingContract.connect(candidate1).registerCandidate(0, "Candidate 1", "secretKey");
    const candidateRequest = await votingContract.getCandidates(0);
    expect(candidateRequest[0].requested).to.be.true;

    console.log("Registration applied for Candidate 1!");

    // Approve candidate by the organizer
    await votingContract.connect(organizer).approveCandidate(0, candidate1.address);
    const approvedCandidate = await votingContract.getCandidates(0);
    expect(approvedCandidate[0].registered).to.be.true;
  });

  it("should not allow the same voter to register twice", async function () {
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7310,
      3600,
      3
    );
    const eventId = 0;

    await votingContract.connect(voter1).registerVoter(eventId, "secretKey");
    await expect(votingContract.connect(voter1).registerVoter(eventId, "secretKey"))
      .to.be.revertedWith("You are already registered as a voter");
  });

  it("should not allow the same candidate to request registration twice", async function () {
    await votingContract.connect(organizer).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7305, // start time 2 hours from now
      3600, // 1 hour duration
      3 // Max 3 candidates
    );
    const eventId = 0;

    await votingContract.connect(candidate1).registerCandidate(eventId, "Candidate 1", "secretKey");
    await expect(votingContract.connect(candidate1).registerCandidate(eventId, "Candidate 1", "secretKey"))
      .to.be.revertedWith("You are already registered or have requested to register as a candidate");
  });

  it("should not allow the organizer to register as a voter", async function () {
    await votingContract.connect(owner).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7305,
      3600,
      3
    );
    const eventId = 0;
    await expect(votingContract.connect(owner).registerVoter(eventId, "secretKey"))
      .to.be.revertedWith("Organizer cannot register as a voter");
  });

  it("should not allow the organizer to register as a candidate", async function () {
    await votingContract.connect(owner).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7305,
      3600,
      3
    );
    const eventId = 0;
    await expect(votingContract.connect(owner).registerCandidate(eventId, "Organizer Candidate", "secretKey"))
      .to.be.revertedWith("Organizer cannot register as a candidate");
  });

  it("Should allow voting and track votes", async function () {
    await votingContract.connect(owner).createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 7305,
      3600,
      3
    );

    await votingContract.connect(voter1).registerVoter(0, "secretKey");
    await votingContract.connect(voter2).registerVoter(0, "secretKey");

    await votingContract.connect(candidate1).registerCandidate(0, "Candidate 1", "secretKey");
    await votingContract.connect(owner).approveCandidate(0, candidate1.address);

    // Simulate time travel to after the start time
    await ethers.provider.send("evm_increaseTime", [7310]); // forward 2 hours
    await ethers.provider.send("evm_mine", []); // mine a new block

    await votingContract.connect(voter1).vote(0, candidate1.address);
    const voteCount = await votingContract.getVoteCount(0, candidate1.address);
    expect(voteCount).to.equal(1);
  });

  it("Should end the voting event", async function () {
    await votingContract.createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 15000,
      3600,
      3
    );

    // Simulate time travel to after the start time
    await ethers.provider.send("evm_increaseTime", [15001]); // forward 2 hours
    await ethers.provider.send("evm_mine", []); // mine a new block


    await votingContract.endVotingEvent(0);
    const event = await votingContract.getVotingEvent(0);
    expect(event.active).to.be.false;
  });

  it("Should not allow the voting event to end if it hasn't started", async function () {
    await votingContract.createVotingEvent(
      "Election",
      "Student council election",
      "secretKey",
      Math.floor(Date.now() / 1000) + 30000,
      3600,
      3
    );

    await expect(votingContract.endVotingEvent(0))
      .to.be.revertedWith("Voting event has not started yet");
  });
});
