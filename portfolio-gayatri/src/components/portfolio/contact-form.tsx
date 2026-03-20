"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitContact } from "@/lib/api";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--fg)] transition-colors font-sans w-full";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setFeedback("");
    try {
      const res = await submitContact(form);
      if (res.success) {
        setStatus("success");
        setFeedback(res.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setFeedback(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setFeedback("Could not reach the server. Make sure the backend is running.");
    }
  };

  return (
    <section id="contact" className="relative py-24 lg:py-40 w-full max-w-7xl mx-auto px-6">
      <h2 className="text-3xl lg:text-5xl font-sans font-bold mb-3 text-[var(--fg)] tracking-tight">Get in Touch</h2>
      <p className="text-[var(--muted)] mb-14 font-sans text-base font-light">
        Have a project idea or a collaboration in mind? Drop a message.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Name</label>
            <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">Message</label>
          <textarea id="message" name="message" rows={5} required value={form.message} onChange={handleChange} placeholder="Tell me about your project..." className={`${inputClass} resize-none`} />
        </div>

        <motion.button
          type="submit"
          disabled={status === "sending"}
          whileHover={{ scale: status === "sending" ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[var(--fg)] text-[var(--bg)] py-4 rounded-xl font-sans font-medium tracking-wide flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full inline-block"
              />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans border ${
                status === "success"
                  ? "bg-[var(--fg)] text-[var(--bg)] border-transparent"
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
              }`}
            >
              {status === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}
