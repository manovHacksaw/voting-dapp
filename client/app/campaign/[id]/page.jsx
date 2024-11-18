"use client"
import React, { useEffect, useState } from "react";
import { useVoting } from "@/context/VotingContext";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/CountdownTimer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Clock,
  User,
  Users,
  Award,
  AlertTriangle,
  XCircle,
  Flag,
} from "lucide-react";

const Campaign = ({ params }) => {
  const {
    loading,
    getCampaignById,
    getCandidates,
    approveCandidate,
    rejectCandidate,
    castVote,
    account,
    getVoteCount,
    endVotingEvent,
    getVotingResults,
  } = useVoting();

  const [event, setEvent] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});
  const [winner, setWinner] = useState(null);
  const id = Number(params.id);
  const router = useRouter();

  const handleGetResults = async (eventId) => {
    const winningAddress = await getVotingResults(eventId);
    setWinner(winningAddress); // Update the state with the winner's address
  };

  
 
  const fetchEventData = async () => {
    try {
      const fetchedEvent = await getCampaignById(id);
      setEvent(fetchedEvent);
      setIsOrganizer(
        account?.toLowerCase() === fetchedEvent.organizer.toLowerCase()
      );

      const fetchedCandidates = await getCandidates(id);
      setCandidates(fetchedCandidates);

      const voteCounts = {};
      for (const candidate of fetchedCandidates) {
        if (candidate.registered) {
          const count = await getVoteCount(id, candidate.candidateAddress);
          voteCounts[candidate.candidateAddress] = Number(count);
        }
      }
      setVoteCounts(voteCounts);

      // Fetch winner if event has ended
      if (!fetchedEvent.active) {
        try {
          const winnerAddress = await getVotingResults(id);
          setWinner(winnerAddress);
        } catch (error) {
          console.error("Error fetching winner:", error);
        }
      }
    } catch (err) {
      setError("Failed to fetch event data. Please try again later.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id, account]);

  const handleEndEvent = async () => {
    try {
      await endVotingEvent(id);
      await fetchEventData();
    } catch (err) {
      setError("Failed to end voting event. Please try again.");
      console.error(err);
    }
  };

  const handleApprove = async (candidateAddress) => {
    try {
      await approveCandidate(id, candidateAddress);
      await fetchEventData();
    } catch (err) {
      setError("Failed to approve candidate. Please try again.");
      console.error(err);
    }
  };

  const handleReject = async (candidateAddress) => {
    try {
      await rejectCandidate(id, candidateAddress);
      await fetchEventData();
    } catch (err) {
      setError("Failed to reject candidate. Please try again.");
      console.error(err);
    }
  };

  const handleVote = async (candidateAddress) => {
    try {
      await castVote(id, candidateAddress);
      await fetchEventData();
    } catch (err) {
      setError("Failed to cast vote. Please try again.");
      console.error(err);
    }
  };

  const getEventStatus = () => {
    if (!event) return null;
    const now = Math.floor(Date.now() / 1000);

    if (!event.active) return { label: "Ended", color: "destructive" };
    if (now < Number(event.startTime))
      return { label: "Upcoming", color: "warning" };
    if (now >= Number(event.startTime) && now <= Number(event.endTime))
      return { label: "Active", color: "success" };
    return { label: "Ended", color: "destructive" };
  };

  const getWinnerName = () => {
    if (!winner) return null;
    const winningCandidate = candidates.find(c => c.candidateAddress.toLowerCase() === winner.toLowerCase());
    return winningCandidate ? winningCandidate.name : "Unknown";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-3/4 bg-gray-800" />
        <Skeleton className="h-4 w-1/2 bg-gray-800" />
        <Skeleton className="h-32 w-full bg-gray-800" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 bg-gray-800" />
          <Skeleton className="h-24 bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto mt-20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Event not found. Please check the URL and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const status = getEventStatus();

  return (
    <div className="min-h-screen p-6 bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl text-white">
                  {event.name}
                </CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  {event.purpose}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge variant={status.color}>{status.label}</Badge>
                {isOrganizer && event.active && (
                  <Button 
                    onClick={handleEndEvent}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Flag className="h-4 w-4" />
                    End Event
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Organizer:</span>
                  <span className="font-mono text-sm">{`${event.organizer.slice(
                    0,
                    6
                  )}...${event.organizer.slice(-4)}`}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Starts:</span>
                  <span>
                    {new Date(Number(event.startTime) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-white">
                  Time Remaining
                </h3>
                <CountdownTimer
                  startTime={event.startTime}
                  duration={Number(event.endTime) - Math.floor(Date.now() /1000)}
                  className="text-2xl font-mono text-gray-300"
                />
              </div>
            </div>

            <button onClick={handleGetResults}>GetResults</button>

            {!event.active && winner && (
              <div className="mt-6 p-4 bg-blue-900/50 rounded-lg border border-blue-500">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-white">Winner: {getWinnerName()}</h3>
                </div>
                <p className="mt-2 text-gray-300">
                  With {voteCounts[winner]} votes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="candidates" className="text-gray-300">
          <TabsList className="w-full bg-gray-800">
            <TabsTrigger
              value="candidates"
              className="w-1/2 data-[state=active]:bg-gray-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="w-1/2 data-[state=active]:bg-gray-700"
            >
              <Award className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                {candidates.length > 0 ? (
                  <div className="space-y-4">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {candidate.name} 
                          </div>
                          <div className="text-sm text-gray-400">
                            {`${candidate.candidateAddress.slice(
                              0,
                              6
                            )}...${candidate.candidateAddress.slice(-4)}`}
                          </div>
                          <Badge
                            variant={
                              candidate.registered ? "success" : "secondary"
                            }
                          >
                            {candidate.registered ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                Registered
                              </>
                            ) : (
                              "Pending Approval"
                            )}
                          </Badge>
                        </div>
                        {isOrganizer && !candidate.registered && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                handleApprove(candidate.candidateAddress)
                              }
                              variant="success"
                              size="sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                handleReject(candidate.candidateAddress)
                              }
                              variant="destructive"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {candidate.registered && event.active && (
                          <Button
                            onClick={() =>
                              handleVote(candidate.candidateAddress)
                            }
                            variant="primary"
                            size="sm"
                            className="px-6 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Vote
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="mt-4">
                    <AlertDescription>
                      No candidates have registered for this event.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                {candidates.length > 0 ? (
                  <div className="space-y-4">
                    {candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg ${
                          winner && candidate.candidateAddress.toLowerCase() === winner.toLowerCase()
                            ? "border-2 border-yellow-500"
                            : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-white flex items-center gap-2">
                            {candidate.name}
                            {winner && candidate.candidateAddress.toLowerCase() === winner.toLowerCase() && (
                              <Award className="h-4 w-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {`${candidate.candidateAddress.slice(
                              0,
                              6
                            )}...${candidate.candidateAddress.slice(-4)}`}
                          </div>
                        </div>
                        
                        <Badge
                          variant="primary"
                          className="bg-blue-500 text-white font-semibold px-3 py-1 rounded-md"
                        >
                          {voteCounts[candidate.candidateAddress]} Votes 
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="mt-4">
                    <AlertDescription>
                      No candidates have registered for this event.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaign;