import Link from 'next/link';
import { useVoting } from "@/context/VotingContext";

const EventList = () => {
    const { votingEvents } = useVoting();

    return (
        <div>
            <h2>Ongoing Voting Events</h2>
            <ul>
                {votingEvents.map((event, index) => (
                    <li key={index}>
                        <Link href={`/event/${index}`}>
                            {event.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventList;
