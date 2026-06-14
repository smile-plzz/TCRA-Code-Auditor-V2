import { AuditResult } from "../types";

interface RadarChartProps {
  scores: AuditResult;
}

const SCORE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function RadarChart({ scores }: RadarChartProps) {
  const cx = 120;
  const cy = 120;
  const r = 80;
  
  const dims = [
    { label: "Transparency", key: "transparency" as const, short: "T" },
    { label: "Controllability", key: "controllability" as const, short: "C" },
    { label: "Reliability", key: "reliability" as const, short: "R" },
    { label: "Auditability", key: "auditability" as const, short: "A" }
  ];

  const angles = dims.map((_, i) => (i / 4) * 2 * Math.PI - Math.PI / 2);
  const scoreValues = dims.map(d => scores[d.key].score);

  const toXY = (angle: number, val: number) => ({
    x: cx + (r * val / 3) * Math.cos(angle),
    y: cy + (r * val / 3) * Math.sin(angle),
  });

  const polyPoints = angles.map((a, i) => toXY(a, scoreValues[i]));
  const polyStr = polyPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#08121f] rounded-xl border border-slate-800/60 shadow-xl max-w-xs mx-auto">
      <div className="text-xs font-mono text-[#4a9eff] uppercase tracking-widest mb-4 font-semibold">
        TCRA Dimensional Ratios
      </div>
      
      <svg width={240} height={240} className="block mx-auto relative overflow-visible">
        {/* Glow Filters */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx={cx} cy={cy} r={r} fill="url(#radarGlow)" />

        {/* Outer Circular Bounds */}
        {[1, 2, 3].map(level => (
          <polygon
            key={level}
            points={angles.map(a => toXY(a, level)).map(p => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#1e2d45"
            strokeWidth={1}
            strokeDasharray={level === 3 ? "0" : "4 2"}
          />
        ))}

        {/* Axis Lines */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="#1e2d45"
            strokeWidth={1}
          />
        ))}

        {/* Dimension Polygon Core */}
        {polyStr && (
          <polygon
            points={polyStr}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={2}
            className="transition-all duration-700 ease-out"
          />
        )}

        {/* Score Dot Markers */}
        {polyPoints.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={6}
              fill={SCORE_COLORS[scoreValues[i]] || "#3b82f6"}
              stroke="#06101e"
              strokeWidth={2.5}
              className="transition-all duration-300 hover:scale-125"
            />
            {/* Soft outer halo */}
            <circle
              cx={p.x}
              cy={p.y}
              r={12}
              fill={SCORE_COLORS[scoreValues[i]] || "#3b82f6"}
              fillOpacity={0.15}
              className="animate-pulse"
            />
          </g>
        ))}

        {/* Coordinate Labels */}
        {angles.map((a, i) => {
          const lx = cx + (r + 18) * Math.cos(a);
          const ly = cy + (r + 18) * Math.sin(a);
          return (
            <text
              key={i}
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              className="text-[12px] font-mono font-bold fill-[#4a9eff]"
            >
              {dims[i].short}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
