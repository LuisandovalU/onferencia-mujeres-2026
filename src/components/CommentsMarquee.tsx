"use client";

import React, { memo } from "react";

// ─── Datos de testimonios con diseño neo-brutalist original ─────
type Testimonial = {
  name: string;
  tag: string;
  tagBg: string;
  accentColor: string;
  hoverShadowColor: string;
  text: string;
  shape: "star" | "cross" | "dashes" | "triangle" | "blob" | "diamond" | "ring" | "hexagon";
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sofía G.",
    tag: "Brave",
    tagBg: "bg-[#a8c480]",
    accentColor: "#a8c480",
    hoverShadowColor: "#a8c480",
    text: "La conferencia del año pasado cambió mi perspectiva por completo. Este año vengo obligatoriamente con dos amigas más para compartirlo.",
    shape: "star",
  },
  {
    name: "María Elena",
    tag: "Mujeres +40",
    tagBg: "bg-amber-200",
    accentColor: "#b9cf63",
    hoverShadowColor: "#b9cf63",
    text: "Me encantó encontrar un espacio sincero para mujeres en mi misma etapa, salí muy renovada y feliz de saber que no camino sola.",
    shape: "cross",
  },
  {
    name: "Andrea R.",
    tag: "Conferencia 2025",
    tagBg: "bg-[#f9cdff]",
    accentColor: "#e5a0e5",
    hoverShadowColor: "#e5a0e5",
    text: "Dios habló a mi corazón en cada plenaria. La atmósfera de adoración fue increíble e inspiradora de principio a fin.",
    shape: "dashes",
  },
  {
    name: "Carmen T.",
    tag: "Primera vez",
    tagBg: "bg-indigo-200",
    accentColor: "#a8c480",
    hoverShadowColor: "#a8c480",
    text: "No sabía qué esperar, pero conecté inmediatamente. Las plenarias resolvieron dudas que llevaba arrastrando años. Totalmente catártico.",
    shape: "triangle",
  },
  {
    name: "Luisa F.",
    tag: "Valiente",
    tagBg: "bg-[#ffc3a8]",
    accentColor: "#ff9562",
    hoverShadowColor: "#ff9562",
    text: "Como mamá de 3, es difícil darme un tiempo para mí. Estos dos días fueron un tanque de oxígeno puro para mi vida e identidad de vuelta.",
    shape: "blob",
  },
  {
    name: "Daniela M.",
    tag: "Brave",
    tagBg: "bg-[#a8c480]",
    accentColor: "#a8c480",
    hoverShadowColor: "#a8c480",
    text: "Me sentí acompañada y comprendida desde el primer momento. Ya estoy contando los días para la próxima edición.",
    shape: "diamond",
  },
  {
    name: "Patricia V.",
    tag: "Mujeres +40",
    tagBg: "bg-amber-200",
    accentColor: "#b9cf63",
    hoverShadowColor: "#b9cf63",
    text: "A mis 52 años pensé que no era para mí, pero fue la experiencia más transformadora que he vivido. Volveré siempre.",
    shape: "ring",
  },
  {
    name: "Valentina S.",
    tag: "Conferencia 2025",
    tagBg: "bg-[#f9cdff]",
    accentColor: "#e5a0e5",
    hoverShadowColor: "#e5a0e5",
    text: "La adoración me tocó tan profundamente que no pude contener las lágrimas. Necesitaba ese encuentro con Dios.",
    shape: "hexagon",
  },
];

// Dividir testimonios en dos filas para el marquee móvil
const ROW_1 = TESTIMONIALS.slice(0, 4);
const ROW_2 = TESTIMONIALS.slice(4, 8);

// ─── SVG Shapes (Idénticos al diseño original) ─────────────────
function GeometricShape({ shape, color, small = false }: { shape: Testimonial["shape"]; color: string; small?: boolean }) {
  const size = small ? 'w-[3.2rem] h-[3.2rem]' : 'w-[4.5rem] h-[4.5rem]';
  const cls = `absolute -inset-2 ${size} z-0 -translate-x-1.5 -translate-y-1.5 transition-transform duration-700 ease-out group-hover/card:scale-110`;
  
  switch (shape) {
    case "star":
      return (
        <svg className={`${cls} group-hover/card:rotate-90`} viewBox="0 0 100 100" fill={color}>
          <path d="M50 0 Q60 40 100 50 Q60 60 50 100 Q40 60 0 50 Q40 40 50 0 Z" />
        </svg>
      );
    case "cross":
      return (
        <svg className={`${cls} group-hover/card:-rotate-90`} viewBox="0 0 100 100" fill={color}>
          <path d="M40 0 H60 V40 H100 V60 H60 V100 H40 V60 H0 V40 H40 Z" />
        </svg>
      );
    case "dashes":
      return (
        <svg className={`${cls} group-hover/card:rotate-180`} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="4">
          <circle cx="50" cy="50" r="35" strokeDasharray="10 5" />
        </svg>
      );
    case "triangle":
      return (
        <svg className={`${cls} group-hover/card:rotate-180`} viewBox="0 0 100 100" fill={color}>
          <polygon points="50,15 90,85 10,85" />
        </svg>
      );
    case "blob":
      return (
        <svg className={`${cls} group-hover/card:rotate-180`} viewBox="0 0 100 100" fill={color}>
          <path d="M50 0 C60 0, 65 30, 80 30 C95 30, 100 45, 100 50 C100 60, 70 65, 70 80 C70 95, 55 100, 50 100 C40 100, 35 70, 20 70 C5 70, 0 55, 0 50 C0 40, 30 35, 30 20 C30 5, 45 0, 50 0 Z" />
        </svg>
      );
    case "diamond":
      return (
        <svg className={`${cls} group-hover/card:rotate-45`} viewBox="0 0 100 100" fill={color}>
          <rect x="25" y="25" width="50" height="50" rx="5" transform="rotate(45 50 50)" />
        </svg>
      );
    case "ring":
      return (
        <svg className={`${cls} group-hover/card:rotate-180`} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="6">
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="15" fill={color} opacity="0.3" />
        </svg>
      );
    case "hexagon":
      return (
        <svg className={`${cls} group-hover/card:rotate-90`} viewBox="0 0 100 100" fill={color}>
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
        </svg>
      );
  }
}

// ─── Tarjeta Neo-Brutalist (Idéntica al diseño original) ────────
const BrutalistCard = memo(({ item, compact = false }: { item: Testimonial; compact?: boolean }) => (
  <div
    className={`group/card ${compact ? 'w-[210px]' : 'w-[320px] md:w-[420px]'} shrink-0 ${compact ? 'p-4 pb-5 rounded-[1.5rem]' : 'p-8 pb-10 rounded-[2.5rem]'} bg-white border-[2.5px] border-black flex flex-col transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 cursor-pointer whitespace-normal`}
    style={{
      boxShadow: compact ? `5px 5px 0px 0px #000000` : `8px 8px 0px 0px #000000`,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = compact
        ? `10px 10px 0px 0px ${item.hoverShadowColor}`
        : `16px 16px 0px 0px ${item.hoverShadowColor}`;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = compact
        ? `5px 5px 0px 0px #000000`
        : `8px 8px 0px 0px #000000`;
    }}
  >
    {/* Header con Avatar + Forma Geométrica */}
    <div className="flex items-start justify-between relative z-20">
      <div className={`flex items-center ${compact ? 'gap-2.5' : 'gap-4'}`}>
        <div className={`relative ${compact ? 'w-9 h-9' : 'w-12 h-12'} flex items-center justify-center`}>
          <GeometricShape shape={item.shape} color={item.accentColor} small={compact} />
          <div className={`${compact ? 'w-7 h-7' : 'w-10 h-10'} rounded-full border-[2px] border-black relative z-10 overflow-hidden bg-neutral-200`} />
        </div>
        <div className="z-10 mt-0.5">
          <p className={`font-body font-bold ${compact ? 'text-[0.8rem]' : 'text-[1rem]'} leading-none text-black`}>{item.name}</p>
          <p className={`font-body ${compact ? 'text-[0.5rem]' : 'text-[0.6rem]'} ${item.tagBg} px-1.5 py-0.5 mt-1 rounded text-black font-extrabold uppercase tracking-widest inline-block border border-black shadow-[2px_2px_0px_0px_#000000]`}>
            {item.tag}
          </p>
        </div>
      </div>
      <div
        className={`${compact ? 'w-6 h-6 text-base' : 'w-8 h-8 text-xl'} rounded-full bg-black flex items-center justify-center text-white font-serif italic leading-none pt-1.5 transition-all duration-300 border-[1.5px] border-transparent shrink-0 group-hover/card:text-black group-hover/card:rotate-12 group-hover/card:border-black`}
      >
        <span className="transition-colors duration-300">"</span>
      </div>
    </div>

    {/* Divider */}
    <hr className={`border-black/20 ${compact ? 'my-3' : 'my-6'} w-full group-hover/card:border-black/50 transition-colors`} />

    {/* Texto del testimonio */}
    <p className={`font-body ${compact ? 'text-[0.75rem] leading-[1.5]' : 'text-[1rem] md:text-[1.05rem] leading-[1.6]'} text-black font-medium z-10 relative`}>
      {item.text}
    </p>
  </div>
));
BrutalistCard.displayName = "BrutalistCard";

// ─── Fila Marquee (Mobile) ──────────────────────────────────────
const MarqueeRow = memo(
  ({
    items,
    direction,
    speed = 35,
  }: {
    items: Testimonial[];
    direction: "left" | "right";
    speed?: number;
  }) => {
    // Triplicamos para loop suave sin gaps
    const repeatedItems = [...items, ...items, ...items];

    return (
      <div className="relative overflow-hidden w-full group/row">
        <div
          className="marquee-row flex gap-4 w-max py-2 px-2"
          style={{
            animation: `marquee-${direction} ${speed}s linear infinite`,
            willChange: "transform",
          }}
        >
          {repeatedItems.map((item, i) => (
            <BrutalistCard key={`${direction}-${i}`} item={item} compact />
          ))}
        </div>
      </div>
    );
  }
);
MarqueeRow.displayName = "MarqueeRow";

// ─── Desktop: Single-Row Marquee original ───────────────────────
const DesktopMarquee = memo(() => {
  // Duplicamos todo el set para el loop infinito
  const repeatedItems = [...TESTIMONIALS, ...TESTIMONIALS];
  
  return (
    <div className="hidden md:block relative w-full overflow-hidden group/marquee">
      {/* Blur Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-[30] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-[30] pointer-events-none" />

      {/* The track */}
      <div
        className="marquee-track-desktop flex gap-8 w-max px-16 pt-5 pb-16 items-center"
        style={{
          animation: "marquee-desktop 50s linear infinite",
          willChange: "transform",
        }}
      >
        {repeatedItems.map((item, i) => (
          <BrutalistCard key={`desktop-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
});
DesktopMarquee.displayName = "DesktopMarquee";

// ─── Componente Principal ───────────────────────────────────────
const CommentsMarquee = memo(() => {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      {/* Header (idéntico al original) */}
      <div className="text-center mb-20">
        <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] text-black tracking-tighter mb-4">
          Lo que vivimos
        </h2>
        <p className="font-body text-neutral-500 text-xs uppercase tracking-widest font-bold">
          Testimonios de ediciones anteriores
        </p>
      </div>

      {/* ═══ MOBILE: Double Row Infinite Marquee ═══ */}
      <div className="md:hidden flex flex-col gap-4 group/marquee-container relative">
        {/* Blur edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Row 1 → moves LEFT */}
        <MarqueeRow items={ROW_1} direction="left" speed={40} />

        {/* Row 2 → moves RIGHT */}
        <MarqueeRow items={ROW_2} direction="right" speed={45} />
      </div>

      {/* ═══ DESKTOP: Single-Row Marquee (como el original) ═══ */}
      <DesktopMarquee />

      {/* CSS Keyframes */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.333% - 0.5rem)); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(calc(-33.333% - 0.5rem)); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee-desktop {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - 1rem)); }
        }

        /* Pause on hover (mobile marquee container) */
        .group\\/marquee-container:hover .marquee-row,
        .group\\/marquee-container:active .marquee-row {
          animation-play-state: paused !important;
        }

        /* Pause on hover (desktop marquee) */
        .group\\/marquee:hover .marquee-track-desktop {
          animation-play-state: paused;
        }

        /* Pause al tocar tarjeta individual en mobile */
        .group\\/row:hover > div {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
});

CommentsMarquee.displayName = "CommentsMarquee";

export default CommentsMarquee;
