# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are current and prospective engineering students looking to discover upcoming technical workshops, hackathons, and research domains, as well as register for events. Secondary users include student leaders managing club initiatives, faculty advisors reviewing community activities, and prospective project collaborators.

## Product Purpose

The official digital hub and web presence for VJ ARC (AI Research and Coding). It provides students an engaging, modern portal to explore technical domains, learn about flagship initiatives, register seamlessly for upcoming events, and connect with peer mentors and leaders. Success means high student engagement, streamlined event registrations, transparent discovery of community programs, and active participation across domains.

## Positioning

A student-driven, research-anchored technical community bridging core software engineering, cutting-edge AI/ML, competitive programming, and practical innovation. Rather than a conventional college club or passive noticeboard, VJ ARC positions itself as a launchpad and collaborative engineering environment where students build production-grade projects and publish research.

## Operating Context

University semester cycles, campus hackathons, lab workshops, and peer-to-peer coding sessions. Users access the portal primarily from mobile smartphones on campus Wi-Fi and mobile networks (discovering events on the fly), as well as desktop laptops during hackathons, workshops, and development sessions.

## Capabilities and Constraints

- **Core Capabilities:**
  - Interactive hero with dynamic canvas network visualization and high-impact messaging.
  - Comprehensive about section highlighting community mission, key metrics, and 8 specialized focus areas (AI/ML, Data Science, Cyber Security, Software Development, Competitive Programming, Research & Innovation, Cloud & DevOps, UI/UX).
  - Programs and workshops overview ("What We Do") with interactive spotlight cards.
  - Event registration and details integration via backend API (`/api/events`).
  - Smooth desktop & mobile navigation with dynamic scroll states and backdrop blur aesthetics.
- **Constraints & Stack Architecture:**
  - Monorepo structure comprising `vj-arc-official` (Vite, React 19, Tailwind CSS v4, Motion) and `vj-arc-backend` (Node.js, Express, MongoDB).
  - High performance requirements across mobile devices with smooth animations that do not drop frames.
- **Open Decisions / Roadmap:**
  - Student and organizer authentication workflows.
  - Dedicated event calendar and registration dashboard.
  - Project gallery and alumni spotlight directories.

## Brand Commitments

- **Name:** VJ ARC (AI Research and Coding).
- **Motto / Pillars:** "BUILD. INNOVATE. CONNECT." and "Technology • Innovation • Community".
- **Visual & Tone Character:** Technologically sophisticated, energetic, precise, forward-looking, and authentic to modern software engineering.
- **Permanent Assets:** Official VJ ARC logo (`/images/logo.png`), custom interactive cursor, brand-aligned particle/network graphics.

## Evidence on Hand

- Production-ready React 19 + Tailwind v4 codebase in `vj-arc-official`.
- Express.js backend with MongoDB event management in `vj-arc-backend`.
- Official brand assets located in `vj-arc-official/public/images/logo.png`.
- Established community metrics: 15+ Flagship Events, 1500+ Participants, 15 Student Leaders, 100% Innovation-Driven.
- 8 documented focus domains covering AI, Data Science, Security, Dev, Competitive Coding, and Cloud.

## Product Principles

1. **Student-First Clarity:** Information about events, workshops, and participation must be frictionless, immediate, and clear on any screen size.
2. **Technical Authenticity:** Showcase real student achievements, actual research domains, and genuine engineering rigor without hollow marketing fluff.
3. **Immersive Craft & Motion:** Delight users with fluid, purposeful interactions and modern visual craft that reflect an innovative AI and coding collective.
4. **Performance & Resilience:** Prioritize fast initial load, responsive typography, and smooth frame rates across mobile devices and campus networks.

## Accessibility & Inclusion

- Adhere to WCAG 2.1 AA standards for color contrast, readable text hierarchies, and responsive touch targets.
- Ensure full keyboard navigability across navigation and interactive event cards.
- Respect `prefers-reduced-motion` settings by softening or disabling intensive particle and floating animations.
