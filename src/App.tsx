import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { CaseAutopsy } from './components/CaseAutopsy';
import { NextHearingCard } from './components/NextHearingCard';
import { ProofSlide } from './components/ProofSlide';
import { CaseUploader } from './components/CaseUploader';
import { CaseData } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'intake' | 'autopsy' | 'next-hearing' | 'proof'>('autopsy');
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);

  // Auto-load demo case on initial startup for zero-latency experience
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/demo-case');
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
        }
      } catch (err) {
        console.error('Failed to auto-load initial demo case:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Voice playback handler (Gemini TTS with browser SpeechSynthesis fallback)
  const handlePlayVoice = async () => {
    if (!caseData) return;
    setIsPlayingVoice(true);

    let speakText = '';
    if (lang === 'te') {
      const te = caseData.telugu;
      speakText = te?.summary_te
        ? `${te.title}. ${te.summary_te} తదుపరి వాయిదా ప్రమాదం: ${te.risk_level_te}. సిఫార్సు చేయబడిన చర్యలు: ${te.recommended_actions_te.join('. ')}`
        : 'కేస్ ఆలస్య రాడార్. విశ్లేషణ పూర్తయింది.';
    } else {
      const pred = caseData.predictions.gemini || caseData.predictions.baseline;
      const stats = caseData.summary_stats;
      speakText = `Case Delay Radar autopsy for ${caseData.case_metadata.title}. Total ${stats.total_listings} hearings spanning ${stats.total_span_years} years. Only ${stats.productive_hearings} productive hearings were held, resulting in ${stats.friction_percent} percent of case time lost to adjournments. Next hearing adjournment risk is ${pred.risk_level}. Top recommended action: ${pred.recommended_actions[0] || 'review cause list'}.`;
    }

    try {
      const res = await fetch('/api/tts-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speakText,
          language: lang,
        }),
      });

      const json = await res.json();

      if (json.audioBase64) {
        const audio = new Audio(`data:${json.mimeType || 'audio/wav'};base64,${json.audioBase64}`);
        audio.onended = () => setIsPlayingVoice(false);
        audio.onerror = () => {
          fallbackBrowserSpeech(speakText, lang);
        };
        await audio.play();
      } else {
        fallbackBrowserSpeech(speakText, lang);
      }
    } catch (err) {
      console.warn('TTS request error, falling back to browser speech:', err);
      fallbackBrowserSpeech(speakText, lang);
    }
  };

  const fallbackBrowserSpeech = (text: string, currentLang: 'en' | 'te') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingVoice(false);
    }
  };

  const handleCaseLoaded = (newCase: CaseData) => {
    setCaseData(newCase);
    setActiveTab('autopsy');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Disclaimer and Legal Firewall Bar */}
      <DisclaimerBanner isSynthetic={caseData?.case_metadata.is_synthetic ?? true} isRedacted={true} />

      {/* Strict 3-zone Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onPlayVoice={handlePlayVoice}
        isPlayingVoice={isPlayingVoice}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400 font-mono text-sm space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <div>Initializing Case Delay Radar Engine...</div>
          </div>
        ) : (
          <>
            {activeTab === 'intake' && (
              <CaseUploader onLoadCase={handleCaseLoaded} isLoading={isLoading} />
            )}

            {activeTab === 'autopsy' && caseData && (
              <CaseAutopsy caseData={caseData} lang={lang} />
            )}

            {activeTab === 'next-hearing' && caseData && (
              <NextHearingCard
                baselinePrediction={caseData.predictions.baseline}
                geminiPrediction={caseData.predictions.gemini}
                telugu={caseData.telugu}
                lang={lang}
                onPlayVoice={handlePlayVoice}
                isPlayingVoice={isPlayingVoice}
              />
            )}

            {activeTab === 'proof' && <ProofSlide />}
          </>
        )}
      </main>

      {/* Clean, Non-slop Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Case Delay Radar · Google AI Hackathon Prototype (India Judicial Decision Support)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span aria-hidden="true">·</span>
            <span>Telugu & English Localization</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
