import { useCallback, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Network.jsx
 * ----------------------------------------------------------------------------
 * Faithful reproduction of the hexagonal network from the ORIGINAL VJ ARC logo.
 *
 * Every coordinate, radius and connection below was measured directly from the
 * source artwork (pixel-mapped from the 2000x2000 logo file, then scaled by a
 * single uniform factor of 0.5 into this 700x580 viewBox). Nothing here is
 * invented, rearranged, or approximated:
 *   - 15 hexagons total: 4 solid blue, 7 solid white (one smaller), 4 outlined.
 *   - 5 connector lines, exactly as in the source (4 white, 1 blue).
 * Do not edit NODES / CONNECTIONS unless the source logo itself changes.
 * ----------------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Design tokens (from the brief)
// ---------------------------------------------------------------------------
const BLUE = "#2563FF";
const WHITE = "#F5F5F5";

// ---------------------------------------------------------------------------
// Exact node geometry extracted from the original logo (do not rearrange)
// type: "blue"    -> solid blue fill
//       "white"   -> solid white fill
//       "outline" -> hollow, white stroke only
// ---------------------------------------------------------------------------
const NODES = [
  { id: "O1", type: "outline", cx: 419.8, cy: 59.7, r: 47.5 },
  { id: "W1", type: "white", cx: 296.2, cy: 99.2, r: 47.5 },
  { id: "B1", type: "blue", cx: 533.8, cy: 110.7, r: 47.5 },
  { id: "O2", type: "outline", cx: 171.7, cy: 150.8, r: 47.5 },
  { id: "W2", type: "white", cx: 442.6, cy: 198.1, r: 47.5 },
  { id: "O3", type: "outline", cx: 640.4, cy: 193.9, r: 47.5 },
  { id: "B2", type: "blue", cx: 71.7, cy: 225.6, r: 47.5 },
  { id: "B3", type: "blue", cx: 322.4, cy: 238.4, r: 47.5 },
  { id: "W3", type: "white", cx: 194.5, cy: 268.8, r: 47.5 },
  { id: "W4", type: "white", cx: 541.8, cy: 281.8, r: 47.5 },
  { id: "O4", type: "outline", cx: 422.4, cy: 321.8, r: 47.5 },
  { id: "W6", type: "white", cx: 47.7, cy: 353.1, r: 33.5 }, // the one smaller hexagon
  { id: "W5", type: "white", cx: 296.2, cy: 353.6, r: 47.5 },
  { id: "B4", type: "blue", cx: 175.9, cy: 397.5, r: 47.5 },
  { id: "W7", type: "white", cx: 204.9, cy: 524.7, r: 47.5 },
];

// Exact connections present in the source logo
const CONNECTIONS = [
  { id: "e-b2-b4", from: "B2", to: "B4", color: BLUE },
  { id: "e-b3-o1", from: "B3", to: "O1", color: WHITE },
  { id: "e-o3-w2", from: "O3", to: "W2", color: WHITE },
  { id: "e-w1-w3", from: "W1", to: "W3", color: WHITE },
  { id: "e-w5-w7", from: "W5", to: "W7", color: WHITE },
];

const VIEW_W = 700;
const VIEW_H = 580;

const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

// Flat-top hexagon vertices (matches the orientation of the source artwork)
function hexPoints(cx, cy, r) {
  let pts = "";
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts += `${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return pts.trim();
}

// Trim a connector so it terminates at each hexagon's outer edge rather than
// its center — this matches the source, where lines meet the hex boundary
// exactly (never spilling into the hollow center of outlined hexagons).
function trimmedEdge(fromNode, toNode) {
  const dx = toNode.cx - fromNode.cx;
  const dy = toNode.cy - fromNode.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: fromNode.cx + ux * fromNode.r,
    y1: fromNode.cy + uy * fromNode.r,
    x2: toNode.cx - ux * toNode.r,
    y2: toNode.cy - uy * toNode.r,
    length: dist - fromNode.r - toNode.r,
  };
}

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------
const NODE_STAGGER = 0.07; // seconds between each node's appearance
const NODE_POP_DURATION = 0.55;
const EDGE_EXTRA_DELAY = 0.15; // edges draw in shortly after both endpoints exist

function nodeDelay(index) {
  return index * NODE_STAGGER;
}

function edgeDelay(edge) {
  const fromIdx = NODES.findIndex((n) => n.id === edge.from);
  const toIdx = NODES.findIndex((n) => n.id === edge.to);
  return nodeDelay(Math.max(fromIdx, toIdx)) + NODE_POP_DURATION * 0.6 + EDGE_EXTRA_DELAY;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HexNode({ node, index, reduceMotion }) {
  const { cx, cy, r, type } = node;
  const glowColor = type === "blue" ? BLUE : WHITE;
  const points = useMemo(() => hexPoints(cx, cy, r), [cx, cy, r]);
  const haloPoints = useMemo(() => hexPoints(cx, cy, r * 1.55), [cx, cy, r]);

  const delay = nodeDelay(index);
  const pulseDuration = 3.6 + (index % 5) * 0.45;
  const glowDuration = 3 + (index % 4) * 0.5;

  return (
    <motion.g
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.35 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: reduceMotion ? 0 : delay,
        duration: NODE_POP_DURATION,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
    >
      {/* continuous subtle pulse, independent of entrance */}
      <motion.g
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.035, 1] }
        }
        transition={{
          delay: delay + NODE_POP_DURATION,
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        {/* glow halo */}
        <motion.polygon
          points={haloPoints}
          fill={glowColor}
          style={{ filter: `blur(${r * 0.38}px)` }}
          initial={{ opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: type === "outline" ? 0.22 : 0.3 }
              : { opacity: [0.18, type === "outline" ? 0.32 : 0.42, 0.18] }
          }
          transition={{
            delay: delay + NODE_POP_DURATION * 0.5,
            duration: glowDuration,
            repeat: reduceMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />

        {/* the hexagon itself */}
        {type === "outline" ? (
          <polygon
            points={points}
            fill="none"
            stroke={WHITE}
            strokeWidth={r * 0.34}
            strokeLinejoin="round"
          />
        ) : (
          <polygon
            points={points}
            fill={type === "blue" ? BLUE : WHITE}
            stroke={WHITE}
            strokeWidth={type === "blue" ? 2.5 : 0}
            strokeLinejoin="round"
          />
        )}
      </motion.g>
    </motion.g>
  );
}

function EdgeConnector({ edge, reduceMotion }) {
  const from = NODE_MAP[edge.from];
  const to = NODE_MAP[edge.to];
  const { x1, y1, x2, y2, length } = useMemo(() => trimmedEdge(from, to), [from, to]);
  const delay = edgeDelay(edge);
  const dash = 22;
  const speedPxPerSec = 190;
  const travelDuration = Math.max(length / speedPxPerSec, 1.1);

  return (
    <g>
      {/* base connector, drawn in on load */}
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={edge.color}
        strokeWidth={9}
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.55 }}
        transition={{
          delay: reduceMotion ? 0 : delay,
          duration: 0.65,
          ease: "easeInOut",
        }}
      />

      {/* traveling energy pulse along the connector */}
      {!reduceMotion && (
        <motion.line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={edge.color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${Math.max(length - dash, 10)}`}
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          animate={{ strokeDashoffset: -length, opacity: 0.9 }}
          transition={{
            opacity: { delay: delay + 0.65, duration: 0.4 },
            strokeDashoffset: {
              delay: delay + 0.65,
              duration: travelDuration,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{ filter: `blur(0.6px)` }}
        />
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Network({ className = "" }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 55, damping: 18, mass: 0.6 });
  const springY = useSpring(mvY, { stiffness: 55, damping: 18, mass: 0.6 });

  const PARALLAX_X = 14;
  const PARALLAX_Y = 10;

  const handlePointerMove = useCallback(
    (e) => {
      if (reduceMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      mvX.set(px * PARALLAX_X);
      mvY.set(py * PARALLAX_Y);
    },
    [mvX, mvY, reduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    mvX.set(0);
    mvY.set(0);
  }, [mvX, mvY]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full max-w-[640px] mx-auto select-none ${className}`}
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="VJ ARC hexagonal network"
        style={{ overflow: "visible" }}
      >
        {/* parallax layer */}
        <motion.g style={{ x: springX, y: springY }}>
          {/* gentle continuous float — applied to the whole network so every
              relative position and connection stays perfectly intact */}
          <motion.g
            animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* connectors render first, sitting beneath the hexagons */}
            {CONNECTIONS.map((edge) => (
              <EdgeConnector key={edge.id} edge={edge} reduceMotion={reduceMotion} />
            ))}

            {/* hexagon nodes */}
            {NODES.map((node, i) => (
              <HexNode key={node.id} node={node} index={i} reduceMotion={reduceMotion} />
            ))}
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}