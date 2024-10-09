const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
  let Voting, votingContract, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    // Deploy the contract before each test
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2, addr3] = await ethers.getSigners(); // Get test accounts
    votingContract = await Voting.deploy();
    await votingContract.waitForDeployment();
  });

  it("Should create a new voting event", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60; // 3 hours from now
    const duration = 2 * 60 * 60; // 2 hours duration
    const maxCandidates = 3;
    const key = "correct_key";

    await expect(
      votingContract.createVotingEvent(
        "Event 1",
        "Test purpose",
        key,
        startTime,
        duration,
        maxCandidates
      )
    )
      .to.emit(votingContract, "VotingEventCreated")
      .withArgs(0, "Event 1", owner.address);

    const event = await votingContract.votingEvents(0);
    expect(event.name).to.equal("Event 1");
    expect(event.purpose).to.equal("Test purpose");
    expect(event.organizer).to.equal(owner.address);
  });

  it("Should register a voter with the correct key", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Register voter
    await expect(votingContract.connect(addr1).registerVoter(0, key))
      .to.emit(votingContract, "VoterRegistered")
      .withArgs(0, addr1.address);

    const isVoterRegistered = await votingContract.votingEvents(0).registeredVoters(addr1.address);
    expect(isVoterRegistered).to.equal(true);
  });

  it("Should not register a voter with an incorrect key", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";
    const wrongKey = "wrong_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Attempt to register with wrong key
    await expect(
      votingContract.connect(addr1).registerVoter(0, wrongKey)
    ).to.be.revertedWith("Invalid key");
  });

  it("Should register a candidate with the correct key", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Register candidate
    await expect(votingContract.connect(addr1).registerCandidate(0, key))
      .to.emit(votingContract, "CandidateRegistered")
      .withArgs(0, addr1.address);

    const isCandidateRegistered = await votingContract.votingEvents(0).registeredCandidates(addr1.address);
    expect(isCandidateRegistered).to.equal(true);
  });

  it("Should allow a voter to vote for a registered candidate", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Register candidate
    await votingContract.connect(addr1).registerCandidate(0, key);

    // Register voter and cast vote
    await votingContract.connect(addr2).registerVoter(0, key);

    // Fast-forward time to start the voting period
    await ethers.provider.send("evm_increaseTime", [4 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    await expect(votingContract.connect(addr2).vote(0, addr1.address))
      .to.emit(votingContract, "Voted")
      .withArgs(0, addr1.address, addr2.address);

    const voteCount = await votingContract.votingEvents(0).votes(addr1.address);
    expect(voteCount).to.equal(1);
  });

  it("Should not allow double voting", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Register candidate and voter
    await votingContract.connect(addr1).registerCandidate(0, key);
    await votingContract.connect(addr2).registerVoter(0, key);

    // Fast-forward time to start the voting period
    await ethers.provider.send("evm_increaseTime", [4 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);

    // Cast the first vote
    await votingContract.connect(addr2).vote(0, addr1.address);

    // Attempt to vote again
    await expect(votingContract.connect(addr2).vote(0, addr1.address)).to.be.revertedWith("You have already voted");
  });

  it("Should not allow voting before the start time", async function () {
    const startTime = Math.floor(Date.now() / 1000) + 3 * 60 * 60;
    const duration = 2 * 60 * 60;
    const maxCandidates = 3;
    const key = "correct_key";

    // Create event
    await votingContract.createVotingEvent(
      "Event 1",
      "Test purpose",
      key,
      startTime,
      duration,
      maxCandidates
    );

    // Register candidate and voter
    await votingContract.connect(addr1).registerCandidate(0, key);
    await votingContract.connect(addr2).registerVoter(0, key);

    // Attempt to vote before the voting period starts
    await expect(
      votingContract.connect(addr2).vote(0, addr1.address)
    ).to.be.revertedWith("Voting has not started yet");
  });
});
