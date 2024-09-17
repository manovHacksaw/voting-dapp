const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {

  let Voting;
  let voting;
  let organizer;
  let candidate;
  let voter;

  // Deploy the contract before each test
  beforeEach(async function () {
    [organizer, candidate, voter] = await ethers.getSigners(); // Get test accounts
    Voting = await ethers.getContractFactory("Voting"); // Get the contract factory
    voting = await Voting.deploy(); // Deploy the contract

    //wait for deployment of the contract
    await voting.waitForDeployment();

   
  });

  it("Should create a new voting event", async function () {
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");
    const event = await voting.votingEvents(0);

    // Check if the event has been created correctly
    expect(event.name).to.equal("Election");
    expect(event.purpose).to.equal("Company Election");
    expect(event.organizer).to.equal(organizer.address);
  });

  it("Should allow a candidate to register with a correct key", async function () {
    // Organizer creates an event
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");

    // Candidate registers using the correct key
    await voting.connect(candidate).registerCandidate(0, "secret");

    const candidates = await voting.getResults(0); // Assuming this returns candidates

    // Check if candidate's address was added
    expect(candidates[0][0]).to.equal(candidate.address);
  });

  it("Should not allow candidate registration with an incorrect key", async function () {
    // Organizer creates an event
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");

    // Candidate tries to register with a wrong key
    await expect(
      voting.connect(candidate).registerCandidate(0, "wrong_key")
    ).to.be.revertedWith("Invalid key"); // This should revert
  });

  it("Should allow voters to vote with the correct key", async function () {
    // Organizer creates an event
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");

    // Candidate registers
    await voting.connect(candidate).registerCandidate(0, "secret");

    // Voter votes for the candidate with the correct key
    await voting.connect(voter).vote(0, candidate.address, "secret");

    // Check if the vote count for the candidate increased
    const [candidates, votes] = await voting.getResults(0);
    expect(votes[0]).to.equal(1); // Candidate should have 1 vote
  });

  it("Should not allow voting with an incorrect key", async function () {
    // Organizer creates an event
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");

    // Candidate registers
    await voting.connect(candidate).registerCandidate(0, "secret");

    // Voter tries to vote with a wrong key
    await expect(
      voting.connect(voter).vote(0, candidate.address, "wrong_key")
    ).to.be.revertedWith("Invalid key");
  });

  it("Should not allow double voting", async function () {
    // Organizer creates an event
    await voting.connect(organizer).createVotingEvent("Election", "Company Election", "secret");

    // Candidate registers
    await voting.connect(candidate).registerCandidate(0, "secret");

    // Voter votes once
    await voting.connect(voter).vote(0, candidate.address, "secret");

    // Voter tries to vote again
    await expect(
      voting.connect(voter).vote(0, candidate.address, "secret")
    ).to.be.revertedWith("You have already voted");
  });
});
