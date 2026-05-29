"use client";
import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  Target,
  CheckCircle2,
  Activity,
  BarChart3,
  Minus,
} from "lucide-react";

function MomentumTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#999] mb-1">{label}</p>
      <p className="text-[#1a1a1a] font-black text-sm">
        {payload[0]?.value?.toFixed(1)}
      </p>
      <p className="text-[#bbb]">momentum score</p>
    </div>
  );
}

function VelocityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-[#999] mb-1">{label}</p>
      <p className="text-[#1a1a1a] font-black text-sm">{payload[0]?.value}</p>
      <p className="text-[#bbb]">tasks completed</p>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#ccc";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white border border-[#e8e8e8] rounded-xl"
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <TrendIcon size={14} style={{ color: trendColor }} />
      </div>
      <div className="text-2xl font-black text-[#1a1a1a] mb-0.5">{value}</div>
      <div className="text-xs text-[#999]">{label}</div>
      {sub && <div className="text-[10px] text-[#bbb] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function ExecutionDNA({ breakdown }) {
  if (!breakdown) return null;
  const data = [
    { subject: "Completion", value: breakdown.completionRate ?? 0, max: 40 },
    { subject: "Priority", value: breakdown.priorityAccuracy ?? 0, max: 25 },
    { subject: "Consistency", value: breakdown.consistencyScore ?? 0, max: 20 },
    { subject: "Velocity", value: breakdown.velocityScore ?? 0, max: 15 },
  ].map((d) => ({ ...d, pct: Math.round((d.value / d.max) * 100) }));

  return (
    <div className="p-5 bg-white border border-[#e8e8e8] rounded-xl">
      <div className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-4">
        Execution DNA
      </div>
      <div className="space-y-3">
        {data.map((d) => {
          const c =
            d.pct >= 70
              ? "#16a34a"
              : d.pct >= 40
                ? "#ff6600"
                : d.pct >= 20
                  ? "#d97706"
                  : "#dc2626";
          return (
            <div key={d.subject}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-[#555] font-medium">{d.subject}</span>
                <span className="font-black" style={{ color: c }}>
                  {d.pct}%
                </span>
              </div>
              <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: c }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {breakdown.streak > 0 && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#d97706] font-bold">
          <Flame size={12} /> {breakdown.streak}-day execution streak active
        </div>
      )}
    </div>
  );
}

export default function AnalyticsTab({ goal }) {
  const momentumChartData = useMemo(() => {
    const history = goal?.momentumHistory || [];
    if (!history.length) return [];
    return history.map((point) => ({
      label: new Date(point.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: Math.round(Number(point.score) * 10) / 10,
    }));
  }, [goal?.momentumHistory]);

  const velocityChartData = useMemo(() => {
    const events = goal?.executionEvents || [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        key: d.toISOString().split("T")[0],
        tasks: 0,
      });
    }
    events.forEach((e) => {
      const m = days.find((d) => d.key === e.day);
      if (m) m.tasks = Number(e.count);
    });
    return days;
  }, [goal?.executionEvents]);

  const kpis = useMemo(() => {
    if (!goal) return null;
    const tasks = goal.tasks || [];
    const completed = tasks.filter((t) => t.status === "completed");
    const highP = tasks.filter((t) => t.priority === "high");
    const highPDone = highP.filter((t) => t.status === "completed");
    const pEff =
      highP.length > 0
        ? Math.round((highPDone.length / highP.length) * 100)
        : null;
    const history = goal.momentumHistory || [];
    const cur = goal.momentum_score || 0;
    const prev = history.length > 1 ? history[history.length - 2]?.score : null;
    const trend =
      prev !== null
        ? cur > prev + 2
          ? "up"
          : cur < prev - 2
            ? "down"
            : "flat"
        : "flat";
    return {
      momentum: { value: cur.toFixed(1), trend },
      streak: { value: goal.execution_streak || 0 },
      completed: { value: completed.length, total: tasks.length },
      pEff: { value: pEff !== null ? `${pEff}%` : "N/A" },
    };
  }, [goal]);

  const lastScore = momentumChartData[momentumChartData.length - 1]?.score || 0;
  const areaColor =
    lastScore >= 70
      ? "#16a34a"
      : lastScore >= 45
        ? "#ff6600"
        : lastScore >= 25
          ? "#d97706"
          : "#dc2626";
  const totalWeek = velocityChartData.reduce((s, d) => s + d.tasks, 0);
  const bestDay = velocityChartData.reduce(
    (b, d) => (d.tasks > b.tasks ? d : b),
    { tasks: 0, label: "—" },
  );

  if (!goal) return null;

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-4xl mx-auto w-full space-y-6"
    >
      <div>
        <h3 className="font-black text-[#1a1a1a] text-lg">
          Execution Analytics
        </h3>
        <p className="text-xs text-[#999] mt-0.5">
          Behavioral intelligence · Real-time momentum tracking
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Momentum Score"
          value={kpis?.momentum.value || "0"}
          sub="out of 100"
          icon={Activity}
          color="#ff6600"
          trend={kpis?.momentum.trend}
        />
        <KpiCard
          label="Execution Streak"
          value={`${kpis?.streak.value}d`}
          sub="consecutive days"
          icon={Flame}
          color="#d97706"
          trend={kpis?.streak.value > 0 ? "up" : "flat"}
        />
        <KpiCard
          label="Tasks Executed"
          value={kpis?.completed.value || 0}
          sub={`of ${kpis?.completed.total || 0} total`}
          icon={CheckCircle2}
          color="#16a34a"
          trend={kpis?.completed.value > 0 ? "up" : "flat"}
        />
        <KpiCard
          label="Priority Focus"
          value={kpis?.pEff.value || "N/A"}
          sub="high-priority done"
          icon={Target}
          color="#7c3aed"
          trend={
            kpis?.pEff.value === "N/A"
              ? "flat"
              : parseInt(kpis?.pEff.value) >= 60
                ? "up"
                : "down"
          }
        />
      </div>

      {/* Momentum Trajectory */}
      <div className="p-5 bg-white border border-[#e8e8e8] rounded-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-1">
              Momentum Trajectory
            </div>
            <div className="text-sm font-bold text-[#1a1a1a]">
              Score over time
            </div>
          </div>
          <div
            className="text-xs font-black px-2.5 py-1 rounded-full"
            style={{ background: `${areaColor}15`, color: areaColor }}
          >
            {lastScore.toFixed(1)} current
          </div>
        </div>

        {momentumChartData.length < 2 ? (
          <div className="h-44 flex flex-col items-center justify-center gap-2">
            <BarChart3 size={28} className="text-[#ccc]" />
            <p className="text-sm font-medium text-[#999]">
              Complete tasks to build your trajectory
            </p>
            <p className="text-xs text-[#bbb]">Data appears as you execute</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={momentumChartData}
              margin={{ top: 8, right: 4, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={areaColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#bbb", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#bbb", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<MomentumTooltip />}
                cursor={{ stroke: "#f0f0f0" }}
              />
              <ReferenceLine
                y={70}
                stroke="#16a34a"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={45}
                stroke="#ff6600"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke={areaColor}
                strokeWidth={2}
                fill="url(#mgGrad)"
                dot={false}
                activeDot={{ r: 4, fill: areaColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="flex gap-5 mt-3 pt-3 border-t border-[#f0f0f0]">
          <div className="flex items-center gap-1.5 text-[10px] text-[#bbb]">
            <div
              className="w-5 h-px"
              style={{ borderTop: "1.5px dashed rgba(22,163,74,0.5)" }}
            />{" "}
            Strong (70+)
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#bbb]">
            <div
              className="w-5 h-px"
              style={{ borderTop: "1.5px dashed rgba(255,102,0,0.5)" }}
            />{" "}
            Building (45+)
          </div>
        </div>
      </div>

      {/* Velocity + DNA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-white border border-[#e8e8e8] rounded-xl">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-1">
                Execution Velocity
              </div>
              <div className="text-sm font-bold text-[#1a1a1a]">
                Tasks / day (7d)
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-[#1a1a1a]">
                {totalWeek}
              </div>
              <div className="text-[10px] text-[#bbb]">this week</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={velocityChartData}
              margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#bbb", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#bbb", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<VelocityTooltip />}
                cursor={{ fill: "rgba(255,102,0,0.05)" }}
              />
              <Bar
                dataKey="tasks"
                fill="#ff6600"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
          {bestDay.tasks > 0 && (
            <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex items-center gap-1.5 text-[10px] text-[#999]">
              <Zap size={10} className="text-[#ff6600]" />
              Best:{" "}
              <span className="text-[#ff6600] font-bold ml-0.5">
                {bestDay.label}
              </span>{" "}
              · {bestDay.tasks} task{bestDay.tasks !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <ExecutionDNA breakdown={goal?.momentum_breakdown} />
      </div>

      {/* Execution Log */}
      {goal?.tasks?.some((t) => t.status === "completed") && (
        <div className="p-5 bg-white border border-[#e8e8e8] rounded-xl">
          <div className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-4">
            Execution Log
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {[...goal.tasks]
              .filter((t) => t.status === "completed" && t.completed_at)
              .sort(
                (a, b) => new Date(b.completed_at) - new Date(a.completed_at),
              )
              .map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />
                  <span className="text-xs text-[#555] flex-1 truncate">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-[#bbb] shrink-0">
                    {new Date(t.completed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-[10px] font-bold text-[#ff6600] shrink-0">
                    +{t.impact_score}/10
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
