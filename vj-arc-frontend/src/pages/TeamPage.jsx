const teamMembers = [
  {
    name: "Kanchana",
    position: "Chairperson",
    image: "/team/kanchana.jpg",
  },
  {
    name: "Sai Srivatcha",
    position: "President",
    image: "/team/sai.jpg",
  },
  {
    name: "Farihan Noor",
    position: "General Secretary",
    image: "/team/farihan.jpg",
  },
  {
    name: "Srishanth",
    position: "General Secretary",
    image: "/team/srishanth.jpg",
  },
  {
    name: "Keerthana",
    position: "Event Management Co-Ordinator",
    image: "/team/keerthana.jpg",
  },
  {
    name: "Musab",
    position: "Event Management Co-Ordinator",
    image: "/team/musab.jpg",
  },
  {
    name: "Javeed",
    position: "Technical Head",
    image: "/team/javeed.jpg",
  },
  {
    name: "Nishanth",
    position: "Technical Head",
    image: "/team/nishanth.jpg",
  },
  {
    name: "Dhanush",
    position: "Technical Head",
    image: "/team/dhanush.jpg",
  },
  {
    name: "Anitha",
    position: "Design Head",
    image: "/team/anitha.jpg",
  },
  {
    name: "Tejaswini",
    position: "Design Head",
    image: "/team/tejaswini.jpg",
  },
  {
    name: "Akshitha",
    position: "Documentation Head",
    image: "/team/akshitha.jpg",
  },
  {
    name: "Sanjana",
    position: "Documentation Head",
    image: "/team/sanjana.jpg",
  },
  {
    name: "Sravani",
    position: "Social Media Co-Ordinator",
    image: "/team/sravani.jpg",
  },
  {
    name: "Ashish",
    position: "Event Coverage Co-Ordinator",
    image: "/team/ashish.jpg",
  },
];

function TeamPage() {
  return (
    <main className="min-h-screen bg-[var(--vj-black)] px-4 pb-8 pt-5 text-[var(--vj-white)] sm:px-6 md:px-8 lg:px-10">

      <section className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}
        <div className="mb-5 flex items-end justify-between gap-6">

          <div>
            {/* Label */}
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--vj-blue)]" />

              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--vj-blue)]">
                VJ ARC / TEAM
              </p>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Core Team
            </h1>

            {/* Description */}
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--vj-muted)]">
              The people behind the ideas, technology, design, and experiences
              that shape VJ ARC.
            </p>
          </div>

          {/* Member Count */}
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-muted)]">
              Members
            </p>

            <p className="mt-1 font-mono text-2xl leading-none text-[var(--vj-blue)]">
              {String(teamMembers.length).padStart(2, "0")}
            </p>
          </div>

        </div>


        {/* ================= TEAM GRID ================= */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {teamMembers.map((member, index) => (
            <article
              key={`${member.name}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[var(--vj-dark)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vj-blue)]/50"
            >

              {/* ================= PHOTO ================= */}
              <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.03]">

                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Bottom Image Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Number */}
                <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Blue Dot */}
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--vj-blue)]" />

              </div>


              {/* ================= MEMBER INFO ================= */}
              <div className="px-4 py-3">

                <h2 className="text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-[var(--vj-blue)]">
                  {member.name}
                </h2>

                <p className="mt-1 text-[11px] leading-relaxed text-[var(--vj-muted)]">
                  {member.position}
                </p>

              </div>


              {/* ================= HOVER LINE ================= */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--vj-blue)] transition-all duration-500 group-hover:w-full" />

            </article>
          ))}

        </div>

      </section>
    </main>
  );
}

export default TeamPage;