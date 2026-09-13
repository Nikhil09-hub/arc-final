import { useEffect, useState } from "react";
import { getEvents } from "../services/eventService";
import EventCard from "./EventCard";

const Events = ({ onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [activeStatus, setActiveStatus] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents(activeStatus);
        setEvents(data || []);
      } catch (err) {
        setError("Unable to load events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [activeStatus]);

  return (
    <section
      id="events"
      className="section-container py-24"
    >
      <div className="mb-12">
        <p className="mb-3 font-mono text-sm uppercase tracking-[0.3em] text-cyan-400">
          VJ ARC / EVENTS
        </p>

        <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Explore Our Events
        </h2>

        <p className="mt-4 max-w-2xl text-white/60">
          Discover workshops, hackathons, AI/ML sessions and coding events
          conducted by VJ ARC.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        {[
          ["upcoming", "Upcoming"],
          ["ongoing", "Ongoing"],
          ["past", "Past"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActiveStatus(value)}
            className={`rounded-full border px-5 py-2 text-sm transition ${
              activeStatus === value
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="py-16 text-center text-white/50">
          Loading events...
        </p>
      )}

      {error && (
        <p className="py-16 text-center text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="py-16 text-center text-white/50">
          No {activeStatus} events available.
        </p>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => onEventClick?.(event)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Events;