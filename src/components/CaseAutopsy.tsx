import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  X,
  FileText,
  Quote,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CaseData, Hearing } from '../types';
import { CATEGORY_COLORS } from '../utils/categoryColors';

interface Props {
  caseData: CaseData;
  lang: 'en' | 'te';
}

export const CaseAutopsy: React.FC<Props> = ({ caseData, lang }) => {
  const { summary_stats: stats, hearings, case_metadata: meta } = caseData;
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(hearings[0] || null);
  const [avoidancePercentage, setAvoidancePercentage] = useState<number>(50);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Interactive What-if calculation
  const avoidableDays = stats.avoidable_friction_days || 0;
  const daysSaved = Math.round(avoidableDays * (avoidancePercentage / 100));
  const yearsSaved = (daysSaved / 365.25).toFixed(1);

  // Filtered hearings for the timeline
  const filteredHearings = activeCategoryFilter === 'all'
    ? hearings
    : hearings.filter((h) => h.category === activeCategoryFilter);

  // Find max days in hearing intervals to scale timeline heights/widths
  const maxDays = Math.max(...hearings.map((h) => h.days_to_next_hearing || 30), 45);

  return (
    <div className="space-y-8 pb-16">
      {/* Case Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>{meta.case_number}</span>
              <span aria-hidden="true">·</span>
              <span>{meta.court}</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-400 font-medium">9-Year Longitudinal Record</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              {lang === 'te' && caseData.telugu?.title ? caseData.telugu.title : meta.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {lang === 'te' && caseData.telugu?.summary_te
                ? caseData.telugu.summary_te
                : 'Empirical procedural autopsy tracking every court listing, identifying systemic bottlenecks, and isolating avoidable litigant friction.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <span className="text-xs font-mono text-slate-400">
              Filtered: <strong className="text-slate-200">{filteredHearings.length}</strong> / {hearings.length}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Total Listings</span>
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-100 tabular-nums">
            {stats.total_listings}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Over {stats.total_span_years} calendar years
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Productive Hearings</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-teal-400 tabular-nums">
            {stats.productive_hearings}
          </div>
          <div className="mt-1 text-[11px] text-teal-500/80 font-mono">
            {((stats.productive_hearings / stats.total_listings) * 100).toFixed(0)}% substantive progress
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Procedural Friction Days</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
            {stats.friction_days.toLocaleString()}d
          </div>
          <div className="mt-1 text-[11px] text-amber-500/80 font-mono">
            {stats.friction_percent}% of dispute span lost
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Litigant Avoidable Days</span>
            <Clock className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-orange-400 tabular-nums">
            {stats.avoidable_friction_days.toLocaleString()}d
          </div>
          <div className="mt-1 text-[11px] text-orange-400/80 font-mono">
            Excludes court-side bench leave
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-teal-500/10 border border-amber-500/30 p-4 rounded-xl col-span-2 md:col-span-1">
          <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
            <span>What-If Potential</span>
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-teal-300 tabular-nums">
            ~{yearsSaved} Yrs
          </div>
          <div className="mt-1 text-[11px] text-slate-300 font-mono">
            Saved at {avoidancePercentage}% intervention
          </div>
        </div>
      </div>

      {/* Interactive Timeline Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono">
              Chronological Hearing Timeline (60 Listings)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each bar represents one court listing. Bar width indicates days until the next hearing. Click any bar to inspect cited evidence.
            </p>
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({hearings.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('productive')}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === 'productive'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-teal-300'
              }`}
            >
              Productive (9)
            </button>
            <button
              onClick={() => setActiveCategoryFilter('court_side')}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === 'court_side'
                  ? 'bg-slate-700 text-slate-200 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Court-Side
            </button>
            <button
              onClick={() => setActiveCategoryFilter('extension_sought')}
              className={`px-2.5 py-1 text-xs rounded-md font-mono transition-colors whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === 'extension_sought'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Time Sought
            </button>
          </div>
        </div>

        {/* Visual Timeline Grid / Scrollable Ribbon */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 overflow-x-auto">
          <div className="flex items-end gap-1 min-w-[900px] h-32 pt-4 px-1 pb-2">
            {filteredHearings.map((h) => {
              const colorInfo = CATEGORY_COLORS[h.category] || CATEGORY_COLORS.unclear;
              const isSelected = selectedHearing?.order_no === h.order_no;
              // Proportional height based on days to next listing
              const heightPct = Math.max(20, Math.min(100, ((h.days_to_next_hearing || 30) / maxDays) * 100));

              return (
                <button
                  key={h.order_no}
                  onClick={() => setSelectedHearing(h)}
                  title={`Order #${h.order_no} (${h.date}): ${colorInfo.label} (${h.days_to_next_hearing}d)`}
                  className={`group relative flex-1 min-w-[12px] rounded-t-sm transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10'
                      : 'hover:brightness-125'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: colorInfo.hex,
                  }}
                >
                  {/* Subtle Order indicator */}
                  {h.order_no % 5 === 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 group-hover:text-slate-200">
                      #{h.order_no}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-900 mt-1 px-1">
            <span>Hearing #1 (Feb 2015)</span>
            <span className="text-slate-400">Total 60 Listings · Click any column to inspect citation</span>
            <span>Hearing #60 (Nov 2023)</span>
          </div>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-3 text-[11px] text-slate-400">
          {Object.entries(CATEGORY_COLORS).map(([key, item]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.hex }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Category Breakdown Chart + Selected Order Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Recharts Category Breakdown & What-If Estimator */}
        <div className="lg:col-span-7 space-y-6">
          {/* Horizontal Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase font-mono mb-1">
              Where Did the 9 Years Go? (Share of Days by Delay Driver)
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of total {stats.total_span_days} days lost across procedural categories.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.category_breakdown}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    domain={[0, 'dataMax + 100']}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    unit="d"
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={110}
                    tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }}
                    tickFormatter={(val) => {
                      const labels: Record<string, string> = {
                        court_side: 'Court-Side Leave',
                        extension_sought: 'Time Sought',
                        witness_absent: 'Witness Absent',
                        lawyer_absent: 'Counsel Absent',
                        summons_not_served: 'Summons Pending',
                        documents_pending: 'Records Pending',
                        productive: 'Productive',
                        unclear: 'Unclear',
                      };
                      return labels[val] || val;
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any;
                        return (
                          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
                            <div className="font-semibold text-slate-200">{data.label}</div>
                            <div className="text-amber-400 mt-1">
                              {data.days} days ({data.share_percent}% of total case)
                            </div>
                            <div className="text-slate-400">
                              {data.hearings_count} hearings
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {data.is_avoidable_by_litigant ? 'Avoidable with advance coordination' : 'Non-avoidable (systemic/court-side)'}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                    {stats.category_breakdown.map((entry, index) => {
                      const color = CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]?.hex || '#94A3B8';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* What-If Interactive Estimator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase font-mono">
                  What-If Litigant Friction Estimator
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                Simulated Projection
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {lang === 'te' && caseData.telugu?.what_if_te
                ? caseData.telugu.what_if_te
                : 'If avoidable litigant friction (advocate illness memo, dasti summons delays, unfiled rejoinders, witness travel coordination) was proactively resolved:'}
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span>Avoidable Friction Reduction:</span>
                  <strong className="text-amber-400 text-sm">{avoidancePercentage}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={avoidancePercentage}
                  onChange={(e) => setAvoidancePercentage(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>10% (Minor Effort)</span>
                  <span>50% (Recommended Target)</span>
                  <span>90% (Strict Peremptory)</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-mono">Estimated Calendar Time Saved:</div>
                  <div className="text-2xl font-bold font-mono text-teal-400 mt-0.5 tabular-nums">
                    ~{yearsSaved} Years ({daysSaved.toLocaleString()} days)
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 max-w-xs leading-tight font-mono">
                  ⚠️ Note: {stats.what_if_estimate.assumption_text}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Order Inspector Drawer (Source Verbatim Citation) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-20 shadow-md">
          {selectedHearing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-slate-100 font-mono text-sm">
                    Order Sheet #{selectedHearing.order_no}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {selectedHearing.date}
                </div>
              </div>

              {/* Categorization & Avoidable Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 text-xs font-semibold rounded-md"
                  style={{
                    backgroundColor: CATEGORY_COLORS[selectedHearing.category]?.hex + '22',
                    color: CATEGORY_COLORS[selectedHearing.category]?.hex,
                    border: `1px solid ${CATEGORY_COLORS[selectedHearing.category]?.hex}44`,
                  }}
                >
                  {CATEGORY_COLORS[selectedHearing.category]?.label || selectedHearing.category}
                </span>

                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  +{selectedHearing.days_to_next_hearing} days to next listing
                </span>

                {selectedHearing.is_avoidable_by_litigant ? (
                  <span className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded font-mono">
                    Avoidable by Litigant
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Systemic / Court-Side
                  </span>
                )}
              </div>

              {/* Procedural Reason Explanation */}
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Extracted Delay Reason:
                </div>
                <p className="text-xs text-slate-200 bg-slate-950 border border-slate-800/80 p-3 rounded-lg leading-relaxed">
                  {selectedHearing.reason_text}
                </p>
              </div>

              {/* MANDATORY EVIDENTIARY CITATION */}
              <div className="border border-teal-500/30 bg-teal-950/20 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 font-mono">
                    <Quote className="w-3.5 h-3.5 text-teal-400" />
                    <span>Source Evidentiary Citation (Verbatim)</span>
                  </div>
                  <span className="text-[10px] text-teal-500 font-mono">
                    Confidence: {(selectedHearing.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <blockquote className="text-xs text-teal-200 font-serif italic border-l-2 border-teal-500 pl-3 py-1 bg-teal-950/40">
                  "{selectedHearing.supporting_snippet}"
                </blockquote>
                <div className="text-[10px] text-slate-400 font-mono">
                  Cited from: Order #{selectedHearing.order_no}, Bench Docket on {selectedHearing.date}
                </div>
              </div>

              {/* Presiding Order Sheet Text with Redaction */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Full Order Sheet Text:</span>
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    {showRawText ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hide PII (Masked)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Show Unmasked Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-slate-300 font-mono bg-slate-950 border border-slate-800 p-3 rounded-lg max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
                  {showRawText
                    ? selectedHearing.order_sheet_text
                    : selectedHearing.redacted_text || selectedHearing.order_sheet_text}
                </div>
              </div>

              {/* Quick Navigation Between Orders */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <button
                  disabled={selectedHearing.order_no <= 1}
                  onClick={() => {
                    const prev = hearings.find((h) => h.order_no === selectedHearing.order_no - 1);
                    if (prev) setSelectedHearing(prev);
                  }}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  ← Prev Order
                </button>
                <span className="text-slate-500">
                  {selectedHearing.order_no} / {hearings.length}
                </span>
                <button
                  disabled={selectedHearing.order_no >= hearings.length}
                  onClick={() => {
                    const next = hearings.find((h) => h.order_no === selectedHearing.order_no + 1);
                    if (next) setSelectedHearing(next);
                  }}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  Next Order →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Select any hearing from the timeline to view evidentiary citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
