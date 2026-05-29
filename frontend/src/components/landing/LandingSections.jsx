import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { STATS, FEATURES, HOW_IT_WORKS } from "./constants";

export function LandingStats() {
  return (
    <section className="border-y border-[#e8e8e8] bg-[#f7f7f7]">
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 divide-x divide-[#e8e8e8]">
        {STATS.map((s) => (
          <div key={s.label} className="text-center px-4">
            <div className="text-3xl font-black text-[#ff6600] mb-1">
              {s.value}
            </div>
            <div className="text-sm text-[#666]">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how" className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <div className="text-xs font-black uppercase tracking-widest text-[#ff6600] mb-3">
          How it works
        </div>
        <h2 className="text-3xl font-black text-[#1a1a1a]">
          Three steps to full execution clarity
        </h2>
      </div>
      <div className="space-y-0">
        {HOW_IT_WORKS.map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-8 py-8 border-b border-[#e8e8e8] last:border-0"
          >
            <div className="text-4xl font-black text-[#e8e8e8] leading-none shrink-0 w-12">
              {item.step}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                {item.title}
              </h3>
              <p className="text-[#666] leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="bg-[#f7f7f7] border-y border-[#e8e8e8]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="text-xs font-black uppercase tracking-widest text-[#ff6600] mb-3">
            Features
          </div>
          <h2 className="text-3xl font-black text-[#1a1a1a]">
            Not a todo app. An execution OS.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e8e8e8]">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white p-7 hover:bg-[#fff3ea] transition-colors group"
              >
                <div className="w-9 h-9 bg-[#fff3ea] group-hover:bg-[#ffd5b0] rounded flex items-center justify-center mb-5 transition-colors">
                  <Icon className="w-5 h-5 text-[#ff6600]" />
                </div>
                <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="border-l-4 border-[#ff6600] pl-8">
          <p className="text-2xl font-black text-[#1a1a1a] leading-snug mb-4">
            "Most productivity tools are passive.
            <br />
            Momentum AI is proactive."
          </p>
          <p className="text-[#666] text-base leading-relaxed max-w-2xl">
            ChatGPT generates a plan once. Momentum AI becomes your persistent
            execution intelligence — adapting your roadmap in real-time,
            detecting blockers before you do, and pushing you forward when you
            stall.
          </p>
        </div>
      </section>

      <section className="bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-black mb-4 leading-tight">
            Your next milestone is
            <br />
            <span className="text-[#ff6600]">one input away.</span>
          </h2>
          <p className="text-[#aaa] mb-10 text-base">
            Enter a goal. Get a system. Start executing in under 60 seconds.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff6600] text-white font-bold rounded text-base hover:bg-[#e55a00] transition-colors"
          >
            Build my execution system <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </>
  );
}
