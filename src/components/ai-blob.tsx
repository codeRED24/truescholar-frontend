/**
 * AnimatedBlobLogo (CSS Animation version, faster + irregular blobs)
 */

export default function AnimatedBlobLogo({
  title = "Your Brand",
  subtitle = "",
  size = 360,
  palette = "aurora",
  rounded = true,
  glass = false,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  size?: number;
  palette?: string;
  rounded?: boolean;
  glass?: boolean;
  className?: string;
}) {
  const palettes = {
    aurora: {
      base: ["#7CFFCB", "#74F2CE", "#5AD2F4", "#8DA2FF"],
      alt: ["#9EF9F7", "#8EE7F2", "#74C8FF", "#A6B4FF"],
      glow: "#7CFFCB",
    },
    sunset: {
      base: ["#FF6B6B", "#FF8E53", "#FFC371", "#FFD56B"],
      alt: ["#FFA08C", "#FFB47A", "#FFD693", "#FFE59D"],
      glow: "#FF8E53",
    },
    ocean: {
      base: ["#00B4D8", "#0077B6", "#0096C7", "#48CAE4"],
      alt: ["#5ED3F3", "#2E86C1", "#25B6D2", "#7CDDF2"],
      glow: "#48CAE4",
    },
    candy: {
      base: ["#B388FF", "#FF8DC7", "#FFA5E2", "#FFC2E2"],
      alt: ["#C2A0FF", "#FF9FD1", "#FFB3EA", "#FFD7F0"],
      glow: "#FF8DC7",
    },
    tealGreen: {
      base: ["#00A76F", "#20C997", "#38D9A9", "#63E6BE"],
      alt: ["#0CA678", "#12B886", "#40C057", "#69DB7C"],
      glow: "#00A76F",
    },
  };

  //@ts-ignore
  const pal = palettes[palette] || palettes.aurora;

  const containerClasses = [
    "relative",
    "grid",
    "place-items-center",
    glass ? "bg-white/5 backdrop-blur-xl ring-1 ring-white/10" : "",
    rounded ? "rounded-2xl" : "",
    // removed "overflow-hidden"
    "select-none",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // More irregular blob shapes
  const blobPaths = [
    "M 100 600 q 0 -500,500 -500 t 500 500 t -500 500 T 100 600 z",
    "M 150 600 q 0 -400,500 -500 t 500 500 t -500 500 T 150 600 z",
    "M 100 600 q -50 -400,500 -500 t 450 550 t -500 500 T 100 600 z",
    "M 150 600 q 0 -600,500 -500 t 500 550 t -500 500 T 150 600 z",
  ];

  return (
    <div
      className={containerClasses}
      style={{ width: size, height: size }}
      aria-label={`${title} animated logo`}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .blob-spin {
          transform-origin: 600px 600px;
          animation: spin linear infinite;
        }
        .blob-spin-reverse {
          transform-origin: 600px 600px;
          animation: spin-reverse linear infinite;
        }
      `}</style>

      {/* SVG BLOBS */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 1200 1200"
        className="overflow-visible absolute inset-0"
        role="img"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {pal.base.map((c: any, i: any) => (
            <linearGradient
              key={`g-base-${i}`}
              id={`g-base-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={c} />
              <stop offset="100%" stopColor={pal.alt[i]} />
            </linearGradient>
          ))}
        </defs>

        {/* BASE LAYER BLOBS */}
        {[0, 1, 2, 3].map((i) => (
          <g
            key={`base-${i}`}
            transform={`rotate(${i * 10} 600 600)`}
            className="blob-spin"
            style={{ animationDuration: `${12 + i * 4}s` }} // faster
            filter="url(#glow)"
            opacity={0.85 - i * 0.12}
          >
            <path d={blobPaths[i]} fill={`url(#g-base-${i})`} />
          </g>
        ))}

        {/* ALT LAYER BLOBS (reverse spin) */}
        {[0, 1, 2, 3].map((i) => (
          <g
            key={`alt-${i}`}
            transform={`rotate(${40 + i * 10} 600 600)`}
            className="blob-spin-reverse"
            style={{ animationDuration: `${14 + i * 5}s` }} // faster
            filter="url(#glow)"
            opacity={0.7 - i * 0.12}
          >
            <path d={blobPaths[i]} fill={`url(#g-base-${i})`} />
          </g>
        ))}

        {/* Soft center light */}
        <circle cx="600" cy="600" r="300" fill={pal.glow} opacity="0.08" />
      </svg>

      {/* TEXT OVERLAY */}
      <div className="relative z-10 grid place-items-center text-center px-6">
        <div className="space-y-1">
          {/* <h1
            className={
              "text-white text-2xl md:text-3xl font-semibold drop-shadow-sm "
            }
          >
            {title}
          </h1> */}
          <div className=" flex pb-4 gap-3 items-center justify-center">
            <div className="eye h-4 w-3 rounded-full bg-white"></div>
            <div className="eye h-4 w-3 rounded-full bg-white"></div>
          </div>
          {subtitle && (
            <p className="text-white/80 text-sm md:text-base drop-shadow-xs">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Outer ring accent */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />
    </div>
  );
}
