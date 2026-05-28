import { Brain, Target, TrendingUp, RotateCcw, Activity, CheckCircle } from "lucide-react";

export const MOCK_USER_ID = "user_hackathon_2026";

export const EXAMPLE_GOALS = [
  "Launch a SaaS startup in 30 days",
  "Crack Google SDE interview in 60 days",
  "Grow YouTube channel to 10k subscribers",
  "Learn AI Engineering from scratch",
];

export const STATS = [
  { value: "2,400+", label: "Execution systems built" },
  { value: "87%", label: "Goal completion rate" },
  { value: "4.2×", label: "Faster than manual planning" },
];

export const FEATURES = [
  {
    icon: Brain,
    title: "AI Planning Agent",
    description:
      "Decomposes any goal into logical milestones and high-impact tasks — automatically. No more staring at a blank page.",
  },
  {
    icon: Target,
    title: "Smart Prioritization",
    description:
      "Ranks your work by impact, urgency, and dependencies. Always know what to do next.",
  },
  {
    icon: TrendingUp,
    title: "Momentum Scoring",
    description:
      "A live score (0–100) that measures consistency, velocity, and prioritization quality — not just task count.",
  },
  {
    icon: RotateCcw,
    title: "Adaptive Replanning",
    description:
      "When you fall behind, the AI automatically reprioritizes your queue and gives you a recovery strategy.",
  },
  {
    icon: Activity,
    title: "Execution Analytics",
    description:
      "Trajectory charts, velocity graphs, and behavioral DNA — so you can see exactly how you execute.",
  },
  {
    icon: CheckCircle,
    title: "Accountability Agent",
    description:
      "Detects inactivity and momentum drops proactively. Nudges you before you fall behind, not after.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Enter your goal",
    description:
      "Type anything. A startup, a skill, a career move. The AI understands context, complexity, and urgency.",
  },
  {
    step: "02",
    title: "Get your execution system",
    description:
      "A full roadmap — milestones, tasks, priorities, time estimates — generated in seconds.",
  },
  {
    step: "03",
    title: "Execute with AI guidance",
    description:
      "Mark tasks done. Your momentum score updates. The AI adapts the plan to match your real-world execution.",
  },
];
