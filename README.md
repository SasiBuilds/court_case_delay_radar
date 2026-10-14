# Case Delay Radar ⚡

> **Google AI Hackathon Prototype** — Empirical Decision-Support & Adjournment Forensics for Indian Litigants, Advocates, and Legal Aid Clinics.

---

## ⚖️ Problem & Concept

The Indian judicial system faces a pendency crisis exceeding 50 million cases, where ordinary land and civil disputes routinely stretch across 8–15 years. Much of this time is lost not to substantive hearings, but to recurrent procedural adjournments (missing summons, absent witnesses, illness memos, and unverified boundaries). Litigants and legal aid paralegals receive scattered 2-line order sheets with little insight into where the years went or how to prevent the next postponement.

**Case Delay Radar** reads multi-year court order sheets, automatically masks all personal identifying information (PII), and applies Google Gemini structured extraction to:
1. **Dissect Court History ("Case Autopsy")**: Classify why each listing was adjourned into standard procedural categories (`court_side`, `extension_sought`, `witness_absent`, `lawyer_absent`, `summons_not_served`, `documents_pending`, `productive`, `unclear`).
2. **Mandatory Evidentiary Citations**: Every single classification is grounded in an exact, verbatim supporting snippet from the source docket sheet.
3. **What-If Friction Quantification**: Calculate calendar years lost to litigant-avoidable friction vs. non-avoidable court-side delays.
4. **Predict Next-Hearing Adjournment Risk**: Compare a rolling Markov frequency baseline with Gemini sequence reasoning, supplying concrete procedural action cards.
5. **Bilingual Localization (English + Telugu)**: Instant toggle for Telugu (`తెలుగు`) script and audio voice playback (via Gemini TTS with browser Web Speech API fallback).

---

## 🛡️ Hard Guardrails & Ethics

- **No Verdict or Outcome Prediction**: Strict ethical firewall. The tool classifies procedural delay drivers only; it NEVER predicts verdicts or replaces judicial discretion.
- **Client & Pipeline PII Redaction**: Litigant names, phone numbers, 12-digit Aadhaar patterns, PAN numbers, and survey plot addresses are masked before LLM ingestion.
- **Synthetic Example Label**: Demo cases are labelled "Synthetic example" in the UI.
- **Resilient Fallback**: If Gemini API limits or offline conditions occur, pre-computed verified caches and deterministic regex heuristics ensure zero-downtime live presentations.

---

## 🏗️ Tech Stack

- **Backend**: Python 3.11, FastAPI / Express bridge (`server.ts`), `google-genai` TypeScript & Python SDKs, `pydantic` schemas.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Recharts.
- **Typography & UI**: Plus Jakarta Sans, JetBrains Mono tabular figures, Dark Judicial Slate palette (`#080C14`), Amber (`#F59E0B`) and Judicial Teal (`#14B8A6`) accents.

---

## 🚀 Getting Started

### 1. Environment Variables

Create `.env` based on `.env.example`:

```bash
# Gemini API Key (injected automatically in AI Studio Build)
GEMINI_API_KEY="your-gemini-api-key"

# Gemini Model alias (defaults to models/gemini-3.8-flash)
GEMINI_MODEL="models/gemini-3.8-flash"
```

### 2. Install & Run Dev Server

```bash
# Install npm dependencies
npm install

# Run the full-stack server (dev mode on port 3000)
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## 📊 How to Run the Evaluation Suite (`evaluate.py`)

To verify accuracy on the 40-hearing ground-truth test set:

```bash
# 1. Generate synthetic case and test datasets (if not already generated)
python3 scripts/generate_data.py

# 2. Run benchmark evaluation comparing baseline vs. pipeline
python3 scripts/evaluate.py
```

### Empirical Evaluation Results ("Proof" Slide)

| Task / Benchmark Metric | Plain Baseline | Case Delay Radar Pipeline | Net Improvement |
| :--- | :---: | :---: | :---: |
| **Reason Classification Accuracy** | **2.5%** | **90.0%** | **+87.5%** |
| **Next-Hearing Adjournment Prediction** | **83.7%** | **83.7%** | **+0.0%** |
| **Source Evidentiary Citation Rate** | 0.0% (none) | **100.0% (verbatim)** | **+100.0%** |
| **Test Set Size** | 40 hearings | 40 hearings | — |

*Results saved to `data/benchmark_results.json` and viewable directly in the app's "Proof & Evaluation" tab.*

---

## ⚠️ Known Limitations & Honesty

1. **OCR Hand-Written Variations**: In real subordinate courts, order sheets may be handwritten in cursive by court stenographers; standard OCR errors must be normalized before classification.
2. **Substituted Service Latency**: Court registry summons times can vary drastically across rural revenue talukas depending on local Nazir staff staffing levels.
3. **Court-Side Delay Invariance**: Litigants cannot avoid bench leaves or Bar Association strikes (`court_side`), which is why the What-If calculation explicitly excludes them.
4. **Adjournment Prediction Uncertainty**: Procedural predictions are probabilistic based on historical patterns and cannot account for unforeseen emergency events.
