import React from "react";
import { Zap } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-[#e8e8e8] bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#ff6600] rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-black text-sm text-[#1a1a1a]">
            Momentum AI
          </span>
          <span className="text-[#aaa] text-sm">
            — AI Execution OS · 2026
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#666]">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="hover:text-[#ff6600] transition-colors"
          >
            Dashboard
          </button>
          <a
            href="#features"
            className="hover:text-[#ff6600] transition-colors"
          >
            Features
          </a>
          <a href="#how" className="hover:text-[#ff6600] transition-colors">
            How it works
          </a>
        </div>
      </div>
    </footer>
  );
}
