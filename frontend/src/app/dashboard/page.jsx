"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  ArrowLeft,
  Flame,
  Activity,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
  Timer,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  CheckCircle,
  Plus,
  ExternalLink,
  Youtube,
  FileText,
  Wrench,
  BookOpen,
  Trash2,
  Heart,
  Shield,
  MessageSquare,
  RefreshCw,
  Calendar,
  Send,
  X,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";

import { useAuth } from "@/store/auth";
import { apiFetch } from "@/lib/api";

// ─── Momentum Ring ─────────────────────────────────────────────────────────────
function MomentumRing({ score, size = 72 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 70
      ? "#16a34a"
      : score >= 45
        ? "#ff6600"
        : score >= 25
          ? "#d97706"
          : "#dc2626";
  const label =
    score >= 70
      ? "Strong"
      : score >= 45
        ? "Building"
        : score >= 25
          ? "At Risk"
          : "Critical";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="7"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1a1a1a"
          fontSize={size < 80 ? "14" : "17"}
          fontWeight="900"
        >
          {Math.round(score)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 11}
          textAnchor="middle"
          fill="#aaa"
          fontSize="8"
        >
          /100
        </text>
      </svg>
      <span
        className="text-[9px] font-black uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-all ${
        active
          ? "bg-[#fff3ea] text-[#ff6600] font-bold"
          : "text-[#555] hover:bg-[#f7f7f7] hover:text-[#1a1a1a]"
      }`}
    >
      {React.cloneElement(icon, { size: 16 })}
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-[#ff6600] text-white" : "bg-[#e8e8e8] text-[#888]"}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Resource Link ────────────────────────────────────────────────────────────
function ResourceLink({ resource }) {
  const cfgs = {
    video: {
      icon: Youtube,
      bg: "bg-[#fef2f2]",
      text: "text-red-600",
      border: "border-[#fecaca]",
      label: "Video",
    },
    article: {
      icon: FileText,
      bg: "bg-[#fff3ea]",
      text: "text-[#ff6600]",
      border: "border-[#ffd5b0]",
      label: "Article",
    },
    docs: {
      icon: BookOpen,
      bg: "bg-[#f0f7ff]",
      text: "text-[#2563eb]",
      border: "border-[#bfdbfe]",
      label: "Docs",
    },
    tool: {
      icon: Wrench,
      bg: "bg-[#f5f0ff]",
      text: "text-[#7c3aed]",
      border: "border-[#e9d5ff]",
      label: "Tool",
    },
  };
  const cfg = cfgs[resource.type] || cfgs.article;
  const Icon = cfg.icon;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-semibold transition-all hover:opacity-80 ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={10} />
      <span className="truncate max-w-[120px]">{resource.title}</span>
      <ExternalLink size={9} className="shrink-0 opacity-60" />
    </a>
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle }) {
  const [showResources, setShowResources] = useState(false);
  const done = task.status === "completed";
  const pColor = { high: "#dc2626", medium: "#ff6600", low: "#888" };
  const pBg = { high: "#fef2f2", medium: "#fff3ea", low: "#f7f7f7" };
  const resources = Array.isArray(task.resources) ? task.resources : [];

  return (
    <div
      className={`border rounded-lg transition-all overflow-hidden ${
        done
          ? "bg-[#f9fdf9] border-[#d1fae5] opacity-70"
          : "bg-white border-[#e8e8e8] hover:border-[#ff6600]/40"
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span
            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: pBg[task.priority] || pBg.medium,
              color: pColor[task.priority] || pColor.medium,
            }}
          >
            {task.priority}
          </span>
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              done
                ? "bg-[#16a34a] border-[#16a34a]"
                : "border-[#ccc] hover:border-[#ff6600]"
            }`}
          >
            {done && (
              <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
            )}
          </button>
        </div>
        <h4
          className={`text-sm font-semibold mb-1 ${done ? "line-through text-[#aaa]" : "text-[#1a1a1a]"}`}
        >
          {task.title}
        </h4>
        <p className="text-xs text-[#999] line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          {task.impact_score && (
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-[#ff6600]" />
              <span className="text-[10px] text-[#ff6600] font-bold">
                Impact {task.impact_score}/10
              </span>
            </div>
          )}
          {resources.length > 0 && (
            <button
              onClick={() => setShowResources((v) => !v)}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors ml-auto"
            >
              <BookOpen size={10} />
              {resources.length} resource{resources.length !== 1 ? "s" : ""}
              {showResources ? (
                <ChevronUp size={9} />
              ) : (
                <ChevronDown size={9} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Resources Panel */}
      <AnimatePresence>
        {showResources && resources.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 border-t border-[#f0f0f0] bg-[#fafafa]">
              <div className="text-[9px] font-black text-[#bbb] uppercase tracking-widest mb-2">
                Learning Resources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resources.map((r, i) => (
                  <ResourceLink key={i} resource={r} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Breakdown Panel ──────────────────────────────────────────────────────────
function BreakdownPanel({ breakdown }) {
  if (!breakdown) return null;
  const rows = [
    {
      label: "Completion Rate",
      value: breakdown.completionRate ?? 0,
      max: 40,
      color: "#16a34a",
    },
    {
      label: "Priority Focus",
      value: breakdown.priorityAccuracy ?? 0,
      max: 25,
      color: "#ff6600",
    },
    {
      label: "Consistency",
      value: breakdown.consistencyScore ?? 0,
      max: 20,
      color: "#d97706",
    },
    {
      label: "Velocity (7d)",
      value: breakdown.velocityScore ?? 0,
      max: 15,
      color: "#7c3aed",
    },
  ];
  return (
    <div className="bg-[#f7f7f7] border border-[#e8e8e8] rounded-lg p-4 space-y-3">
      <div className="text-[9px] font-black uppercase tracking-widest text-[#aaa] mb-3">
        Momentum Breakdown
      </div>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#555]">{r.label}</span>
            <span className="font-bold text-[#1a1a1a]">
              {r.value} <span className="text-[#ccc]">/ {r.max}</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / r.max) * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: r.color }}
            />
          </div>
        </div>
      ))}
      {(breakdown.inactivityPenalty || 0) > 0 && (
        <div className="pt-2 border-t border-[#e8e8e8] flex justify-between text-xs text-red-600">
          <span>Inactivity penalty</span>
          <span className="font-bold">−{breakdown.inactivityPenalty}</span>
        </div>
      )}
      {breakdown.streak > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#d97706] font-bold pt-1">
          <Flame size={11} /> {breakdown.streak}-day streak active
        </div>
      )}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
function AlertBanner({ alerts, onReplan }) {
  const [gone, setGone] = useState(false);
  if (!alerts?.length || gone) return null;
  const a = alerts[0];
  const cfg = {
    inactivity: {
      icon: Timer,
      border: "border-[#fed7aa]",
      bg: "bg-[#fff7ed]",
      text: "text-[#d97706]",
      tag: "INACTIVITY",
    },
    momentum: {
      icon: ShieldAlert,
      border: "border-[#fecaca]",
      bg: "bg-[#fff5f5]",
      text: "text-red-600",
      tag: "CRITICAL",
    },
    overdue: {
      icon: AlertTriangle,
      border: "border-[#fed7aa]",
      bg: "bg-[#fffbea]",
      text: "text-[#d97706]",
      tag: "OVERDUE",
    },
  }[a.type] || {
    icon: AlertTriangle,
    border: "border-[#e8e8e8]",
    bg: "bg-[#f7f7f7]",
    text: "text-[#555]",
    tag: "ALERT",
  };
  const Icon = cfg.icon;
  return (
    <div
      className={`mx-6 mt-4 flex items-center gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}
    >
      <Icon size={16} className={cfg.text} />
      <div className="flex-1 min-w-0">
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${cfg.text}`}
        >
          {cfg.tag}
        </span>
        <p className="text-sm text-[#333] leading-tight mt-0.5">{a.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onReplan}
          className="text-xs font-bold px-3 py-1.5 bg-[#1a1a1a] text-white rounded hover:bg-[#333] transition-colors"
        >
          Auto-Replan
        </button>
        <button
          onClick={() => setGone(true)}
          className="text-[#ccc] hover:text-[#888] text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ insight, idx }) {
  const cfgs = {
    strategy: {
      label: "STRATEGY",
      color: "#ff6600",
      bg: "#fff3ea",
      border: "#ffd5b0",
      icon: Lightbulb,
    },
    blocker: {
      label: "BLOCKER",
      color: "#dc2626",
      bg: "#fff5f5",
      border: "#fecaca",
      icon: AlertTriangle,
    },
    recovery: {
      label: "RECOVERY",
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
      icon: RotateCcw,
    },
    momentum: {
      label: "MOMENTUM",
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#d1fae5",
      icon: TrendingUp,
    },
    warning: {
      label: "WARNING",
      color: "#d97706",
      bg: "#fffbea",
      border: "#fed7aa",
      icon: AlertTriangle,
    },
  };
  const cfg = cfgs[insight.insight_type] || cfgs.strategy;
  const Icon = cfg.icon;
  const dot = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (idx || 0) * 0.06 }}
      className="p-4 rounded-lg border flex gap-3"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div
        className="w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 bg-white border"
        style={{ borderColor: cfg.border }}
      >
        <Icon size={14} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: dot[insight.urgency] || dot.medium }}
          />
          <span className="text-[9px] text-[#aaa] uppercase">
            {insight.urgency || "medium"} urgency
          </span>
        </div>
        <p className="text-sm text-[#333] leading-relaxed">{insight.content}</p>
      </div>
    </motion.div>
  );
}

// ─── Replan Panel ─────────────────────────────────────────────────────────────
function ReplanPanel({ replan, onDismiss }) {
  if (!replan) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-[#faf5ff] border border-[#e9d5ff] rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[9px] font-black text-[#7c3aed] tracking-widest mb-1 uppercase">
            Adaptive Replan Complete
          </div>
          <p className="text-sm font-semibold text-[#1a1a1a]">
            {replan.summary}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#ccc] hover:text-[#888] ml-4"
        >
          ✕
        </button>
      </div>
      {replan.recovery_actions?.length > 0 && (
        <ol className="space-y-1.5 mt-3">
          {replan.recovery_actions.map((a, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#444]">
              <span className="text-[#7c3aed] font-bold shrink-0">
                {i + 1}.
              </span>{" "}
              {a}
            </li>
          ))}
        </ol>
      )}
      {replan.estimated_recovery_days && (
        <div className="flex items-center gap-2 mt-3 text-xs text-[#888]">
          <Clock size={11} /> Recovery in ~{replan.estimated_recovery_days} day
          {replan.estimated_recovery_days !== 1 ? "s" : ""}
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────

// ─── Execution Health Dashboard ───────────────────────────────────────────────
function ExecutionHealth({ goal }) {
  if (!goal) return null;
  const momentum = Number(goal.momentum_score || 0);
  const streak = goal.execution_streak || 0;
  const tasks = goal.tasks || [];
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length;
  const daysSinceActive = goal.last_active_at
    ? Math.floor((Date.now() - new Date(goal.last_active_at).getTime()) / 86400000)
    : 999;

  const indicators = [
    {
      label: "Momentum",
      status: momentum >= 70 ? "green" : momentum >= 40 ? "yellow" : "red",
      detail: `${momentum.toFixed(0)}/100`,
    },
    {
      label: "Timeline Risk",
      status: overdue === 0 ? "green" : overdue <= 2 ? "yellow" : "red",
      detail: overdue === 0 ? "On track" : `${overdue} overdue`,
    },
    {
      label: "Consistency",
      status: streak >= 3 ? "green" : streak >= 1 ? "yellow" : "red",
      detail: streak > 0 ? `${streak}d streak` : "No streak",
    },
    {
      label: "Activity",
      status: daysSinceActive <= 1 ? "green" : daysSinceActive <= 3 ? "yellow" : "red",
      detail: daysSinceActive === 0 ? "Today" : daysSinceActive === 1 ? "Yesterday" : `${daysSinceActive}d ago`,
    },
  ];

  const colors = {
    green: { dot: "#16a34a", bg: "#f0fdf4", border: "#d1fae5" },
    yellow: { dot: "#d97706", bg: "#fffbea", border: "#fed7aa" },
    red: { dot: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  };

  const overall = indicators.filter(i => i.status === "red").length >= 2 ? "critical"
    : indicators.filter(i => i.status === "red").length >= 1 ? "at-risk"
    : indicators.filter(i => i.status === "yellow").length >= 2 ? "moderate"
    : "healthy";

  const overallConfig = {
    healthy: { label: "Healthy", color: "#16a34a", bg: "#f0fdf4" },
    moderate: { label: "Moderate", color: "#d97706", bg: "#fffbea" },
    "at-risk": { label: "At Risk", color: "#d97706", bg: "#fff3ea" },
    critical: { label: "Critical", color: "#dc2626", bg: "#fef2f2" },
  }[overall];

  return (
    <div className="bg-[#f7f7f7] border border-[#e8e8e8] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[9px] font-black uppercase tracking-widest text-[#aaa]">
          Execution Health
        </div>
        <span
          className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ background: overallConfig.bg, color: overallConfig.color }}
        >
          {overallConfig.label}
        </span>
      </div>
      <div className="space-y-1.5">
        {indicators.map((ind) => {
          const c = colors[ind.status];
          return (
            <div
              key={ind.label}
              className="flex items-center gap-2 px-2 py-1.5 rounded"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}40` }}
              />
              <span className="text-[11px] font-semibold text-[#333] flex-1">{ind.label}</span>
              <span className="text-[10px] font-bold" style={{ color: c.dot }}>{ind.detail}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Success Probability Gauge ────────────────────────────────────────────────
function SuccessProbabilityGauge({ probability, confidence, strengths, risks, recommendation, loading, onRefresh }) {
  const pct = probability || 0;
  const gaugeColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#ff6600" : pct >= 30 ? "#d97706" : "#dc2626";
  const label = pct >= 75 ? "High" : pct >= 50 ? "Moderate" : pct >= 30 ? "Low" : "Critical";
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <motion.div
      key="probability"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-3xl mx-auto w-full space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-[#1a1a1a] text-lg">Success Probability</h3>
          <p className="text-xs text-[#999]">AI-predicted likelihood of achieving this goal</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <><Loader2 size={13} className="yc-spin" /> Analyzing...</>
          ) : (
            <><Shield size={13} /> Refresh Score</>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-16 justify-center text-[#999] text-sm">
          <Loader2 className="w-4 h-4 yc-spin" /> Probability Engine analyzing execution data...
        </div>
      )}

      {!loading && probability != null && (
        <>
          {/* Gauge */}
          <div className="bg-white border border-[#e8e8e8] rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <svg width="170" height="170" viewBox="0 0 170 170">
                <circle cx="85" cy="85" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
                <motion.circle
                  cx="85" cy="85" r={r} fill="none"
                  stroke={gaugeColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  transform="rotate(-90 85 85)"
                />
                <text x="85" y="78" textAnchor="middle" dominantBaseline="middle" fill="#1a1a1a" fontSize="36" fontWeight="900">
                  {pct}%
                </text>
                <text x="85" y="102" textAnchor="middle" fill={gaugeColor} fontSize="11" fontWeight="800">
                  {label}
                </text>
              </svg>
              {confidence && (
                <span className="text-[9px] font-black uppercase tracking-widest text-[#bbb]">
                  {confidence} confidence
                </span>
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              {/* Strengths */}
              {strengths?.length > 0 && (
                <div>
                  <div className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest mb-2">Strengths</div>
                  <div className="space-y-1.5">
                    {strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#333]">
                        <CheckCircle size={14} className="text-[#16a34a] shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risks */}
              {risks?.length > 0 && (
                <div>
                  <div className="text-[9px] font-black text-[#d97706] uppercase tracking-widest mb-2">Risks</div>
                  <div className="space-y-1.5">
                    {risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#333]">
                        <AlertTriangle size={14} className="text-[#d97706] shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <div className="p-4 bg-[#f0f7ff] border border-[#bfdbfe] rounded-xl flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#bfdbfe] flex items-center justify-center shrink-0">
                <Lightbulb size={15} className="text-[#2563eb]" />
              </div>
              <div>
                <div className="text-[9px] font-black text-[#2563eb] uppercase tracking-widest mb-1">AI Recommendation</div>
                <p className="text-sm text-[#333] leading-relaxed">{recommendation}</p>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && probability == null && (
        <div className="text-center py-14 bg-white border border-[#e8e8e8] rounded-xl">
          <div className="w-10 h-10 bg-[#fff3ea] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-5 h-5 text-[#ff6600]" />
          </div>
          <p className="font-bold text-[#1a1a1a] mb-1">No probability score yet</p>
          <p className="text-sm text-[#888] mb-5">Generate your AI-predicted success likelihood.</p>
          <button
            onClick={onRefresh}
            className="px-5 py-2.5 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] transition-colors"
          >
            Calculate Probability →
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Recovery Plan Panel ──────────────────────────────────────────────────────
function RecoveryPlanPanel({ recovery, loading, onRecover, onDismiss }) {
  return (
    <div className="space-y-4">
      {!recovery && !loading && (
        <div className="p-5 bg-gradient-to-r from-[#fef2f2] to-[#fff7ed] border border-[#fecaca] rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl border border-[#fecaca] flex items-center justify-center shrink-0">
              <RefreshCw size={18} className="text-[#dc2626]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#1a1a1a] text-sm mb-1">Momentum Recovery Engine</div>
              <p className="text-xs text-[#888] leading-relaxed mb-3">
                AI analyzes your execution gaps, reprioritizes tasks, and creates a focused day-by-day recovery plan.
              </p>
              <button
                onClick={onRecover}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white text-xs font-bold rounded hover:bg-[#b91c1c] transition-colors"
              >
                <RefreshCw size={12} /> 🚨 Recover Momentum
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-10 justify-center text-[#999] text-sm bg-white border border-[#e8e8e8] rounded-xl">
          <Loader2 className="w-4 h-4 yc-spin" /> Recovery Engine diagnosing execution state...
        </div>
      )}

      {recovery && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-[#fef2f2] to-[#fff3ea] border-b border-[#fecaca]">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[9px] font-black text-[#dc2626] tracking-widest mb-1 uppercase">
                  🚨 Recovery Plan Generated
                </div>
                <p className="text-sm font-bold text-[#1a1a1a]">{recovery.diagnosis}</p>
              </div>
              <button onClick={onDismiss} className="text-[#ccc] hover:text-[#888] ml-4">✕</button>
            </div>
          </div>

          {/* Quick Win */}
          {recovery.quickWin && (
            <div className="mx-5 mt-4 p-3 bg-[#f0fdf4] border border-[#d1fae5] rounded-lg flex gap-2">
              <Zap size={14} className="text-[#16a34a] shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest mb-0.5">Quick Win (15 min)</div>
                <p className="text-sm text-[#333]">{recovery.quickWin}</p>
              </div>
            </div>
          )}

          {/* Day-by-day plan */}
          <div className="p-5 space-y-3">
            <div className="text-[9px] font-black text-[#aaa] uppercase tracking-widest">Recovery Timeline</div>
            {recovery.recoveryPlan?.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#ff6600] text-white text-[10px] font-black flex items-center justify-center">
                    D{day.day}
                  </div>
                  {i < (recovery.recoveryPlan.length - 1) && (
                    <div className="w-px flex-1 bg-[#e8e8e8] mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="font-semibold text-sm text-[#1a1a1a] mb-1">{day.focus}</div>
                  <div className="space-y-1">
                    {day.tasks?.map((task, ti) => (
                      <div key={ti} className="flex items-start gap-1.5 text-xs text-[#555]">
                        <ChevronRight size={10} className="text-[#ff6600] shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#f7f7f7] border-t border-[#e8e8e8] flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-[#888]">
              <span className="flex items-center gap-1"><Clock size={11} /> ~{recovery.estimatedRecoveryDays}d recovery</span>
              <span className="flex items-center gap-1">
                <ArrowUpRight size={11} className="text-[#16a34a]" />
                <span className="font-bold text-[#16a34a]">{recovery.projectedMomentum}</span>/100 projected
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Daily Check-In Modal ─────────────────────────────────────────────────────
function DailyCheckInModal({ open, onClose, goalId, userId, goalTitle }) {
  const [step, setStep] = useState("form"); // form | loading | report
  const [accomplished, setAccomplished] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [report, setReport] = useState(null);

  const handleSubmit = async () => {
    setStep("loading");
    try {
      const r = await apiFetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, accomplished, blockers, nextSteps }),
      });
      if (!r.ok) throw new Error("Check-in failed");
      const data = await r.json();
      setReport(data);
      setStep("report");
    } catch {
      setStep("form");
    }
  };

  const handleClose = () => {
    setStep("form");
    setAccomplished("");
    setBlockers("");
    setNextSteps("");
    setReport(null);
    onClose();
  };

  if (!open) return null;

  const riskColors = { low: "#16a34a", medium: "#d97706", high: "#dc2626" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e8e8e8] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#fff3ea] rounded-lg flex items-center justify-center">
              <Calendar size={16} className="text-[#ff6600]" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#1a1a1a]">Daily Check-In</div>
              <div className="text-[10px] text-[#bbb]">{goalTitle}</div>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-[#f7f7f7] rounded transition-colors">
            <X size={16} className="text-[#999]" />
          </button>
        </div>

        {/* Form */}
        {step === "form" && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-1.5">
                What did you accomplish today?
              </label>
              <textarea
                value={accomplished}
                onChange={e => setAccomplished(e.target.value)}
                placeholder="Finished the API endpoints, wrote unit tests..."
                className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder-[#ccc] focus:outline-none focus:border-[#ff6600] transition-colors resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-1.5">
                What blocked you?
              </label>
              <textarea
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                placeholder="Deployment issues, unclear requirements..."
                className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder-[#ccc] focus:outline-none focus:border-[#ff6600] transition-colors resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-widest mb-1.5">
                What will you do tomorrow?
              </label>
              <textarea
                value={nextSteps}
                onChange={e => setNextSteps(e.target.value)}
                placeholder="Deploy to staging, start user testing..."
                className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] placeholder-[#ccc] focus:outline-none focus:border-[#ff6600] transition-colors resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!accomplished.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ff6600] text-white text-sm font-bold rounded-lg hover:bg-[#e55a00] disabled:opacity-40 transition-colors"
            >
              <Send size={14} /> Submit Check-In
            </button>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#ff6600] yc-spin" />
            <p className="text-sm text-[#888]">AI Coach analyzing your check-in...</p>
          </div>
        )}

        {/* Report */}
        {step === "report" && report && (
          <div className="p-6 space-y-4">
            <div className="text-[9px] font-black text-[#ff6600] uppercase tracking-widest">Daily Execution Report</div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#f7f7f7] border border-[#e8e8e8] rounded-lg text-center">
                <div className="text-2xl font-black text-[#1a1a1a]">{report.dailyMomentum}</div>
                <div className="text-[10px] text-[#999]">Daily Momentum</div>
              </div>
              <div className="p-3 rounded-lg text-center border" style={{
                background: `${riskColors[report.riskLevel]}10`,
                borderColor: `${riskColors[report.riskLevel]}30`,
              }}>
                <div className="text-2xl font-black" style={{ color: riskColors[report.riskLevel] }}>
                  {(report.riskLevel || "medium").toUpperCase()}
                </div>
                <div className="text-[10px] text-[#999]">Risk Level</div>
              </div>
            </div>

            {/* Risk Reason */}
            {report.riskReason && (
              <p className="text-xs text-[#666] italic px-1">{report.riskReason}</p>
            )}

            {/* Next Focus */}
            <div className="p-3 bg-[#fff3ea] border border-[#ffd5b0] rounded-lg">
              <div className="text-[9px] font-black text-[#ff6600] uppercase tracking-widest mb-1">Next Focus</div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{report.nextFocus}</p>
            </div>

            {/* Streak Message */}
            {report.streakMessage && (
              <div className="flex items-center gap-2 text-xs text-[#d97706]">
                <Flame size={12} />
                <span className="font-semibold">{report.streakMessage}</span>
              </div>
            )}

            {/* Adjustments */}
            {report.adjustments?.length > 0 && (
              <div>
                <div className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest mb-2">Suggested Adjustments</div>
                <div className="space-y-1.5">
                  {report.adjustments.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#444]">
                      <ChevronRight size={12} className="text-[#7c3aed] shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement */}
            {report.encouragement && (
              <div className="p-3 bg-[#f0fdf4] border border-[#d1fae5] rounded-lg">
                <div className="text-[9px] font-black text-[#16a34a] uppercase tracking-widest mb-1">💪 Coach Says</div>
                <p className="text-sm text-[#333] leading-relaxed">{report.encouragement}</p>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-[#1a1a1a] text-white text-sm font-bold rounded-lg hover:bg-[#333] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard(props) {
  const params = useParams();
  const navigate = useNavigate();
  const id = params?.id || props.params?.id;
  const qc = useQueryClient();
  const [tab, setTab] = useState("roadmap");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [replan, setReplan] = useState(null);
  const [replanLoading, setReplanLoading] = useState(false);
  
  // New feature states
  const [probability, setProbability] = useState(null);
  const [probabilityLoading, setProbabilityLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { userId, openLoginModal } = useAuth();
  
  // Auth Guard
  useEffect(() => {
    if (!userId) {
      window.location.href = "/";
    }
  }, [userId]);

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["goals", userId],
    queryFn: async () => {
      if (!userId) return [];
      const r = await apiFetch(`/api/goals?userId=${userId}`);
      return r.json();
    },
    enabled: !!userId,
  });

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      if (!id) return null;
      const r = await apiFetch(`/api/goals/${id}`);
      return r.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (goal?.insights?.length && !insights) setInsights(goal.insights);
  }, [goal]);

  const updateTask = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const r = await apiFetch("/api/tasks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries(["goal", id]);
      qc.invalidateQueries(["goals"]);
      toast.success(
        data.newMomentum != null
          ? `Momentum: ${Number(data.newMomentum).toFixed(1)}/100`
          : "Updated",
      );
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId) => {
      const r = await apiFetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Failed to delete goal");
      return r.json();
    },
    onSuccess: (_, deletedId) => {
      qc.invalidateQueries(["goals"]);
      toast.success("System deleted");
      if (id === deletedId) {
        navigate("/dashboard");
      }
    },
    onError: () => toast.error("Failed to delete system"),
  });

  const generateInsights = async () => {
    if (!id || insightsLoading) return;
    setInsightsLoading(true);
    try {
      const r = await apiFetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: id }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setInsights(d.insights || []);
      toast.success("Intelligence report ready");
    } catch {
      toast.error("Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  const triggerReplan = async () => {
    if (!id || replanLoading) return;
    setReplanLoading(true);
    try {
      const r = await apiFetch("/api/goals/replan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: id }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setReplan(d.replan);
      qc.invalidateQueries(["goal", id]);
      toast.success("Execution system replanned");
      setTab("strategy");
    } catch {
      toast.error("Replan failed");
    } finally {
      setReplanLoading(false);
    }
  };

  const fetchProbability = async () => {
    if (!id || probabilityLoading) return;
    setProbabilityLoading(true);
    try {
      const r = await apiFetch("/api/goals/probability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: id }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setProbability(d);
      toast.success(`Success probability: ${d.probability}%`);
    } catch {
      toast.error("Failed to calculate probability");
    } finally {
      setProbabilityLoading(false);
    }
  };

  const fetchRecovery = async () => {
    if (!id || recoveryLoading) return;
    setRecoveryLoading(true);
    try {
      const r = await apiFetch("/api/goals/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: id }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setRecovery(d);
      toast.success("Recovery plan generated");
      setTab("strategy");
    } catch {
      toast.error("Failed to generate recovery plan");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const alerts = useMemo(() => {
    if (!goal) return [];
    const out = [];
    const days = goal.last_active_at
      ? Math.floor(
          (Date.now() - new Date(goal.last_active_at).getTime()) / 86400000,
        )
      : null;
    if (days !== null && days >= 2)
      out.push({
        type: "inactivity",
        message: `${days} days inactive. One task today restarts your streak.`,
      });
    if (
      Number(goal.momentum_score) < 25 &&
      goal.tasks?.some((t) => t.status === "completed")
    )
      out.push({
        type: "momentum",
        message: `Momentum at ${Number(goal.momentum_score).toFixed(1)}/100 — critically low. Trigger a replan.`,
      });
    const od = (goal.tasks || []).filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== "completed",
    ).length;
    if (od > 0)
      out.push({
        type: "overdue",
        message: `${od} task${od > 1 ? "s" : ""} overdue. Timeline at risk.`,
      });
    return out;
  }, [goal]);

  const sc = (s) =>
    s >= 70 ? "#16a34a" : s >= 45 ? "#ff6600" : s >= 25 ? "#d97706" : "#dc2626";

  if (goalsLoading || (id && goalLoading)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-[#ff6600] rounded flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-[#888] flex items-center gap-2">
          <Loader2 className="w-4 h-4 yc-spin" /> Loading...
        </span>
        <style
          jsx
          global
        >{`@keyframes ycspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.yc-spin{animation:ycspin .8s linear infinite}`}</style>
      </div>
    );
  }

  // ─── Goals List ───────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <nav className="bg-white border-b border-[#e8e8e8] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#ff6600] rounded flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-[#1a1a1a] text-sm">
                Momentum AI
              </span>
              <span className="text-[#ddd] mx-1">/</span>
              <span className="text-sm text-[#999]">Systems</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] transition-colors"
            >
              <Plus size={14} /> New Goal
            </button>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-black text-[#1a1a1a] mb-1">
            Execution Systems
          </h1>
          <p className="text-sm text-[#999] mb-8">
            Active goals with real-time AI intelligence
          </p>

          {!goals?.length && (
            <div className="text-center py-24 border-2 border-dashed border-[#e8e8e8] rounded-xl bg-white">
              <div className="w-12 h-12 bg-[#fff3ea] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-[#ff6600]" />
              </div>
              <p className="font-bold text-[#1a1a1a] mb-1">No systems yet</p>
              <p className="text-sm text-[#888] mb-6">
                Enter a goal to build your first execution system
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-5 py-2.5 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] transition-colors"
              >
                Build first system →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals?.map((g) => {
              const s = Number(g.momentum_score || 0);
              return (
                <motion.div
                  key={g.id}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/dashboard/${g.id}`)}
                  className="bg-white border border-[#e8e8e8] rounded-xl p-6 cursor-pointer hover:border-[#ff6600]/50 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-[#1a1a1a] leading-tight mb-1">
                        {g.title}
                      </h3>
                      <p className="text-xs text-[#bbb]">
                        Since {new Date(g.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <MomentumRing score={s} size={68} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 border-t border-[#f2f2f2] pt-4">
                    <div className="text-center">
                      <div className="text-xs text-[#bbb] mb-0.5">Streak</div>
                      <div className="text-sm font-bold text-[#d97706] flex items-center justify-center gap-1">
                        <Flame size={11} /> {g.execution_streak || 0}d
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#bbb] mb-0.5">Status</div>
                      <div className="text-sm font-bold text-[#1a1a1a] capitalize">
                        {g.status}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#bbb] mb-0.5">Score</div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: sc(s) }}
                      >
                        {s.toFixed(0)}/100
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <style
          jsx
          global
        >{`@keyframes ycspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.yc-spin{animation:ycspin .8s linear infinite}`}</style>
      </div>
    );
  }

  // ─── Goal Detail ──────────────────────────────────────────────────────────
  const tasksByMs = (mid) =>
    (goal?.tasks || []).filter((t) => t.milestone_id === mid);
  const pending = [...(goal?.tasks || [])]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      const o = { high: 0, medium: 1, low: 2 };
      return o[a.priority] !== o[b.priority]
        ? o[a.priority] - o[b.priority]
        : (b.impact_score || 0) - (a.impact_score || 0);
    });
  const done = (goal?.tasks || []).filter((t) => t.status === "completed");
  const pct =
    goal?.tasks?.length > 0
      ? Math.round((done.length / goal.tasks.length) * 100)
      : 0;
  const score = Number(goal?.momentum_score || 0);
  const streak = goal?.execution_streak || 0;
  const bd = goal?.momentum_breakdown || null;
  const shownInsights = insights || goal?.insights || [];

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-[#e8e8e8] hidden md:flex flex-col shrink-0">
        {/* Brand */}
        <div 
          onClick={() => navigate('/')}
          className="h-14 border-b border-[#e8e8e8] flex items-center gap-2.5 px-4 cursor-pointer hover:bg-[#f7f7f7] transition-colors"
        >
          <div className="w-6 h-6 bg-[#ff6600] rounded flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-xs font-black text-[#1a1a1a]">Momentum AI</div>
            <div className="text-[9px] text-[#bbb]">Execution OS</div>
          </div>
        </div>

        {/* Score Widget */}
        <div className="p-4 border-b border-[#e8e8e8]">
          <div className="flex items-center gap-3 p-3 bg-[#f7f7f7] rounded-lg border border-[#ebebeb]">
            <MomentumRing score={score} size={62} />
            <div>
              <div className="text-[9px] text-[#bbb] uppercase tracking-widest mb-0.5">
                Momentum
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-[#d97706]">
                  <Flame size={11} /> {streak}d streak
                </div>
              )}
              <div className="text-xs text-[#bbb] mt-0.5">{pct}% done</div>
            </div>
          </div>
          <button
            onClick={() => setShowBreakdown((v) => !v)}
            className="w-full flex items-center justify-center gap-1 mt-2 text-[10px] text-[#bbb] hover:text-[#ff6600] transition-colors"
          >
            {showBreakdown ? (
              <ChevronUp size={10} />
            ) : (
              <ChevronDown size={10} />
            )}
            {showBreakdown ? "Hide" : "Show"} breakdown
          </button>
          <AnimatePresence>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <BreakdownPanel breakdown={bd} />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Execution Health Dashboard */}
          <div className="mt-3">
            <ExecutionHealth goal={goal} />
          </div>
        </div>

        {/* Nav */}
        <div className="p-3 space-y-0.5 border-b border-[#e8e8e8]">
          <NavItem
            icon={<Target />}
            label="Roadmap"
            active={tab === "roadmap"}
            onClick={() => setTab("roadmap")}
          />
          <NavItem
            icon={<Activity />}
            label="Execution Queue"
            active={tab === "tasks"}
            onClick={() => setTab("tasks")}
            badge={pending.length}
          />
          <NavItem
            icon={<Brain />}
            label="AI Strategy"
            active={tab === "strategy"}
            onClick={() => setTab("strategy")}
            badge={shownInsights.length}
          />
          <NavItem
            icon={<BarChart3 />}
            label="Analytics"
            active={tab === "analytics"}
            onClick={() => setTab("analytics")}
          />
          <NavItem
            icon={<Shield />}
            label="Success Score"
            active={tab === "probability"}
            onClick={() => { setTab("probability"); if (!probability) fetchProbability(); }}
          />
          <NavItem
            icon={<MessageSquare />}
            label="Daily Check-In"
            active={false}
            onClick={() => setCheckInOpen(true)}
          />
        </div>

        {/* Goals list */}
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">
              Active Systems
            </div>
            <button
              onClick={() => navigate("/")}
              className="p-1 hover:bg-[#f7f7f7] hover:text-[#ff6600] rounded text-[#ccc] transition-colors"
              title="New System"
            >
              <Plus size={12} />
            </button>
          </div>
          {goals?.map((g) => (
            <div
              key={g.id}
              className={`group flex items-center justify-between w-full text-left px-2 py-1.5 rounded text-sm transition-all ${
                g.id === id
                  ? "bg-[#fff3ea] text-[#ff6600] font-bold"
                  : "text-[#777] hover:bg-[#f7f7f7]"
              }`}
            >
              <button
                onClick={() => navigate(`/dashboard/${g.id}`)}
                className="flex-1 truncate text-left py-1 pl-1"
              >
                {g.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(g);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded transition-all text-[#ccc]"
                title="Delete System"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#e8e8e8] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#f7f7f7] rounded transition-colors text-[#999] hover:text-[#1a1a1a]"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold">Dashboard</span>
            </button>
            <div className="h-4 w-px bg-[#e8e8e8]"></div>
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a] leading-tight">
                {goal?.title}
              </h2>
              <div className="text-[10px] text-[#bbb]">
                {pct}% complete · {pending.length} tasks left
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCheckInOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#666] border border-[#e8e8e8] rounded hover:border-[#ff6600]/40 hover:text-[#ff6600] transition-all"
            >
              <MessageSquare size={12} /> Check In
            </button>
            {(score < 50 || alerts.length > 0) && (
              <button
                onClick={fetchRecovery}
                disabled={recoveryLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#dc2626] rounded hover:bg-[#b91c1c] transition-all disabled:opacity-40"
              >
                {recoveryLoading ? (
                  <Loader2 size={12} className="yc-spin" />
                ) : (
                  <RefreshCw size={12} />
                )} Recover
              </button>
            )}
            <button
              onClick={triggerReplan}
              disabled={replanLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#666] border border-[#e8e8e8] rounded hover:border-[#ff6600]/40 hover:text-[#ff6600] transition-all disabled:opacity-40"
            >
              {replanLoading ? (
                <Loader2 size={12} className="yc-spin" />
              ) : (
                <RotateCcw size={12} />
              )}{" "}
              Replan
            </button>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded border cursor-pointer"
              style={{
                color: sc(score),
                borderColor: `${sc(score)}40`,
                background: `${sc(score)}10`,
              }}
              onClick={() => setTab("strategy")}
            >
              <TrendingUp size={12} /> {score.toFixed(1)}
            </div>
          </div>
        </header>

        {/* Alert */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <AlertBanner alerts={alerts} onReplan={triggerReplan} />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Roadmap */}
            {tab === "roadmap" && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 max-w-3xl mx-auto w-full space-y-8"
              >
                {/* Progress */}
                <div className="bg-white border border-[#e8e8e8] rounded-xl p-5">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-semibold text-[#1a1a1a]">
                      Overall Progress
                    </span>
                    <span className="font-black text-[#ff6600]">{pct}%</span>
                  </div>
                  <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-[#ff6600]"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-[#bbb]">
                    <span>{done.length} completed</span>
                    <span>{goal?.tasks?.length || 0} total</span>
                  </div>
                </div>

                {/* Milestones */}
                {goal?.milestones?.map((m, idx) => (
                  <div key={m.id} className="relative">
                    {idx < goal.milestones.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-px bg-[#e8e8e8]" />
                    )}
                    <div className="flex gap-5">
                      <div
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 z-10 font-black text-sm ${
                          m.status === "completed"
                            ? "bg-[#f0fdf4] border-[#16a34a] text-[#16a34a]"
                            : "bg-white border-[#e8e8e8] text-[#bbb]"
                        }`}
                      >
                        {m.status === "completed" ? (
                          <CheckCircle size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <h3 className="font-bold text-[#1a1a1a] mb-0.5">
                          {m.title}
                        </h3>
                        <p className="text-sm text-[#888] mb-4 leading-relaxed">
                          {m.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tasksByMs(m.id).map((t) => (
                            <TaskCard
                              key={t.id}
                              task={t}
                              onToggle={() =>
                                updateTask.mutate({
                                  taskId: t.id,
                                  status:
                                    t.status === "completed"
                                      ? "todo"
                                      : "completed",
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Execution Queue */}
            {tab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 max-w-3xl mx-auto w-full"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-black text-[#1a1a1a] text-lg">
                      Execution Queue
                    </h3>
                    <p className="text-xs text-[#999]">
                      AI-prioritized · {pending.length} remaining
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#ff6600] bg-[#fff3ea] border border-[#ffd5b0] px-2 py-1 rounded uppercase tracking-wider">
                    Impact sorted
                  </span>
                </div>

                {!pending.length && (
                  <div className="text-center py-16 bg-white border border-[#e8e8e8] rounded-xl">
                    <CheckCircle
                      size={32}
                      className="text-[#16a34a] mx-auto mb-3"
                    />
                    <p className="font-bold text-[#1a1a1a]">
                      All tasks complete. Momentum at peak.
                    </p>
                  </div>
                )}

                <div className="space-y-2 mb-8">
                  {pending.map((t, i) => {
                    const taskResources = Array.isArray(t.resources)
                      ? t.resources
                      : [];
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white border border-[#e8e8e8] rounded-lg hover:border-[#ff6600]/40 transition-all overflow-hidden"
                      >
                        <div className="flex items-center gap-3 p-4">
                          <span className="text-[10px] font-black text-[#ccc] w-4 shrink-0">
                            {i + 1}
                          </span>
                          <button
                            onClick={() =>
                              updateTask.mutate({
                                taskId: t.id,
                                status: "completed",
                              })
                            }
                            className="w-4 h-4 rounded border-2 border-[#ccc] hover:border-[#ff6600] transition-colors shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-[#1a1a1a] truncate">
                              {t.title}
                            </div>
                            {t.description && (
                              <div className="text-xs text-[#999] truncate mt-0.5">
                                {t.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {taskResources.length > 0 && (
                              <a
                                href={taskResources[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-semibold text-[#2563eb] bg-[#f0f7ff] border border-[#bfdbfe] px-2 py-0.5 rounded hover:bg-[#dbeafe] transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {taskResources[0].type === "video" ? (
                                  <Youtube size={9} className="text-red-500" />
                                ) : (
                                  <BookOpen size={9} />
                                )}
                                Learn
                                <ExternalLink size={8} className="opacity-50" />
                              </a>
                            )}
                            {t.estimated_hours && (
                              <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                                <Clock size={9} />
                                {t.estimated_hours}h
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                t.priority === "high"
                                  ? "bg-[#fef2f2] text-red-600"
                                  : t.priority === "medium"
                                    ? "bg-[#fff3ea] text-[#ff6600]"
                                    : "bg-[#f7f7f7] text-[#888]"
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>
                        </div>
                        {/* Inline resources strip */}
                        {taskResources.length > 1 && (
                          <div className="px-4 pb-3 pt-0 border-t border-[#f5f5f5] bg-[#fafafa] flex flex-wrap gap-1.5">
                            {taskResources.slice(1).map((r, ri) => (
                              <ResourceLink key={ri} resource={r} />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {done.length > 0 && (
                  <div>
                    <div className="text-[9px] font-black text-[#ccc] uppercase tracking-widest mb-3">
                      Completed
                    </div>
                    <div className="space-y-1">
                      {done.map((t) => (
                        <div
                          key={t.id}
                          onClick={() =>
                            updateTask.mutate({ taskId: t.id, status: "todo" })
                          }
                          className="flex items-center gap-3 px-3 py-2 rounded opacity-50 hover:opacity-80 cursor-pointer transition-all"
                        >
                          <CheckCircle2 size={13} className="text-[#16a34a]" />
                          <span className="text-sm text-[#888] line-through">
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Strategy */}
            {tab === "strategy" && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 max-w-3xl mx-auto w-full space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-[#1a1a1a] text-lg">
                      AI Chief of Staff
                    </h3>
                    <p className="text-xs text-[#999]">
                      Execution intelligence · Adaptive strategy
                    </p>
                  </div>
                  <button
                    onClick={generateInsights}
                    disabled={insightsLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] disabled:opacity-40 transition-colors"
                  >
                    {insightsLoading ? (
                      <>
                        <Loader2 size={13} className="yc-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Refresh Intelligence
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {replan && (
                    <ReplanPanel
                      replan={replan}
                      onDismiss={() => setReplan(null)}
                    />
                  )}
                </AnimatePresence>

                {/* Recovery Plan */}
                <RecoveryPlanPanel
                  recovery={recovery}
                  loading={recoveryLoading}
                  onRecover={fetchRecovery}
                  onDismiss={() => setRecovery(null)}
                />

                <BreakdownPanel breakdown={bd} />

                {insightsLoading && (
                  <div className="flex items-center gap-3 py-12 justify-center text-[#999] text-sm">
                    <Loader2 className="w-4 h-4 yc-spin" /> Chief of Staff is
                    analyzing...
                  </div>
                )}

                {!insightsLoading && shownInsights.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">
                      Intelligence Report
                    </div>
                    {shownInsights.map((ins, i) => (
                      <InsightCard key={ins.id || i} insight={ins} idx={i} />
                    ))}
                  </div>
                )}

                {!insightsLoading && shownInsights.length === 0 && (
                  <div className="text-center py-14 bg-white border border-[#e8e8e8] rounded-xl">
                    <div className="w-10 h-10 bg-[#fff3ea] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-5 h-5 text-[#ff6600]" />
                    </div>
                    <p className="font-bold text-[#1a1a1a] mb-1">
                      No report yet
                    </p>
                    <p className="text-sm text-[#888] mb-5">
                      Generate your first AI analysis for tactical guidance.
                    </p>
                    <button
                      onClick={generateInsights}
                      className="px-5 py-2.5 bg-[#ff6600] text-white text-sm font-bold rounded hover:bg-[#e55a00] transition-colors"
                    >
                      Generate Report →
                    </button>
                  </div>
                )}

                <div className="p-5 bg-white border border-[#e8e8e8] rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#f5f0ff] rounded flex items-center justify-center shrink-0">
                      <RotateCcw size={15} className="text-[#7c3aed]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#1a1a1a] text-sm mb-1">
                        Adaptive Replanning Engine
                      </div>
                      <p className="text-xs text-[#888] leading-relaxed mb-3">
                        When execution diverges from the plan, Momentum AI
                        reprioritizes your queue and generates a recovery
                        strategy in real-time.
                      </p>
                      <button
                        onClick={triggerReplan}
                        disabled={replanLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold rounded hover:bg-[#333] disabled:opacity-40 transition-colors"
                      >
                        {replanLoading ? (
                          <Loader2 size={12} className="yc-spin" />
                        ) : (
                          <RotateCcw size={12} />
                        )}
                        {replanLoading
                          ? "Replanning..."
                          : "Trigger Adaptive Replan"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analytics */}
            {tab === "analytics" && <AnalyticsTab goal={goal} />}

            {/* Success Probability */}
            {tab === "probability" && (
              <SuccessProbabilityGauge
                probability={probability?.probability}
                confidence={probability?.confidence}
                strengths={probability?.strengths}
                risks={probability?.risks}
                recommendation={probability?.recommendation}
                loading={probabilityLoading}
                onRefresh={fetchProbability}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Daily Check-In Modal */}
      <AnimatePresence>
        <DailyCheckInModal
          open={checkInOpen}
          onClose={() => setCheckInOpen(false)}
          goalId={id}
          userId={userId}
          goalTitle={goal?.title}
        />

        {/* Custom Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10 m-4 text-center"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-black text-[#1a1a1a] mb-2">Delete Execution System?</h3>
              <p className="text-sm text-[#666] mb-6">
                Are you sure you want to permanently delete <span className="font-bold text-[#1a1a1a]">{deleteTarget.title}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#e8e8e8] text-[#666] font-bold hover:bg-[#f7f7f7] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteGoal.mutate(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style
        jsx
        global
      >{`@keyframes ycspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.yc-spin{animation:ycspin .8s linear infinite}`}</style>
    </div>
  );
}
