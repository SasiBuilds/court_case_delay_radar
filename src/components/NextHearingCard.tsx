import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
  Volume2,
  Languages,
  CheckSquare,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { RiskPrediction, TeluguTranslation } from '../types';

interface Props {
  baselinePrediction: RiskPrediction;
  geminiPrediction: RiskPrediction;
  telugu?: TeluguTranslation;
  lang: 'en' | 'te';
  onPlayVoice: () => void;
  isPlayingVoice: boolean;
}

export const NextHearingCard: React.FC<Props> = ({
  baselinePrediction,
  geminiPrediction,
  telugu,
  lang,
  onPlayVoice,
  isPlayingVoice,
}) => {
  const [activeMethod, setActiveMethod] = useState<'gemini_llm' | 'frequency_baseline'>('gemini_llm');

  const currentPred = activeMethod === 'gemini_llm' ? geminiPrediction : baselinePrediction;

  const riskBadgeStyles = {
    high: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      text: 'text-rose-400',
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      label: 'HIGH ADJOURNMENT RISK',
      icon: AlertTriangle,
    },
    medium: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      text: 'text-amber-400',
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      label: 'MEDIUM ADJOURNMENT RISK',
      icon: AlertCircle,
    },
    low: {
      border: 'border-teal-500/40',
      bg: 'bg-teal-950/20',
      text: 'text-teal-400',
      pill: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      label: 'LOW ADJOURNMENT RISK',
      icon: CheckCircle2,
    },
  }[currentPred.risk_level] || {
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/20',
    text: 'text-amber-400',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    label: 'MEDIUM ADJOURNMENT RISK',
    icon: AlertCircle,
  };

  const RiskIcon = riskBadgeStyles.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Banner / Method Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Next Hearing Risk & Action Card</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
              Listing #61 Preview
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Procedural obstacle forecasting before the judge takes the bench.
          </p>
        </div>

        {/* Method Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveMethod('gemini_llm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
              activeMethod === 'gemini_llm'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Gemini Sequence LLM</span>
          </button>

          <button
            onClick={() => setActiveMethod('frequency_baseline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
              activeMethod === 'frequency_baseline'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Frequency Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Action Card */}
      <div className={`bg-slate-900 border ${riskBadgeStyles.border} rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl`}>
        {/* Risk Level Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Predicted Procedural Risk Level:
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1 text-sm font-bold font-mono rounded-lg border ${riskBadgeStyles.pill}`}>
                <RiskIcon className="w-4 h-4" />
                {lang === 'te' && telugu?.risk_level_te ? telugu.risk_level_te : riskBadgeStyles.label}
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <div className="text-xs font-mono text-slate-400">Prediction Engine:</div>
            <div className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1.5 justify-end mt-0.5">
              {activeMethod === 'gemini_llm' ? (
                <>
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>Gemini 3.8 Flash Contextual Reasoning</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span>Rolling Category Markov Baseline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Most Likely Impending Bottleneck */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Most Probable Adjournment Trigger:
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100">
            {lang === 'te' && telugu?.most_likely_reason_te
              ? telugu.most_likely_reason_te
              : currentPred.most_likely_reason}
          </div>
          <p className="text-xs text-slate-400 pt-1 font-mono leading-relaxed">
            {lang === 'te' && telugu?.rationale_te ? telugu.rationale_te : currentPred.rationale}
          </p>
        </div>

        {/* Actionable Litigant Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-400" />
              <span>Recommended Proactive Actions (Before Next Listing):</span>
            </div>
            <button
              onClick={onPlayVoice}
              disabled={isPlayingVoice}
              className="text-xs font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen in {lang === 'te' ? 'Telugu' : 'English'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {(lang === 'te' && telugu?.recommended_actions_te
              ? telugu.recommended_actions_te
              : currentPred.recommended_actions
            ).map((action, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 p-3.5 rounded-xl flex items-start gap-3 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Litigant Rights Callout */}
        <div className="border border-slate-800 bg-slate-950/40 p-3.5 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Procedural Tip under Order XVII Rule 1 CPC:</strong> Litigants are entitled to request the court to impose nominal costs on repeated non-attendance by adversary counsel or petition for a fixed peremptory listing date.
          </span>
        </div>
      </div>
    </div>
  );
};
