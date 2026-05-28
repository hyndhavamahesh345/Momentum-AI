import React from "react";
import { Zap } from "lucide-react";

export function LandingNav() {
  return (
    <nav className="border-b border-[#e8e8e8] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#ff6600] rounded flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-[#1a1a1a]">
            Momentum AI
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#how"
            className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
          >
            Features
          </a>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="text-sm font-semibold text-[#ff6600] hover:underline transition-all"
          >
            Open dashboard →
          </button>
        </div>
      </div>
    </nav>
  );
}
