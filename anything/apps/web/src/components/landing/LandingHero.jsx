import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MOCK_USER_ID, EXAMPLE_GOALS } from "./constants";

export function LandingHero() {
  const [goalInput, setGoalInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRoadmap = async () => {
    if (!goalInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/goals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalInput, userId: MOCK_USER_ID }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      if (data.goalId) {
        toast.success("Execution system ready.");
        if (typeof window !== "undefined") {
          window.location.href = `/dashboard/${data.goalId}`;
        }
      } else {
        toast.error(data.error || "Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Goal generation error:", err);
      toast.error(err.message || "Failed to generate. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fff3ea] border border-[#ffd5b0] rounded text-xs font-semibold text-[#ff6600] mb-8 uppercase tracking-wide">
          <Zap className="w-3 h-3" /> AI Execution Operating System
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1a1a1a] leading-[1.05] mb-6">
          Stop planning.
          <br />
          <span className="text-[#ff6600]">Start executing.</span>
        </h1>

        <p className="text-lg text-[#555] max-w-2xl mx-auto leading-relaxed mb-12">
          Momentum AI turns any goal into a complete execution system —
          milestones, tasks, priorities, and a live AI Chief of Staff that
          adapts your plan as you work.
        </p>
      </motion.div>

      {/* ── Goal Input ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white border-2 border-[#1a1a1a] rounded-xl shadow-[4px_4px_0px_#1a1a1a]">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
            placeholder="e.g. Launch a SaaS startup in 30 days..."
            className="flex-1 px-4 py-3 text-base outline-none bg-transparent placeholder:text-[#aaa] text-[#1a1a1a]"
          />
          <button
            onClick={generateRoadmap}
            disabled={isGenerating || !goalInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6600] text-white font-bold rounded-lg text-sm hover:bg-[#e55a00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 spin-anim" /> Building...
              </>
            ) : (
              <>
                Build System <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXAMPLE_GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoalInput(g)}
              className="text-xs px-3 py-1.5 bg-[#f7f7f7] border border-[#e8e8e8] rounded-full text-[#555] hover:border-[#ff6600] hover:text-[#ff6600] transition-all"
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim { animation: spin 0.8s linear infinite; }
      `}</style>
    </section>
  );
}
