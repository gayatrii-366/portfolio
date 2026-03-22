"use client";

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Twitter, Linkedin, Copy, Check, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

const SOCIALS = [
  { Icon: Instagram, href: "https://www.instagram.com/gayatrily", label: "Instagram" },
  { Icon: Twitter, href: "https://x.com/gayatrii_366", label: "X" },
  { Icon: Linkedin, href: "https://www.linkedin.com/in/gayatri-swami-29aa80369", label: "LinkedIn" },
  { Icon: Github, href: "https://github.com/gayatrii-366", label: "GitHub" },
];

const EMAILS = ["gayatriswami73@gmail.com", "gayatri.swami@mitwpu.edu.in"];

export default function LeftPanel() {
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [greeting, setGreeting] = useState("Hello 👋");

  const handleCopy = (email: string, index: number) => {
    navigator.clipboard.writeText(email);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
      setShowEmailDropdown(false);
    }, 2000);
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmailDropdown(false);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-visible flex-1 border-b md:border-b-0 md:border-r border-[var(--border)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center z-10 w-full max-w-sm"
      >
        {/* Profile Image */}
        <div className="relative w-44 h-44 lg:w-56 lg:h-56 mb-6 group">
          <Image
            src="/profile.jpeg"
            alt="Gayatri Swami"
            fill
            className="object-cover rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-[1.02]"
            priority
          />
        </div>

        {/* Dynamic Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-3"
        >
          {greeting}
        </motion.p>

        {/* Name */}
        <h1 className="font-mono text-2xl lg:text-3xl font-bold uppercase tracking-[0.18em] text-[var(--fg)] mb-2">
          &lt;GAYATRI SWAMI&gt;
        </h1>

        {/* Role */}
        <p className="font-sans text-[var(--muted)] text-sm lg:text-base tracking-wide mb-9 font-light flex items-center gap-2">
          AI Developer <span className="text-xs border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">she/her</span>
        </p>

        {/* Email Button + Dropdown */}
        <div className="relative w-full flex justify-center mb-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowEmailDropdown(!showEmailDropdown);
            }}
            className="bg-[var(--accent)] text-white px-9 py-3.5 rounded-xl text-sm font-medium tracking-wide shadow-lg transition-all shadow-[var(--accent)]/10 hover:bg-[var(--accent-hover)] hover:shadow-[var(--accent)]/20 interactive"
          >
            Email me
          </motion.button>

          <AnimatePresence>
            {showEmailDropdown && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEmailDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10, originY: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-full mt-3 w-[270px] bg-[var(--bg)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    {EMAILS.map((email, i) => (
                      <button
                        key={email}
                        onClick={() => handleCopy(email, i)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all interactive ${
                          copiedIndex === i
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "hover:bg-[var(--bg-secondary)] text-[var(--fg)]"
                        }`}
                      >
                        <span className="truncate mr-2 font-mono text-xs font-semibold tracking-tight">
                          {copiedIndex === i ? "Copied ✓" : email}
                        </span>
                        {copiedIndex === i ? (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <Copy className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Social Icons */}
        <div className="flex items-center space-x-6 text-[var(--muted)]">
          {SOCIALS.map(({ Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="opacity-75 hover:opacity-100 hover:text-[var(--accent)] transition-all duration-300 interactive"
            >
              <Icon className="w-5 h-5 stroke-[1.5]" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
