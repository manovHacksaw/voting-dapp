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

    function registerCandidate(uint256 eventId, string memory _key) public {
        require(
            keccak256(abi.encodePacked(_key)) ==
                keccak256(abi.encodePacked(votingEvents[eventId].key)),
            "Invalid key"
        );
        votingEvents[eventId].candidates.push(msg.sender);
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

        voting.votes[candidate]++;
        voting.hasVoted[msg.sender] = true;
    }

    function getResults(
        uint256 eventId
    ) public view returns (address[] memory, uint256[] memory) {
        VotingEvent storage voting = votingEvents[eventId];
        uint[] memory resultVotes = new uint[](voting.candidates.length);
        for (uint i = 0; i < voting.candidates.length; i++) {
            resultVotes[i] = voting.votes[voting.candidates[i]];
        }
        return (voting.candidates, resultVotes);
    }
}
