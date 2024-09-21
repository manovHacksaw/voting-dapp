// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.24;

contract Voting {
    struct VotingEvent {
        string name;
        string purpose;
        address organizer;
        string key;
        bool ended;
        mapping(address => bool) hasVoted;
        mapping(address => bool) registeredVoters;
        mapping(address => bool) registeredCandidates;
        address[] candidates;
        mapping(address => uint256) votes;
    }

    mapping(uint => VotingEvent) public votingEvents;
    uint256 public eventCount;

    modifier onlyOrganizer(uint eventId) {
        require(
            msg.sender == votingEvents[eventId].organizer,
            "Not the organizer"
        );
        _;
    }

    function createVotingEvent(
        string memory _name,
        string memory _purpose,
        string memory _key
    ) public {
        VotingEvent storage newEvent = votingEvents[eventCount];
        newEvent.name = _name;
        newEvent.purpose = _purpose;
        newEvent.organizer = msg.sender;
        newEvent.key = _key;
        newEvent.ended = false;
        eventCount++;
    }

    function getEventCount() public view returns (uint256) {
        return eventCount;
    }

    function registerVoter(uint256 eventId, string memory _key) public {
        VotingEvent storage voting = votingEvents[eventId];
        require(
            keccak256(abi.encodePacked(_key)) ==
                keccak256(abi.encodePacked(voting.key)),
            "Invalid key"
        );
        require(
            !voting.registeredVoters[msg.sender],
            "You are already registered as a voter"
        );
        require(
            !voting.registeredCandidates[msg.sender],
            "You cannot be a voter since you are a candidate"
        );
        require(
            msg.sender != voting.organizer,
            "Organizer cannot register as a voter"
        );

        voting.registeredVoters[msg.sender] = true; // Mark the sender as registered
    }

    function registerCandidate(
        uint256 eventId,
        string memory _key
    ) public {
        VotingEvent storage voting = votingEvents[eventId];
        require(
            keccak256(abi.encodePacked(_key)) ==
                keccak256(abi.encodePacked(voting.key)),
            "Invalid key"
        );
        require(
            !voting.registeredCandidates[msg.sender],
            "You are already registered as a candidate"
        );
        require(
            !voting.registeredVoters[msg.sender],
            "You cannot be a candidate since you are a voter"
        );
        require(
            msg.sender != voting.organizer,
            "Organizer cannot register as a candidate"
        );

        voting.registeredCandidates[msg.sender] = true; // Mark the sender as a registered candidate
        voting.candidates.push(msg.sender); // Add to the candidates list
    }

    function vote(
        uint256 eventId,
        address candidate,
        string memory _key
    ) public {
        VotingEvent storage voting = votingEvents[eventId];
        require(
            keccak256(abi.encodePacked(_key)) ==
                keccak256(abi.encodePacked(voting.key)),
            "Invalid key"
        );
        require(!voting.hasVoted[msg.sender], "You have already voted");
        require(
            voting.registeredVoters[msg.sender],
            "You are not registered as a voter"
        );
        require(msg.sender != candidate, "You cannot vote for yourself");

        voting.votes[candidate]++;
        voting.hasVoted[msg.sender] = true;
    }

    function getResults(
        uint256 eventId
    ) public view returns (address[] memory, uint256[] memory) {
        VotingEvent storage voting = votingEvents[eventId];
        uint256[] memory resultVotes = new uint256[](voting.candidates.length);
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            resultVotes[i] = voting.votes[voting.candidates[i]];
        }
        return (voting.candidates, resultVotes);
    }

    function endVotingEvent(uint256 eventId) public onlyOrganizer(eventId) {
        VotingEvent storage voting = votingEvents[eventId];
        require(!voting.ended, "Voting event already ended");
        voting.ended = true; // Mark the voting event as ended
    }

    function isVotingEnded(uint256 eventId) public view returns (bool) {
        return votingEvents[eventId].ended;
    }
}
