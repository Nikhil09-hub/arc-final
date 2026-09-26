import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const programs = [
  {
    number: "01",
    tag: "LEARN",
    title: "Technical Workshops",
    description:
      "Hands-on sessions that help students explore emerging technologies and turn concepts into practical skills.",
    events: [
      "Data Engineering Workshop",
      "LLM Workshop",
      "Exploring AI Tools",
    ],
  },
  {
    number: "02",
    tag: "BUILD",
    title: "Hackathons & Innovation",
    description:
      "Collaborative challenges where ideas become working prototypes through coding, creativity and teamwork.",
    events: ["Re:Build AI", "Object Odyssey", "Gamepatch"],
  },
  {
    number: "03",
    tag: "RESEARCH",
    title: "AI, ML & Emerging Tech",
    description:
      "Explore artificial intelligence, machine learning and research-driven ideas shaping the future of technology.",
    events: ["ML Talks", "AI Toolverse", "AI Admania", "DeepDev", "Re:Build AI"],
  },
  {
    number: "04",
    tag: "CODE",
    title: "Coding Events",
    description:
      "Competitive and collaborative coding experiences designed to sharpen problem-solving and engineering skills.",
    events: ["Codequest", "Code Quest 2.0"],
  },
];

function ProgramCard({ program, active, onClick }) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <button
      type="button"
      aria-label={`Show ${program.tag} events`}
      aria-pressed={active}
      className={`what-we-do-card ${hovered ? "is-hovered" : ""} ${active ? "is-active" : ""}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMouse({ x: 50, y: 50 });
      }}
    >
      <div
        className="card-spotlight"
        style={{
          left: `${mouse.x}%`,
          top: `${mouse.y}%`,
        }}
      />

      <div className="card-top-line" />

      <div className="card-corner-glow" />
      <span className="card-bg-number">{program.number}</span>

      <div className="card-header">
        <span className="card-number">{program.number}</span>

        <span className="card-tag">{program.tag}</span>
      </div>

      <div className="card-content">
        <h3>{program.title}</h3>

        <p>{program.description}</p>
      </div>

      <div className="card-arrow">↗</div>
    </button>
  );
}

function ProgramDetails({ activeProgram }) {
  return (
    <motion.div
      aria-hidden={!activeProgram}
      initial={false}
      animate={
        activeProgram
          ? { height: "auto", opacity: 1, y: 0, marginTop: 18 }
          : { height: 0, opacity: 0, y: -8, marginTop: 0 }
      }
      transition={{ duration: 0.28, ease: "easeInOut" }}
      style={{ overflow: "hidden", gridColumn: "1 / -1" }}
    >
      <motion.div
        key={activeProgram.number}
        className="program-detail"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
      >
        <div className="program-detail-content">
          <div className="program-detail-heading">
            <span className="program-detail-tag">
              {activeProgram.tag} / EVENTS
            </span>
            <h3>{activeProgram.title}</h3>
          </div>

          <ul className="program-detail-events">
            {activeProgram.events.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </div>

        <Link className="program-detail-link" to="/events">
          Explore Events <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function WhatWeDo() {
  const [gridColumnCount, setGridColumnCount] = useState(() =>
    window.matchMedia("(max-width: 900px)").matches ? 1 : 2,
  );
  const [activeProgramNumber, setActiveProgramNumber] = useState(null);
  const activeProgram = programs.find(
    (program) => program.number === activeProgramNumber,
  );
  const activeProgramIndex = programs.findIndex(
    (program) => program.number === activeProgramNumber,
  );
  const detailInsertAfter = activeProgramIndex < 0
    ? -1
    : Math.min(
        Math.ceil((activeProgramIndex + 1) / gridColumnCount) * gridColumnCount,
        programs.length,
      );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const updateGridColumnCount = () => {
      setGridColumnCount(mediaQuery.matches ? 1 : 2);
    };

    mediaQuery.addEventListener("change", updateGridColumnCount);
    return () => mediaQuery.removeEventListener("change", updateGridColumnCount);
  }, []);

  return (
    <section id="what-we-do" className="what-we-do-section">
      <div className="section-container">

        <div className="what-we-do-heading">
          <p className="what-we-do-label">What We Do</p>

          <div className="what-we-do-title-row">
            <h2>
              PROGRAMS
              <br />
              <span>& INITIATIVES.</span>
            </h2>

            <p className="what-we-do-intro">
              From workshops and hackathons to AI research and coding events,
              VJ ARC creates spaces where students learn, experiment and build
              together.
            </p>
          </div>
        </div>

        <div className="program-grid">
          {programs.flatMap((program, index) => {
            const card = (
              <ProgramCard
                key={`program-${program.number}`}
                program={program}
                active={activeProgramNumber === program.number}
                onClick={() =>
                  setActiveProgramNumber((current) =>
                    current === program.number ? null : program.number,
                  )
                }
              />
            );

            if (!activeProgram || index + 1 !== detailInsertAfter) {
              return [card];
            }

            return [
              card,
              <ProgramDetails
                key={`detail-${activeProgram.number}`}
                activeProgram={activeProgram}
              />,
            ];
          })}
        </div>

        <div className="what-we-do-marquee">
          <div className="marquee-track">
            <span>AI RESEARCH</span>
            <b>✦</b>
            <span>CODING</span>
            <b>✦</b>
            <span>INNOVATION</span>
            <b>✦</b>
            <span>BUILD</span>
            <b>✦</b>
            <span>LEARN</span>
            <b>✦</b>
            <span>CONNECT</span>
            <b>✦</b>

            <span>AI RESEARCH</span>
            <b>✦</b>
            <span>CODING</span>
            <b>✦</b>
            <span>INNOVATION</span>
            <b>✦</b>
            <span>BUILD</span>
            <b>✦</b>
            <span>LEARN</span>
            <b>✦</b>
            <span>CONNECT</span>
            <b>✦</b>
          </div>
        </div>

      </div>
    </section>
  );
}