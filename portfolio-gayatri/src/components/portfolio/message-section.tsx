"use client";

import { motion } from "framer-motion";

export default function MessageSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-4xl py-24 flex flex-col items-center justify-center text-center px-6"
    >
      <p className="font-sans text-[var(--fg)] text-lg lg:text-xl font-medium tracking-wide mb-4">
        Thanks for visiting.
      </p>
      <p className="font-sans text-[var(--muted)] text-base lg:text-lg font-light leading-relaxed">
        If you&apos;d like to connect, feel free to reach out through my socials.
      </p>
    </motion.div>
  );
}
