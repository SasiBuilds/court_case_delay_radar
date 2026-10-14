import React from 'react';
import { ShieldAlert, Lock, Sparkles, Scale } from 'lucide-react';

interface Props {
  isSynthetic?: boolean;
  isRedacted?: boolean;
}

export const DisclaimerBanner: React.FC<Props> = ({ isSynthetic = true, isRedacted = true }) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-400">LEGAL NOTICE & FIREWALL:</span>
          <span className="text-slate-400 leading-relaxed">
            Decision-support analysis only. <strong className="text-slate-300">NEVER</strong> predicts case verdicts, judicial outcomes, or merits. Does not replace advocates or judges.
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
          {isSynthetic && (
            <div className="flex items-center gap-1.5 text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Synthetic Example Data</span>
            </div>
          )}

          {isRedacted && (
            <div className="flex items-center gap-1.5 text-teal-400/90 bg-teal-950/40 border border-teal-800/40 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-teal-400" />
              <span>PII Redacted (Names, IDs & Plots Masked)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
