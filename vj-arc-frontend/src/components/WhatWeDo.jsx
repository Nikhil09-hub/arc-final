import { useState } from "react";

const programs = [
  {
    number: "01",
    tag: "LEARN",
    title: "Technical Workshops",
    description:
      "Hands-on sessions that help students explore emerging technologies and turn concepts into practical skills.",
  },
  {
    number: "02",
    tag: "BUILD",
    title: "Hackathons",
    description:
      "Collaborative challenges where ideas become working prototypes through coding, creativity and teamwork.",
  },
  {
    number: "03",
    tag: "RESEARCH",
    title: "AI & ML Sessions",
    description:
      "Explore artificial intelligence, machine learning and research-driven ideas shaping the future of technology.",
  },
  {
    number: "04",
    tag: "CODE",
    title: "Coding Events",
    description:
      "Competitive and collaborative coding experiences designed to sharpen problem-solving and engineering skills.",
  },
];

function ProgramCard({ program }) {
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
    <article
      className={`what-we-do-card ${hovered ? "is-hovered" : ""}`}
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
    </article>
  );
}

export default function WhatWeDo() {
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
          {programs.map((program) => (
            <ProgramCard key={program.number} program={program} />
          ))}
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