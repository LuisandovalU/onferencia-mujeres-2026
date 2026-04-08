"use client";

import { AutoImageCarousel, type CarouselSlide } from "@/components/AutoImageCarousel";
import { InscriptionModal } from "@/components/InscriptionModal";
import { publicPath } from "@/lib/public-path";
import { cn } from "@/lib/utils";
import type { ConferenciaKey } from "@/config/transferencia";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

// Assets WebP
import heroBotanicalBg from "@/assets/hero-botanical-bg.webp";
import braveCarousel1 from "@/assets/brave-carousel-1.webp";
import braveCarousel2 from "@/assets/brave-carousel-2.webp";
import braveCarousel3 from "@/assets/brave-carousel-3.webp";
import braveCarousel4 from "@/assets/brave-carousel-4.webp";
import braveCarousel5 from "@/assets/brave-carousel-5.webp";
import valienteCarousel1 from "@/assets/valiente-carousel-1.webp";
import valienteCarousel2 from "@/assets/valiente-carousel-2.webp";
import valienteCarousel3 from "@/assets/valiente-carousel-3.webp";
import valienteCarousel4 from "@/assets/valiente-carousel-4.webp";
import valienteCarousel5 from "@/assets/valiente-carousel-5.webp";
import braveText from "@/assets/brave.webp";
import valienteText from "@/assets/valiente.webp";

const HERO_BOTANICAL_BG = (heroBotanicalBg as any)?.src || heroBotanicalBg;

const inscribetePillClass =
  "rounded-full border-2 border-neutral-900 bg-white px-5 py-2.5 font-body text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-50 sm:px-7 sm:py-3 sm:text-sm sm:tracking-[0.18em]";

const BRAVE_SLIDES: CarouselSlide[] = [
  { src: braveCarousel1, alt: "Conferencia Brave — comunidad" },
  { src: braveCarousel2, alt: "Conferencia Brave — encuentro" },
  { src: braveCarousel3, alt: "Conferencia Brave — momento en el escenario" },
  { src: braveCarousel4, alt: "Conferencia Brave — conversación" },
  { src: braveCarousel5, alt: "Conferencia Brave — adoración y comunidad" },
];

const VALIENTE_SLIDES: CarouselSlide[] = [
  { src: valienteCarousel1, alt: "Conferencia Valiente — comunidad y adoración" },
  { src: valienteCarousel2, alt: "Conferencia Valiente — encuentro al aire libre" },
  { src: valienteCarousel3, alt: "Conferencia Valiente — tres mujeres sonriendo" },
  { src: valienteCarousel4, alt: "Conferencia Valiente — grupo cantando y celebrando" },
  { src: valienteCarousel5, alt: "Conferencia Valiente — apuntes y enseñanza" },
];

/** Mismo verde degradado que el CTA inferior */
const bravePanelGreen =
  "relative overflow-hidden bg-[#8ca665] shadow-xl ring-1 ring-white/10";

const bravePanelGlow = (
  <div
    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.12),transparent_55%)]"
    aria-hidden
  />
);

const heroTitleContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.08 },
  },
};

/** Opacidad siempre 1: el texto y el layout nunca quedan «invisibles» si el viewport/intersection falla. */
const heroTitleLine = {
  hidden: { opacity: 1, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const sectionReveal = {
  hidden: { opacity: 1, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const cardsStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

const cardItem = {
  hidden: { opacity: 1, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const copy = {
  introTitle: "¿Qué es una conferencia de mujeres?",
  introBody:
    "Es un espacio para encontrarnos con Dios y entre nosotras: adoración, enseñanza y comunidad. Dos encuentros con el mismo corazón, pensados para fortalecer tu fe y tu caminar.",
  brave: {
    name: "Brave",
    date: "24 de mayo",
    title: "Brave",
    body:
      "Una jornada para mujeres que buscan valor y claridad en Cristo. Enseñanza práctica, momentos de adoración y conversaciones que inspiran a dar el siguiente paso con valentía.",
  },
  valiente: {
    name: "Valiente",
    date: "31 de mayo",
    title: "Valiente",
    body:
      "Una experiencia para cultivar la fe con honestidad y esperanza. Palabra, comunidad y un ambiente acogedor donde puedas renovar tu mirada y recordar quién eres en Él.",
  },
};

function CtaButton({
  onPress,
  children,
  variant = "dark",
}: {
  onPress: () => void;
  children: ReactNode;
  variant?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "inline-flex min-h-[3rem] items-center justify-center rounded-full px-8 py-3 text-label font-body font-semibold uppercase tracking-[0.2em] transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]",
        variant === "dark"
          ? "bg-white text-forest hover:bg-white/95"
          : "bg-forest text-white hover:bg-forest/90"
      )}
    >
      {children}
    </button>
  );
}

export function ConferenceMujeresSection({ className }: { className?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreset, setModalPreset] = useState<ConferenciaKey | null>(null);

  const openModal = useCallback(() => {
    setModalPreset(null);
    setModalOpen(true);
  }, []);

  const openModalForConference = useCallback((key: ConferenciaKey) => {
    setModalPreset(key);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalPreset(null);
  }, []);

  return (
    <div
      data-conferencia-mujeres-section
      className={cn(
        "conferencia-root isolate min-h-screen bg-[#f5f5f5] text-black antialiased",
        className
      )}
    >
      <InscriptionModal open={modalOpen} onClose={closeModal} presetConferencia={modalPreset} />

      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-6 sm:pt-5 md:px-6 md:pb-8 md:pt-6 lg:px-8 xl:px-10 2xl:px-12">
        <section
          className="relative isolate min-h-[calc(100svh-1.5rem)] w-full overflow-hidden rounded-[2rem] bg-neutral-950 shadow-[0_-16px_48px_-18px_rgba(0,0,0,0.14),14px_0_40px_-20px_rgba(0,0,0,0.1),-14px_0_40px_-20px_rgba(0,0,0,0.1)] sm:min-h-[calc(100svh-2.5rem)] sm:rounded-[2.25rem] md:min-h-[calc(100svh-3rem)] md:rounded-[2.75rem] lg:rounded-[3rem]"
          aria-labelledby="hero-heading"
        >
          <h1 id="hero-heading" className="sr-only">
            Conferencia de Mujeres 2026
          </h1>

          <img
            src={HERO_BOTANICAL_BG}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            aria-hidden
          />

          <motion.div
            className="relative z-10 flex min-h-[calc(100svh-1.5rem)] flex-col items-center justify-center px-4 pb-28 pt-16 text-center sm:min-h-[calc(100svh-2.5rem)] sm:px-8 sm:pb-32 sm:pt-20 md:min-h-[calc(100svh-3rem)] md:px-12"
            variants={heroTitleContainer}
            initial="show"
            animate="show"
          >
            <motion.p
              variants={heroTitleLine}
              className="font-hero text-[clamp(0.88rem,3.4vw,1.45rem)] font-bold uppercase leading-tight tracking-[0.28em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]"
            >
              CONFERENCIA DE
            </motion.p>
            <motion.p
              variants={heroTitleLine}
              className="font-hero mt-5 text-[clamp(3.1rem,13.5vw,8.25rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white [font-weight:900] [text-shadow:0_4px_32px_rgba(0,0,0,0.55),0_1px_0_rgba(0,0,0,0.35)] sm:mt-6 md:mt-7"
            >
              MUJERES
            </motion.p>
            <motion.p
              variants={heroTitleLine}
              className="font-hero mt-6 text-[clamp(2.35rem,10.5vw,6rem)] font-black uppercase leading-none tracking-[-0.045em] text-white [font-weight:900] [text-shadow:0_3px_26px_rgba(0,0,0,0.5)] sm:mt-7"
            >
              2026
            </motion.p>
          </motion.div>

          {/* Franja blanca inferior + subida en esquina derecha (misma pieza que el fondo de página) */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[clamp(5.75rem,20vmin,9.5rem)]"
            aria-hidden
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Borde superior de la zona blanca: franja baja a la izquierda, sube hacia la derecha (como el trazo amarillo) */}
              <path
                fill="#f5f5f5"
                d="M0 100 L0 74 L216 74 C232 74 238 58 244 46 C250 34 262 28 278 28 L400 28 L400 100 Z"
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-end justify-end pb-[clamp(0.65rem,2.2vmin,1.1rem)] pr-[clamp(0.85rem,4vw,2.25rem)] pt-6">
              <button type="button" onClick={openModal} className={cn("pointer-events-auto", inscribetePillClass)}>
                Inscribete
              </button>
            </div>
          </div>

          <motion.a
            href="#contenido"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="absolute bottom-[max(7.25rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-white/90 outline-none ring-offset-2 ring-offset-transparent transition-opacity hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-[max(6.25rem,env(safe-area-inset-bottom))] md:bottom-[max(6.75rem,env(safe-area-inset-bottom))]"
            aria-label="Desplazarse hacia el contenido siguiente"
          >
            <span className="animate-hero-scroll-arrow drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-9 w-9 sm:h-11 sm:w-11"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </motion.a>

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[min(44vh,520px)] bg-cover bg-no-repeat opacity-[0.58] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.85)_45%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.85)_45%,transparent_100%)]"
            style={{
              backgroundImage: `url(${HERO_BOTANICAL_BG})`,
              backgroundPosition: "center top",
              backgroundSize: "cover",
            }}
            aria-hidden
          />
        </section>
      </div>

      <div className="relative overflow-x-visible">
        <div className="relative z-10">
          <div className="relative z-10">
      <motion.section
        id="contenido"
        className="section-container scroll-mt-4 pb-12 pt-10 md:pb-16 md:pt-12"
        variants={sectionReveal}
        initial="show"
        animate="show"
      >
        <div className="rounded-[2rem] bg-surface p-8 shadow-soft md:p-12">
          <h2 className="font-display text-display font-extrabold tracking-tight text-black">
            {copy.introTitle}
          </h2>
          <p className="mt-6 max-w-3xl font-body text-body text-neutral-600">{copy.introBody}</p>
        </div>
      </motion.section>

      <motion.section
        id="encuentros"
        className="section-container scroll-mt-4 py-12 md:py-20"
        variants={cardsStagger}
        initial="show"
        animate="show"
      >
        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          <motion.article
            variants={cardItem}
            className="flex min-h-[260px] flex-col rounded-[2rem] bg-surface p-8 shadow-card md:min-h-[280px] md:p-10"
          >
            <img 
              src={(valienteText as any)?.src || valienteText} 
              alt="Valiente" 
              className="h-[3rem] w-auto object-contain self-center" 
            />
            <p className="mt-4 font-body text-label font-semibold uppercase tracking-[0.25em] text-neutral-500 text-center">
              31 de mayo
            </p>
            <p className="mt-3 max-w-sm font-body text-sm leading-snug text-neutral-500 text-center mx-auto">
              Para mujeres de <span className="font-medium text-neutral-700">31 años en adelante</span>.
            </p>
            <div className="mt-auto flex justify-center pt-10">
              <button
                type="button"
                onClick={() => openModalForConference("valiente")}
                className={inscribetePillClass}
              >
                Aparta tu lugar
              </button>
            </div>
          </motion.article>
          <motion.article
            variants={cardItem}
            className={cn(
              "flex min-h-[260px] flex-col rounded-[2rem] p-8 md:min-h-[280px] md:p-10",
              bravePanelGreen
            )}
          >
            {bravePanelGlow}
            <div className="relative z-10 flex flex-1 flex-col">
              <img 
                src={(braveText as any)?.src || braveText} 
                alt="Brave" 
                className="h-[3rem] w-auto object-contain self-center" 
              />
              <p className="mt-4 font-body text-label font-semibold uppercase tracking-[0.25em] text-white/65 text-center">
                24 de mayo
              </p>
              <p className="mt-3 max-w-sm font-body text-sm leading-snug text-white/85 text-center mx-auto">
                Para mujeres de <span className="font-medium text-white">17 a 30 años</span>.
              </p>
              <div className="mt-auto flex justify-center pt-10">
                <CtaButton onPress={() => openModalForConference("brave")} variant="dark">
                  Aparta tu lugar
                </CtaButton>
              </div>
            </div>
          </motion.article>
        </div>
      </motion.section>

      <motion.section
        className="section-container pb-20 md:pb-28"
        variants={sectionReveal}
        initial="show"
        animate="show"
      >
        <div className={cn("overflow-hidden rounded-[2rem]", bravePanelGreen)}>
          {bravePanelGlow}
          <div className="relative z-10 grid gap-0 md:grid-cols-2">
            <div className="relative aspect-[4/3] min-h-[240px] md:aspect-auto md:min-h-[420px]">
              <AutoImageCarousel
                slides={BRAVE_SLIDES}
                intervalMs={5500}
                className="absolute inset-0"
                sizes="(max-width: 768px) 100vw, 50vw"
                priorityFirst
              />
            </div>
            <div className="flex flex-col justify-center p-8 text-white md:p-12 lg:p-14">
              <p className="font-body text-label font-semibold uppercase tracking-[0.28em] text-white/70 text-center md:text-left">
                {copy.brave.date}
              </p>
              <img 
                src={(braveText as any)?.src || braveText} 
                alt="Brave" 
                className="mt-4 h-[4.25rem] w-auto object-contain self-center md:self-start lg:h-[5rem]" 
              />
              <p className="mt-6 font-body text-[1.0625rem] leading-[1.65] !text-white/95 text-center md:text-left">
                {copy.brave.body}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="section-container pb-16 md:pb-24"
        variants={sectionReveal}
        initial="show"
        animate="show"
      >
        <div className="overflow-hidden rounded-[2rem] bg-surface shadow-card">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="order-2 flex flex-col justify-center p-8 md:order-1 md:p-12 lg:p-14">
              <p className="font-body text-label font-semibold uppercase tracking-[0.28em] text-neutral-500 text-center md:text-left">
                {copy.valiente.date}
              </p>
              <img 
                src={(valienteText as any)?.src || valienteText} 
                alt="Valiente" 
                className="mt-4 h-[4.25rem] w-auto object-contain self-center md:self-start lg:h-[5rem]" 
              />
              <p className="mt-6 font-body text-body text-neutral-600 text-center md:text-left">{copy.valiente.body}</p>
            </div>
            <div className="relative order-1 aspect-[4/3] min-h-[240px] md:order-2 md:aspect-auto md:min-h-[420px]">
              <AutoImageCarousel
                slides={VALIENTE_SLIDES}
                intervalMs={6000}
                className="absolute inset-0"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="section-container pb-20 md:pb-28"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-[#8ca665] px-6 py-12 text-center shadow-xl md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.12),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-forest/40 blur-2xl"
            aria-hidden
          />
          <p className="font-body text-label font-semibold uppercase tracking-[0.28em] text-white/70">
            No te pierdas tu lugar
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.75rem)] font-extrabold leading-tight tracking-tight text-white">
            ¿Lista para apartar tu lugar?
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-white/90 sm:text-lg">
            Completa tu inscripción y recibe los datos de transferencia. Te esperamos en Brave y Valiente.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <motion.button
              type="button"
              onClick={openModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "shadow-[0_0_40px_-12px_rgba(255,255,255,0.4)] ring-4 ring-white/20 sm:px-10 sm:py-4 sm:text-base",
                inscribetePillClass
              )}
            >
              Inscribete
            </motion.button>
          </div>
        </div>
      </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
