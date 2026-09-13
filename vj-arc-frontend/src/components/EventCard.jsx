import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

const EventCard = ({ event, onClick }) => {
  const startDate = new Date(event.startDate);

  const formattedDate = startDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/60 px-3 py-1 text-xs uppercase tracking-wider text-cyan-300">
          {event.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-white">
          {event.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-white/60">
          {event.shortDescription}
        </p>

        <div className="mt-5 space-y-2 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {event.venue}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-cyan-300">
          View Event
          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>
      </div>
    </motion.article>
  );
};

export default EventCard;