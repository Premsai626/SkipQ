"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --color-foreground: #F9FAFB;
  --color-background: #080B12;
  --color-primary: #00D4FF;
  --color-secondary: #8B5CF6;
  --color-destructive: #FB7185;

  /* Dynamic Variables using official Obsidian tokens */
  --pill-bg-1: rgba(26, 34, 50, 0.7);
  --pill-bg-2: rgba(17, 24, 39, 0.85);
  --pill-shadow: rgba(0, 0, 0, 0.8);
  --pill-highlight: rgba(0, 212, 255, 0.15);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: #273244;

  --pill-bg-1-hover: rgba(32, 43, 61, 0.85);
  --pill-bg-2-hover: rgba(26, 34, 50, 0.85);
  --pill-border-hover: #00D4FF;
  --pill-shadow-hover: rgba(0, 212, 255, 0.25);
  --pill-highlight-hover: rgba(0, 212, 255, 0.35);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--color-destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--color-destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--color-primary) 15%, transparent) 0%,
    color-mix(in oklch, var(--color-secondary) 15%, transparent) 40%,
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--color-foreground);
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--color-foreground) 8%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--color-foreground) 12%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--color-foreground) 0%, color-mix(in oklch, var(--color-foreground) 50%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--color-foreground) 15%, transparent));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const DEFAULT_MARQUEE_ITEMS = [
  "Smart Campus Printing",
  "Skip The Queue",
  "Instant Token System",
  "Order • Pay • Collect",
  "Zero Wait Time",
  "Live Order Tracking"
];

const MarqueeList = ({ items = DEFAULT_MARQUEE_ITEMS }: { items?: string[] }) => (
  <div className="flex items-center space-x-12 px-6">
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        <span>{item}</span>
        <span className={idx % 2 === 0 ? "text-primary/60" : "text-secondary/60"}>✦</span>
      </React.Fragment>
    ))}
  </div>
);

export interface CinematicFooterProps {
  brandText?: string;
  heading?: string;
  marqueeItems?: string[];
  getStartedText?: string;
  exploreText?: string;
  onGetStarted?: () => void;
  onExplore?: () => void;
  onNavigate?: (target: string) => void;
}

export function CinematicFooter({
  brandText = "SKIPQ",
  heading = "Ready to skip the line?",
  marqueeItems = DEFAULT_MARQUEE_ITEMS,
  getStartedText = "Get Started",
  exploreText = "Explore Features",
  onGetStarted,
  onExplore,
  onNavigate,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // Mobile optimization: eliminate touch scrub lag by applying clean static layout
    if (window.innerWidth < 768) {
      if (giantTextRef.current) gsap.set(giantTextRef.current, { y: 0, scale: 1, opacity: 1 });
      if (headingRef.current) gsap.set(headingRef.current, { y: 0, opacity: 1 });
      if (linksRef.current) gsap.set(linksRef.current, { y: 0, opacity: 1 });
      return;
    }

    // React strict mode compatible GSAP context cleanup for desktop
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.85, opacity: 0.2 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 90%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "top 25%",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    if (onGetStarted) {
      e.preventDefault();
      onGetStarted();
    } else if (onNavigate) {
      e.preventDefault();
      onNavigate('get-started');
    } else {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleExplore = (e: React.MouseEvent) => {
    if (onExplore) {
      e.preventDefault();
      onExplore();
    } else if (onNavigate) {
      e.preventDefault();
      onNavigate('how-it-works');
    } else {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLinkClick = (target: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(target);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        Cinematic Footer Container
      */}
      <div
        ref={wrapperRef}
        className="relative min-h-screen w-full overflow-hidden bg-[#080B12]"
      >
        <footer className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#080B12] text-[#F9FAFB] cinematic-footer-wrapper">

          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[100px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none opacity-40" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase opacity-15"
          >
            {brandText}
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-[#273244] bg-[#0D111B]/80 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-[#9CA3AF] uppercase">
              <MarqueeList items={marqueeItems} />
              <MarqueeList items={marqueeItems} />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center text-[#F9FAFB]"
            >
              {heading}
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {/* Get Started Button */}
                <MagneticButton
                  as="button"
                  onClick={handleGetStarted}
                  className="footer-glass-pill px-8 md:px-10 py-4 md:py-5 rounded-full text-[#F9FAFB] font-bold text-sm md:text-base flex items-center gap-3 group shadow-xl bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 border-[#00D4FF]/40 hover:border-[#00D4FF] transition-all cursor-pointer"
                >
                  <span className="text-[#00D4FF] font-black tracking-wide">{getStartedText}</span>
                  <svg className="w-5 h-5 text-[#00D4FF] transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </MagneticButton>

                {/* Explore Button */}
                <MagneticButton
                  as="button"
                  onClick={handleExplore}
                  className="footer-glass-pill px-8 md:px-10 py-4 md:py-5 rounded-full text-[#F9FAFB] font-bold text-sm md:text-base flex items-center gap-3 group shadow-lg cursor-pointer hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/50"
                >
                  <svg className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#00D4FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M3 12h18" />
                  </svg>
                  <span>{exploreText}</span>
                </MagneticButton>
              </div>

              {/* Secondary Navigation & Support Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as="a" href="#how-it-works" onClick={(e: any) => handleLinkClick('how-it-works', e)} className="footer-glass-pill px-6 py-3 rounded-full text-[#9CA3AF] font-medium text-xs md:text-sm hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/40">
                  How It Works
                </MagneticButton>
                <MagneticButton as="a" href="#services" onClick={(e: any) => handleLinkClick('services', e)} className="footer-glass-pill px-6 py-3 rounded-full text-[#9CA3AF] font-medium text-xs md:text-sm hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/40">
                  Services & Pricing
                </MagneticButton>
                <MagneticButton as="a" href="#privacy" onClick={(e: any) => handleLinkClick('privacy', e)} className="footer-glass-pill px-6 py-3 rounded-full text-[#9CA3AF] font-medium text-xs md:text-sm hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/40">
                  Privacy Policy
                </MagneticButton>
                <MagneticButton as="a" href="#terms" onClick={(e: any) => handleLinkClick('terms', e)} className="footer-glass-pill px-6 py-3 rounded-full text-[#9CA3AF] font-medium text-xs md:text-sm hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/40">
                  Terms of Service
                </MagneticButton>
                <MagneticButton as="a" href="#support" onClick={(e: any) => handleLinkClick('support', e)} className="footer-glass-pill px-6 py-3 rounded-full text-[#9CA3AF] font-medium text-xs md:text-sm hover:text-[#00D4FF] border-[#273244] hover:border-[#00D4FF]/40">
                  Support
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Copyright */}
            <div className="text-[#6B7280] text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © 2026 SkipQ. All rights reserved.
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-[#273244] bg-[#111827]">
              <span className="text-[#9CA3AF] text-[10px] md:text-xs font-bold uppercase tracking-widest">Crafted with</span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-[#FB7185]">❤</span>
              <span className="text-[#9CA3AF] text-[10px] md:text-xs font-bold uppercase tracking-widest">for</span>
              <span className="text-[#00D4FF] font-black text-xs md:text-sm tracking-normal ml-1">Campus Life</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-[#9CA3AF] hover:text-[#00D4FF] group order-3 border-[#273244] bg-[#111827]"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}
