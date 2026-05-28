"use client";
import React from "react";
import { LandingNav } from "../components/landing/LandingNav";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingStats, LandingHowItWorks, LandingFeatures, LandingCTA } from "../components/landing/LandingSections";
import { LandingFooter } from "../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
      <LandingNav />
      <LandingHero />
      <LandingStats />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}

