import CanvasScroll from "@/components/portfolio/canvas-scroll";
import {
  SkillsSection,
  ProjectsSection,
  EducationSection,
  ExperienceSection,
  VolunteeringSection,
  BeyondCodingSection,
  Footer,
} from "@/components/portfolio/sections";
import MessageSection from "@/components/portfolio/message-section";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Portfolio() {
  return (
    <main className="min-h-screen w-full bg-[var(--bg)] font-sans">
      {/* Back to home */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] px-4 py-2.5 rounded-xl text-sm font-mono tracking-wide shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Canvas hero */}
      <CanvasScroll />

      {/* Sections */}
      <div className="relative z-10 bg-[var(--bg)] flex flex-col items-center divide-y divide-[var(--border)]">
        <SkillsSection />
        <ProjectsSection />
        <EducationSection />
        <ExperienceSection />
        <VolunteeringSection />
        <BeyondCodingSection />
        <div className="w-full flex justify-center py-12">
          <MessageSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}
