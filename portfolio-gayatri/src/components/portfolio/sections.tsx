"use client";

import { useRef, ReactNode } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ExternalLink, Github, GraduationCap, Briefcase, Heart, Palette, BookOpen } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  image?: string;
  ongoing?: boolean;
}

// ─── Shared Utilities ─────────────────────────────────────────

export function ParallaxText({ text, speed = 1 }: { text: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -300 * speed]);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center top-1/2">
      <motion.div style={{ x }} className="whitespace-nowrap">
        <p className="font-mono text-[12vw] font-bold text-[var(--fg)] opacity-[0.025] uppercase leading-none tracking-tighter">
          {text} &bull; {text} &bull; {text} &bull; {text}
        </p>
      </motion.div>
    </div>
  );
}

export function RevealSection({ children, id, className = "" }: { children: ReactNode; id: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id={id} ref={ref} className={`relative py-24 lg:py-40 w-full max-w-7xl mx-auto px-6 overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="relative inline-block mb-14">
      <h2 className="text-3xl lg:text-5xl font-sans font-bold text-[var(--fg)] tracking-tight relative z-10">
        {children}
      </h2>
      <div className="absolute -bottom-2 -left-2 w-full h-3 bg-[var(--accent)]/20 -rotate-1 z-0 rounded"></div>
    </div>
  );
}

// ─── Skills ───────────────────────────────────────────────────

const SKILLS: { category: string; color: string; items: string[] }[] = [
  {
    category: "Languages",
    color: "#3b82f6",
    items: ["C", "C++", "Python", "Java"],
  },
  {
    category: "Concepts",
    color: "#8b5cf6",
    items: ["DSA", "OOPs", "DBMS", "OS", "CN"],
  },
  {
    category: "Backend",
    color: "#10b981",
    items: ["FastAPI", "Django"],
  },
  {
    category: "Database",
    color: "#f59e0b",
    items: ["MySQL"],
  },
  {
    category: "AI / ML",
    color: "#ef4444",
    items: ["NumPy", "Pandas", "Scikit-learn", "ML Models"],
  },
  {
    category: "Development",
    color: "#06b6d4",
    items: ["API Integration", "Authentication"],
  },
  {
    category: "Tools",
    color: "#64748b",
    items: ["Git", "GitHub", "Docker", "Postman", "Netlify"],
  },
];

function SkillPill({ name, color }: { name: string; color: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
      }}
      whileHover={{ scale: 1.15, y: -5, rotate: Math.random() > 0.5 ? 2 : -2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
      className="group relative flex items-center justify-center px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] cursor-default select-none overflow-visible shadow-[0_2px_8px_rgba(0,0,0,0.04)] interactive"
    >
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--fg)] text-[var(--bg)] text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all pointer-events-none whitespace-nowrap shadow-lg z-50">
        {name}
        {/* Tooltip Triangle */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--fg)]"></div>
      </div>

      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
        style={{ backgroundColor: color }}
      />
      <span
        className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0 transition-all duration-300 group-hover:scale-125"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
      />
      <span className="font-mono text-xs font-semibold text-[var(--fg)] tracking-wide">{name}</span>
    </motion.div>
  );
}

export function SkillsSection() {
  return (
    <RevealSection id="skills">
      <ParallaxText text="Capabilities" speed={1.4} />
      <SectionHeading>Technical Skills</SectionHeading>
      <div className="space-y-12">
        {SKILLS.map((cat) => (
          <motion.div 
            key={cat.category}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              show: { transition: { staggerChildren: 0.05 } }
            }}
          >
            <p
              className="font-mono text-xs uppercase tracking-[0.2em] mb-5 font-semibold"
              style={{ color: cat.color }}
            >
              {cat.category}
            </p>
            <div className="flex flex-wrap gap-3">
              {cat.items.map((item) => (
                <SkillPill key={item} name={item} color={cat.color} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Projects ─────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    title: "Fitz.ai",
    description: "AI-based fashion assistant that analyses skin tone and body structure to suggest suitable outfits. Aggregates insights from multiple e-commerce sources to deliver personalised recommendations.",
    tech: ["Python", "ML Models", "API Integration", "FastAPI"],
    github: "https://github.com/gayatrii-366/Fitz.ai",
    live: "",
    image: "/fitzai.jpg",
  },
  {
    title: "BeatsWeb Player",
    description: "Web music player built to explore frontend systems and API integration. Uses Spotify API for dynamic music control within a responsive UI.",
    tech: ["JavaScript", "Spotify API", "HTML/CSS"],
    github: "https://github.com/gayatrii-366/Beats--web-player",
    live: "",
    image: "/beatsweb.jpg",
  },
  {
    title: "Air Draw",
    description: "Computer vision-based system that enables mid-air drawing using finger tracking. Includes neon stroke rendering, gesture controls, and FPS tracking for smooth interaction.",
    tech: ["Python", "OpenCV", "NumPy"],
    github: "https://github.com/gayatrii-366/air-draw",
    live: "",
    image: "/airdraw.jpg",
  },
  {
    title: "Study Timer",
    description: "Productivity tool implementing the Pomodoro technique to track focused sessions and improve time management.",
    tech: ["Python", "Tkinter"],
    github: "https://github.com/gayatrii-366/student-timer",
    live: "",
    image: "/timer.jpg",
  },
  {
    title: "Snake Game",
    description: "Classic snake game built purely with Python standard libraries, focusing on game logic, controls, and rendering.",
    tech: ["Python", "Pygame"],
    github: "https://github.com/gayatrii-366/RetroSnakaeFX",
    live: "",
    image: "/snakegame.jpg",
  },
  {
    title: "Tic Tac Toe",
    description: "Interactive browser-based game with clean game state handling, written using vanilla HTML, CSS, and JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/gayatrii-366/Tic-Tac-Toe",
    live: "",
    image: "/tictactoe.jpg",
  },
];

export function ProjectsSection() {
  return (
    <RevealSection id="projects">
      <ParallaxText text="Featured" speed={0.8} />
      <SectionHeading>Projects</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((proj, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.02, rotate: i % 2 === 0 ? 1 : -1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_20px_50px_rgba(230,57,70,0.25)] transition-shadow duration-500"
          >
            {/* Image thumbnail with hover overlay */}
            {proj.image && (
              <div className="relative w-full h-44 overflow-hidden">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-[0.22,1,0.36,1] group-hover:scale-[1.08]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Dark scrim + links on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-gradient-to-t group-hover:from-[var(--accent)]/30 group-hover:to-black/80 transition-all duration-500 flex flex-col items-center justify-center gap-3">
                  <div className="flex gap-4">
                    {proj.github && proj.github !== "#" && (
                      <a
                        href={proj.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 bg-[var(--accent)] text-white p-3 rounded-full hover:scale-110 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_20px_var(--accent)] flex items-center justify-center shadow-2xl interactive"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {proj.live && (
                      <a
                        href={proj.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150 bg-[var(--accent)] text-white p-3 rounded-full hover:scale-110 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_20px_var(--accent)] flex items-center justify-center shadow-2xl interactive"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <span className="text-white/90 font-mono text-[11px] uppercase tracking-[0.3em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 drop-shadow-md">
                    View Code
                  </span>
                </div>
                {/* Ongoing badge */}
                {proj.ongoing && (
                  <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/40 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full z-10 shadow-lg shadow-black/30">
                    Ongoing
                  </span>
                )}
              </div>
            )}

            {/* Card body */}
            <div className="p-6 flex flex-col flex-1 bg-[var(--bg-secondary)] border-t border-transparent group-hover:border-[var(--accent)]/50 transition-colors">
              <h3 className="text-lg font-bold font-sans text-[var(--fg)] mb-2 group-hover:text-[var(--accent)] transition-colors">{proj.title}</h3>
              <p className="text-[var(--muted)] font-sans text-sm leading-relaxed mb-6 flex-1">{proj.description}</p>
              <div className="flex flex-wrap gap-2">
                {proj.tech.map((tag) => (
                  <span key={tag} className="font-mono text-[10px] text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded-md uppercase tracking-wide bg-[var(--bg-secondary)] group-hover:border-[var(--muted)]/30 group-hover:bg-transparent transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Education ────────────────────────────────────────────────

const EDUCATION = [
  {
    school: "MIT-WPU, Pune",
    degree: "Integrated B.Tech — Artificial Intelligence & Deep Learning",
    detail: "Currently pursuing",
    year: "2023 – Present",
  },
  {
    school: "DAV Public School, Pune",
    degree: "10th Grade — CBSE",
    detail: "88%",
    year: "2022",
  },
];

export function EducationSection() {
  return (
    <RevealSection id="education" className="bg-[var(--bg-secondary)] rounded-none">
      <ParallaxText text="Learning" speed={1.1} />
      <div className="flex items-center gap-3 mb-14">
        <GraduationCap className="w-7 h-7 text-[var(--muted)]" />
        <SectionHeading>Education</SectionHeading>
      </div>
      <div className="space-y-10">
        {EDUCATION.map((ed, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="shrink-0 text-right hidden sm:block w-28">
              <span className="font-mono text-xs text-[var(--muted)] tracking-wider">{ed.year}</span>
            </div>
            <div className="flex-1 border-l-2 border-[var(--border)] pl-8 relative">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[var(--fg)]" />
              <p className="font-bold text-[var(--fg)] font-sans text-lg">{ed.school}</p>
              <p className="text-[var(--muted)] font-sans text-sm mt-1">{ed.degree}</p>
              <p className="font-mono text-xs text-[var(--muted)] mt-2">{ed.detail} · {ed.year}</p>
            </div>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Experience ───────────────────────────────────────────────

export function ExperienceSection() {
  return (
    <RevealSection id="experience">
      <ParallaxText text="Work" speed={0.9} />
      <div className="flex items-center gap-3 mb-14">
        <Briefcase className="w-7 h-7 text-[var(--muted)]" />
        <SectionHeading>Experience</SectionHeading>
      </div>
      <div className="border-l-2 border-[var(--border)] pl-8 relative max-w-2xl">
        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[var(--fg)]" />
        <p className="font-bold text-[var(--fg)] font-sans text-lg">MIT-WPU Institute of Artificial Intelligence</p>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)] mt-1 mb-3">
          R&D Intern · Jun – Aug 2025
        </p>
        <p className="text-[var(--muted)] font-sans text-sm leading-relaxed">
          Worked on applied <span className="text-[var(--accent)] font-medium">AI/ML research</span> and experimentation within the institute's research division.
          Contributed to <span className="text-[var(--accent)] font-medium">model development</span>, data pipelines, and experiment documentation.
        </p>
      </div>
    </RevealSection>
  );
}

// ─── Workshops ────────────────────────────────────────────────

const WORKSHOPS = [
  {
    title: "Master in Machine Learning Workshop",
    description: "Focused on understanding core ML concepts, model building, and practical applications in real-world scenarios.",
  },
  {
    title: "OpenCV Workshop",
    description: "Explored computer vision techniques including image processing, object detection, and real-time visual analysis.",
  },
  {
    title: "AWS Workshop",
    description: "Learned fundamentals of cloud computing, deployment basics, and working with scalable infrastructure using AWS.",
  }
];

export function WorkshopsSection() {
  return (
    <RevealSection id="workshops" className="bg-[var(--bg-secondary)]">
      <ParallaxText text="Skills" speed={1.2} />
      <div className="flex items-center gap-3 mb-14">
        <BookOpen className="w-7 h-7 text-[var(--muted)]" />
        <SectionHeading>Workshops</SectionHeading>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORKSHOPS.map((ws, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.03, rotate: i % 2 === 0 ? -1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="group relative bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--accent)]/50 hover:shadow-[0_15px_40px_rgba(230,57,70,0.2)] transition-shadow duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold font-sans text-[var(--fg)] mb-3 group-hover:text-[var(--accent)] transition-colors">{ws.title}</h3>
              <p className="text-[var(--muted)] font-sans text-sm leading-relaxed">{ws.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Volunteering ─────────────────────────────────────────────

export function VolunteeringSection() {
  const events = [
    {
      name: "RIDE 2025 — MIT-WPU Entrepreneurial Summit",
      roles: ["Creative Team — Props and Stage Setup", "Registration Desk — Managed Participant Flow"],
      image: "/volunteering.jpeg",
    },
  ];

  return (
    <RevealSection id="volunteering" className="bg-[var(--bg-secondary)]">
      <ParallaxText text="Community" speed={1.3} />
      <div className="flex items-center gap-3 mb-14">
        <Heart className="w-7 h-7 text-[var(--muted)]" />
        <SectionHeading>Volunteering</SectionHeading>
      </div>
      {events.map((ev, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 max-w-2xl">
            <p className="font-bold text-[var(--fg)] font-sans text-lg mb-4">{ev.name}</p>
            <ul className="space-y-3">
              {ev.roles.map((role) => (
                <li key={role} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--muted)] flex-shrink-0" />
                  <span className="text-[var(--muted)] text-sm font-sans">{role}</span>
                </li>
              ))}
            </ul>
          </div>
          {ev.image && (
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative w-full md:w-80 h-56 rounded-2xl overflow-hidden shrink-0 border border-[var(--border)] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all"
            >
              <Image src={ev.image} alt={ev.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
            </motion.div>
          )}
        </div>
      ))}
    </RevealSection>
  );
}

// ─── Beyond Coding ────────────────────────────────────────────

const BEYOND = [
  { title: "Bharatanatyam", level: "3 years of training" },
  { title: "Calligraphy", level: "Elementary & Intermediate (A+ grades)" },
  { title: "Lettering", level: "Elementary & Intermediate (A+ grades)" },
];

export function BeyondCodingSection() {
  return (
    <RevealSection id="beyond">
      <ParallaxText text="Creative" speed={1} />
      <div className="flex items-center gap-3 mb-14">
        <Palette className="w-7 h-7 text-[var(--muted)]" />
        <SectionHeading>Beyond Coding</SectionHeading>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {BEYOND.map((item, i) => (
          <motion.div
            key={item.title}
            whileHover={{ y: -6, scale: 1.04, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-7 hover:border-[var(--accent)]/50 hover:shadow-[0_15px_40px_rgba(230,57,70,0.2)] transition-shadow relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="font-bold text-[var(--fg)] text-lg font-sans mb-2 group-hover:text-[var(--accent)] transition-colors">{item.title}</p>
              <p className="text-[var(--muted)] font-mono text-xs tracking-wide">{item.level}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Footer ───────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-secondary)] text-[var(--muted)] border-t border-[var(--border)] py-10 text-center font-mono text-xs uppercase tracking-[0.2em]">
      <p>&copy; {new Date().getFullYear()} Gayatri Swami — Built with Next.js &amp; Framer Motion.</p>
    </footer>
  );
}
