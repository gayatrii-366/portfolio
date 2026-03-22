"use client";

import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';


const useTypingEffect = (text: string, speed: number = 80) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText };
};

// Line-by-line staggered animation config
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between lines
      delayChildren: 0.9,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  },
};

export default function RightPanel() {
  const { displayedText } = useTypingEffect("<About Me>");

  return (
    <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[var(--bg-panel)] flex flex-col items-start justify-center p-8 lg:p-20 relative overflow-hidden flex-1">
      <div className="max-w-xl w-full">
        {/* Typing heading */}
        <h2 className="font-mono text-3xl lg:text-5xl font-bold tracking-tight text-[var(--fg)] mb-8 flex items-center min-h-[2em]">
          {displayedText}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="inline-block ml-1 w-[3px] lg:w-[4px] h-[1em] bg-[var(--fg)]"
          />
        </h2>

        {/* About text — Line by line fade in */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="font-sans text-[var(--muted)] text-base lg:text-lg leading-relaxed mb-12 font-light space-y-4"
        >
          <motion.p variants={itemVariants}>
            AI Developer with a strong interest in solving real-world problems through intelligent systems.
          </motion.p>
          <motion.p variants={itemVariants}>
            Pursuing an Integrated B.Tech in AI &amp; Deep Learning at MIT-WPU, Pune. Driven by curiosity, creativity, and meaningful impact — one model at a time.
          </motion.p>
          <motion.p variants={itemVariants} className="font-medium text-[var(--fg)] mt-6 text-sm uppercase tracking-widest pl-4 relative">
            <span className="absolute left-0 top-1 w-1 h-3 bg-[var(--fg)] rounded-full"></span>
            Always curious, always building.
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
          className="flex flex-row gap-4 w-full"
        >
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[var(--accent)] text-white rounded-xl py-4 flex items-center justify-center font-sans font-medium tracking-wide hover:-translate-y-1 hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all duration-300 ease-out interactive"
          >
            Resume
          </a>

          <Link
            href="/portfolio"
            className="flex-1 bg-transparent text-[var(--fg)] border border-[var(--border)] rounded-xl py-4 flex items-center justify-center font-sans font-medium tracking-wide hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-300 ease-out interactive"
          >
            Portfolio
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
