// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Voting {
    // Track the total number of voting events created
    uint256 public eventCount;

    // Structure to represent a candidate
    struct Candidate {
        string name; // Name of the candidate
        address candidateAddress; // Address of the candidate
        uint256 voteCount; // Vote count for the candidate
        bool requested; // Indicates if a candidate requested registration
        bool registered; // Indicates if a candidate is officially registered
    }

    // Structure to represent a voting event
    struct VotingEvent {
        string name; // Name of the voting event
        string purpose; // Purpose of the voting event
        address organizer; // Address of the event organizer
        string key; // Security key for registration
        uint256 startTime; // Voting start time (timestamp)
        uint256 endTime; // Voting end time (timestamp)
        uint256 maxCandidates; // Maximum number of candidates allowed
        bool active; // Indicates if the event is currently active
        mapping(address => bool) hasVoted; // Tracks if an address has voted
        mapping(address => bool) registeredVoters; // Tracks registered voters
        Candidate[] candidates; // Array of Candidate structs
    }

    // Mapping to store all voting events
    mapping(uint256 => VotingEvent) public votingEvents;

    // Events to emit during state changes
    event VotingEventCreated(uint256 eventId, string name, address organizer);
    event VoterRegistered(uint256 eventId, address voter);
    event CandidateRegistered(uint256 eventId, string name, address candidate);
    event CandidateRequestMade(uint256 eventId, string name, address candidate);
    event Voted(uint256 eventId, address candidate, address voter);

    // Modifier to restrict access to event organizers
    modifier onlyOrganizer(uint256 eventId) {
        require(
            msg.sender == votingEvents[eventId].organizer,
            "Not the organizer"
        );
        _;
    }

    // Modifier to ensure the voting event is active
    modifier votingActive(uint256 eventId) {
        require(votingEvents[eventId].active, "Voting event is not active");
        require(
            block.timestamp < votingEvents[eventId].endTime,
            "Voting has ended"
        );
        _;
    }

    // Modifier to check if the voting has started
    modifier votingStarted(uint256 eventId) {
        require(
            block.timestamp >= votingEvents[eventId].startTime,
            "Voting has not started yet"
        );
        require(
            block.timestamp < votingEvents[eventId].endTime,
            "Voting has ended"
        );
        _;
    }

    // Function to create a new voting event
    function createVotingEvent(
        string memory _name,
        string memory _purpose,
        string memory _key,
        uint256 _startTime,
        uint256 _duration,
        uint256 _maxCandidates
    ) public {
        require(
            _startTime >= block.timestamp + 2 hours,
            "Start time must be at least 2 hours from now"
        );
        require(_duration >= 1 hours, "Duration must be at least 1 hour");
        require(_maxCandidates >= 2, "There must be at least 2 candidates.");

        // Create a new voting event
        VotingEvent storage newEvent = votingEvents[eventCount];
        newEvent.name = _name;
        newEvent.purpose = _purpose;
        newEvent.organizer = msg.sender;
        newEvent.key = _key;
        newEvent.startTime = _startTime; // Set the start time
        newEvent.endTime = _startTime + _duration; // Calculate end time
        newEvent.maxCandidates = _maxCandidates; // Set max candidates
        newEvent.active = true; // Mark the event as active

        emit VotingEventCreated(eventCount, _name, msg.sender);
        eventCount++; // Increment the event count
    }

    // Function to register a voter for a voting event
function registerVoter(uint256 eventId, string memory _key) public {
    VotingEvent storage voting = votingEvents[eventId];
    require(voting.active, "Voting event is not active");
    require(block.timestamp < voting.startTime, "Voting has already started");
    require(!voting.registeredVoters[msg.sender], "You are already registered as a voter");
    require(msg.sender != voting.organizer, "Organizer cannot register as a voter");

    // Ensure the sender is not already registered as a candidate
    for (uint256 i = 0; i < voting.candidates.length; i++) {
        require(
            voting.candidates[i].candidateAddress != msg.sender,
            "You cannot register as a voter since you are a candidate"
        );
    }

    require(keccak256(abi.encodePacked(_key)) == keccak256(abi.encodePacked(voting.key)), "Invalid key");

    // Register the voter
    voting.registeredVoters[msg.sender] = true;
    emit VoterRegistered(eventId, msg.sender);
}

    // Function to check if a voter is registered for a specific event
    function isVoterRegistered(
        uint256 eventId,
        address voter
    ) public view returns (bool) {
        return votingEvents[eventId].registeredVoters[voter];
    }

   // Function to request registration as a candidate for a voting event
function registerCandidate(
    uint256 eventId,
    string memory _name,
    string memory _key
) public {
    VotingEvent storage voting = votingEvents[eventId];
    require(voting.active, "Voting event is not active");
    require(block.timestamp < voting.startTime, "Voting has already started");
    require(voting.candidates.length < voting.maxCandidates, "Max number of candidates reached");

    // Ensure the sender is not already registered as a voter or organizer
    require(!voting.registeredVoters[msg.sender], "You cannot register as a candidate since you are a voter");
    require(msg.sender != voting.organizer, "Organizer cannot register as a candidate");

    require(
        keccak256(abi.encodePacked(_key)) == keccak256(abi.encodePacked(voting.key)),
        "Invalid key"
    );

    // Ensure the candidate is not already registered or has not requested
    for (uint256 i = 0; i < voting.candidates.length; i++) {
        require(
            voting.candidates[i].candidateAddress != msg.sender,
            "You are already registered or have requested to register as a candidate"
        );
    }

    // Add candidate request
    voting.candidates.push(Candidate(_name, msg.sender, 0, true, false)); // Vote count is 0, requested is true
    emit CandidateRequestMade(eventId, _name, msg.sender);
}

    // Function to approve a candidate's registration request
    function approveCandidate(
        uint256 eventId,
        address candidate
    ) public onlyOrganizer(eventId) {
        VotingEvent storage voting = votingEvents[eventId];
        require(voting.active, "Voting event is not active");
        require(
            block.timestamp < voting.startTime,
            "Voting has already started"
        );

        // Find and approve the candidate in the array
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            if (voting.candidates[i].candidateAddress == candidate) {
                require(
                    voting.candidates[i].requested,
                    "Candidate has not requested registration"
                );
                voting.candidates[i].registered = true; // Officially register the candidate
                emit CandidateRegistered(
                    eventId,
                    voting.candidates[i].name,
                    candidate
                );
                return;
            }
        }
        revert("Candidate not found");
    }

    // Function to cast a vote for a candidate
    function vote(
        uint256 eventId,
        address candidate
    ) public votingStarted(eventId) {
        VotingEvent storage voting = votingEvents[eventId];

         
        require(
            voting.registeredVoters[msg.sender],
            "You are not a registered voter"
        );
        
        require(!voting.hasVoted[msg.sender], "You have already voted");



        // Increment the vote count for the candidate
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            if (
                voting.candidates[i].candidateAddress == candidate &&
                voting.candidates[i].registered
            ) {
                voting.candidates[i].voteCount++;
                voting.hasVoted[msg.sender] = true;
                emit Voted(eventId, candidate, msg.sender);
                return;
            }
        }
        revert("Candidate not found or not registered");
    }

    // Function to get details of a voting event
    function getVotingEvent(
        uint256 eventId
    )
        public
        view
        returns (
            string memory name,
            string memory purpose,
            address organizer,
            uint256 startTime,
            uint256 endTime,
            bool active
        )
    {
        VotingEvent storage voting = votingEvents[eventId];
        return (
            voting.name,
            voting.purpose,
            voting.organizer,
            voting.startTime,
            voting.endTime,
            voting.active
        );
    }

    // Function to end a voting event
    function endVotingEvent(uint256 eventId) public onlyOrganizer(eventId) {
        VotingEvent storage voting = votingEvents[eventId];
        require(block.timestamp > voting.startTime, "Voting event has not started yet");
        require(voting.active, "Voting event is already ended");
        voting.active = false; // Mark the event as inactive
        // Ensure all registered voters have voted
        uint256 totalRegisteredVoters = 0;
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            totalRegisteredVoters += voting.registeredVoters[voting.candidates[i].candidateAddress] ? 1 : 0;
        }

         // Check if all registered voters have voted
        require(totalRegisteredVoters == voting.candidates.length, "Not all registered voters have voted");

        // Mark the event as inactive
        voting.active = false;
    }

    // Function to get the list of candidates for a voting event
    function getCandidates(
        uint256 eventId
    ) public view returns (Candidate[] memory) {
        return votingEvents[eventId].candidates;
    }

    // Function to get the vote count for a specific candidate
    function getVoteCount(
        uint256 eventId,
        address candidate
    ) public view returns (uint256) {
        VotingEvent storage voting = votingEvents[eventId];
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            if (voting.candidates[i].candidateAddress == candidate) {
                return voting.candidates[i].voteCount;
            }
        }
        revert("Candidate not found");
    }

    // Function to get the results of a voting event
    function getVotingResults(
        uint256 eventId
    ) public view returns (address winner) {
        VotingEvent storage voting = votingEvents[eventId];
        require(!voting.active, "Voting event is still active");

        address topCandidate;
        uint256 highestVotes = 0;

        // Iterate through candidates to find the winner
        for (uint256 i = 0; i < voting.candidates.length; i++) {
            if (voting.candidates[i].voteCount > highestVotes) {
                highestVotes = voting.candidates[i].voteCount;
                topCandidate = voting.candidates[i].candidateAddress;
            }
        }
        return topCandidate; // Return the address of the winning candidate
    }
}
