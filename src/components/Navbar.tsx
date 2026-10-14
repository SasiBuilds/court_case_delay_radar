import React from 'react';
import { Radar, Languages, Volume2, Loader2 } from 'lucide-react';

interface Props {
  activeTab: 'intake' | 'autopsy' | 'next-hearing' | 'proof';
  setActiveTab: (tab: 'intake' | 'autopsy' | 'next-hearing' | 'proof') => void;
  lang: 'en' | 'te';
  setLang: (lang: 'en' | 'te') => void;
  onPlayVoice: () => void;
  isPlayingVoice: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onPlayVoice,
  isPlayingVoice,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radar className="w-5 h-5 text-teal-400" />
          </div>
          <button
            onClick={() => setActiveTab('autopsy')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-base font-bold tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors whitespace-nowrap">
              Case Delay Radar
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Judicial Bottleneck Analytics
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800/80 rounded-lg">
          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'intake'
                ? 'bg-slate-800 text-teal-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Intake & Demo
          </button>

          <button
            onClick={() => setActiveTab('autopsy')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'autopsy'
                ? 'bg-slate-800 text-teal-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Case Autopsy
          </button>

          <button
            onClick={() => setActiveTab('next-hearing')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'next-hearing'
                ? 'bg-slate-800 text-teal-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Next Hearing Card
          </button>

          <button
            onClick={() => setActiveTab('proof')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'proof'
                ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Proof & Evaluation
          </button>
        </nav>

        {/* Zone 3: Language Toggle & Audio Playback Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPlayVoice}
            disabled={isPlayingVoice}
            title={lang === 'te' ? 'వాయిస్ ప్లే చేయండి' : 'Play Audio Summary'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-teal-400 hover:border-teal-500/40 transition-all cursor-pointer disabled:opacity-60"
          >
            {isPlayingVoice ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span className="hidden sm:inline">Playing...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">{lang === 'te' ? 'వాయిస్' : 'Play Voice'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
