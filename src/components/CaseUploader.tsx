import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Play,
  Lock,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CaseData } from '../types';

interface Props {
  onLoadCase: (data: CaseData) => void;
  isLoading: boolean;
}

export const CaseUploader: React.FC<Props> = ({ onLoadCase, isLoading }) => {
  const [pasteText, setPasteText] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('Custom Uploaded Dispute');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load demo case from /api/demo-case
  const handleLoadDemo = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/demo-case');
      if (!res.ok) {
        throw new Error('Could not load demo cache.');
      }
      const data = await res.json();
      onLoadCase(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo case');
    } finally {
      setAnalyzing(false);
    }
  };

  // Analyze custom input
  const handleAnalyzeCustom = async () => {
    if (!pasteText.trim()) {
      setError('Please paste order sheet text or JSON hearings.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      let hearingsPayload: any[] = [];

      // Check if user pasted JSON
      if (pasteText.trim().startsWith('[') || pasteText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(pasteText);
          hearingsPayload = Array.isArray(parsed) ? parsed : parsed.hearings || [parsed];
        } catch (e) {
          // Fall back to splitting by paragraphs
        }
      }

      // If not JSON, split by lines or numbered orders
      if (hearingsPayload.length === 0) {
        const blocks = pasteText.split(/\n\s*\n/).filter((b) => b.trim().length > 15);
        hearingsPayload = blocks.map((block, idx) => ({
          order_no: idx + 1,
          date: `2023-0${(idx % 9) + 1}-15`,
          order_sheet_text: block.trim(),
          days_to_next_hearing: 35,
        }));
      }

      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle,
          caseNumber: 'O.S. Custom Intake',
          court: 'Court of Senior Civil Judge',
          hearings: hearingsPayload,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed on server.');
      }

      const caseResult = await response.json();
      onLoadCase(caseResult);
    } catch (err: any) {
      setError(err.message || 'Error parsing custom order sheets');
    } finally {
      setAnalyzing(false);
    }
  };

  // Sample prompt for user to test quickly
  const loadQuickSample = () => {
    setPasteText(`Order #1: Case called. Sri K. Ramaiah plaintiff present. Summons to Defendant No. 2 returned unserved. Issue fresh summons on payment of process fee. Adjourned to 15.03.2023.

Order #2: Case called. Defendant counsel filed memo seeking three weeks time for filing Written Statement and counter to injunction application. Time granted. Call on 20.04.2023.

Order #3: Case called. Witness P.W.1 absent. Learned counsel filed memo stating witness suffering from severe arthritis. Adjourned conditionally to 18.06.2023.

Order #4: Case called. Presiding Officer on casual leave. All matters adjourned en bloc as per notification. Post on 22.08.2023.

Order #5: Case called. Both parties present. P.W.1 present in box. Chief examination conducted and Ex.A1 to A5 marked. Cross-examination deferred to 10.10.2023.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Hero Intake Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Google AI Hackathon Prototype</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Case Delay Radar — Order Sheet Intake
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload multi-year court order sheets to pinpoint where the years went, isolate avoidable delays with verbatim evidentiary citations, and predict next-hearing postponement risk.
        </p>

        {/* Primary CTA: 1-Click Synthetic Demo Case */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLoadDemo}
            disabled={analyzing || isLoading}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Loading Benchmark Case...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Load Synthetic Demo (Ramaiah vs Neighbour — 60 Hearings, 9 Years)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual / Custom Order Sheet Intake */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>Or Analyze Custom Court Order Sheets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste court docket entries or JSON order sheets. Automated PII redaction masks all personal identifiers.
            </p>
          </div>

          <button
            onClick={loadQuickSample}
            type="button"
            className="text-xs font-mono text-teal-400 hover:text-teal-300 underline self-start sm:self-center cursor-pointer"
          >
            Insert 5-order sample
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/30 border border-rose-800 p-3 rounded-lg flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Case Title / Dispute Reference:
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., K. Ramaiah vs M. Venkat Reddy"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Free-Text Order Sheets (One per block or JSON Array):
            </label>
            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Case called. Sri [Advocate] present. Counsel for Defendant seeks two weeks time for counter. Adjourned to 15.04.2023..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500 leading-relaxed"
            />
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg">
            <Lock className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>PII Redaction Engine Active:</strong> Names, phone numbers, Aadhaar/PAN formats, and specific survey plot addresses are scrubbed client-side before sending to Gemini.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyzeCustom}
              disabled={analyzing || !pasteText.trim()}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold font-mono text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Orders...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Delay Radar Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
