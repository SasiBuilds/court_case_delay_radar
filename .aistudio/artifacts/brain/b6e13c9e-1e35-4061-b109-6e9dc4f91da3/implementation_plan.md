# Case Delay Radar — Judicial Delay Decision Support System

An AI decision-support platform for litigants, legal aid clinics, and lawyers in India to analyze multi-year court order sheets, pinpoint adjournment bottlenecks with source citations, predict next-hearing adjournment risk, and recommend concrete proactive interventions in English and Telugu.

> [!IMPORTANT]
> **Core Guardrails & Hackathon Rules**:
> 1. **No Legal Verdict / Outcome Prediction**: Strict ethical firewall. The tool only classifies adjournment causes and procedural delays; it never predicts verdicts or substitutes for judicial authority. A prominent permanent disclaimer is rendered on all screens.
> 2. **Mandatory Evidentiary Citations**: Every delay claim, category tag, and date calculation must cite the specific source order number, date, and exact verbatim snippet from the order sheet.
> 3. **Client-Side & Pipeline PII Redaction**: Automated redaction of litigant personal names, phone numbers, Aadhaar/PAN formats, and physical plot addresses before model invocation, with explicit "Redacted for Privacy" indicators in the UI.
> 4. **Resilient Offline Cache**: Pre-computed and verified results for the synthetic benchmark case ("Ramaiah vs Neighbour", 60 hearings over 9 years) stored in `/data` so judges and evaluators always have zero-latency instant loading even if offline or if API quotas are exhausted.

---

## 1. Overview & Core Concept

- **What It Does**: Reads multi-year court order sheets, redacts PII, and uses Gemini structured outputs to categorize adjournments into standard legal friction classes (`court_side`, `extension_sought`, `witness_absent`, `lawyer_absent`, `summons_not_served`, `documents_pending`, `productive`, and `unclear`). It visualizes where the years were lost on an interactive autopsy timeline, estimates avoidable friction days, predicts the risk level for the upcoming hearing using both baseline frequency and Gemini sequence reasoning, and produces Telugu text + audio summaries.
- **Target Audience & Persona**: Litigants navigating prolonged civil/land disputes, grassroots legal-aid clinics (Lok Adalat / DLSA paralegals), and junior advocates preparing for procedural hearings.
- **Key Value**: Replaces 60+ pages of scattered, hard-to-read court handwriting/transcripts with an instant procedural timeline, quantifiable delay metrics ("68% avoidable delay days"), and actionable preparation cards before the next listing.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Case Intake & Demo Loader**:
   - Single-click "Load Synthetic Demo Case (Ramaiah vs Neighbour — 9 Years, 60 Listings)" with pre-analyzed fallback cache.
   - Or drag-and-drop / paste synthetic order sheet JSON or raw hearing text with automated redaction preview toggle.
2. **Case Autopsy Dashboard**:
   - High-impact KPI strip: Total Listings (60), Productive Hearings (~9), Friction Days (~2,700d / ~82%), Total Span (9.0 years), and Avoidable Litigant Days.
   - Interactive timeline: Horizontal sequence of 60 colour-coded bars scaled by days-to-next-hearing. Clicking any hearing opens the Inspector Drawer showing order date, presiding judge bench notes, verbatim cited snippet, and categorized delay driver.
   - Adjournment Breakdown Chart: Horizontal bar breakdown of percentage and days per delay category.
   - What-if Calculation: "If half of avoidable friction days (lawyer/witness/documents) were resolved, ~3.1 years saved" with explicit methodology notes that `court_side` delays are excluded.
3. **Next-Hearing Action Card**:
   - Procedural Risk Assessment: Amber/Teal/Rose indicator (`Low`, `Medium`, `High` risk of adjournment).
   - Side-by-side comparison: Simple Frequency Baseline vs. Gemini Contextual Predictor.
   - Litigant Action Checklist: Concrete, non-legal procedural steps (e.g., "Issue dasti summons copy to witness PW-2", "Submit counter-affidavit 48 hours prior to registry").
4. **Bilingual Telugu Toggle & Speech**:
   - Instant English / Telugu (తెలుగు) toggle for the autopsy summary and action cards.
   - Audio playback button using Gemini TTS / browser SpeechSynthesis (`te-IN`).
5. **Proof & Benchmarks View**:
   - Displays real empirical metrics from `scripts/evaluate.py` run against 40+ synthetic ground-truth test hearings.
   - Accuracy comparisons: Pipeline vs. Single-prompt Baseline on classification; Frequency vs. Gemini next-hearing predictor.

### Visual Identity & Theme
- **Theme**: Dark, authoritative judicial console (`#0B0F17` slate-black canvas with `#151D2A` structural cards and hairline `#1E293B` borders).
- **Accents**: Deep warm Amber (`#F59E0B` for procedural friction / warnings), Judicial Teal (`#14B8A6` for productive listings & verified citations), Muted Crimson (`#EF4444` for high adjournment risk).
- **Typography**: Clean sans (`Plus Jakarta Sans` / `Outfit`) for structured UI, paired with tabular numerals (`JetBrains Mono` / `tabular-nums`) for hearing intervals, order numbers, and percentages.
- **Accessibility & Projector Readiness**: High-contrast labels, WCAG AA compliance, text-wrap balance on headlines, no decorative pills or low-contrast AI fluff.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: FastAPI Python Backend + Vite React Frontend with Server Proxy**:
  - *Chosen Approach*: FastAPI running on `127.0.0.1:8000` with the official `google-genai` Python SDK; Vite dev server running on port `3000` with transparent `/api` proxying.
  - *Why*: Enables rapid asynchronous batch processing of 60 order sheets with Pydantic structured schemas, direct execution of the evaluation CLI scripts (`scripts/generate_data.py`, `scripts/evaluate.py`), and seamless interoperability.
- **Decision 2: Strict Citation Schema with Unclear Category**:
  - *Chosen Approach*: Force Gemini to extract an exact verbatim substring as `supporting_snippet` and allow `unclear` instead of hallucinating a category when an order is brief (e.g. "Adjourned on request").
  - *Why*: Prevents model hallucinations; every tag presented to a litigant is verifiable against the original record.
- **Decision 3: Dual Predictor Display (Rule Baseline vs. Gemini LLM)**:
  - *Chosen Approach*: Show both predictions and their reasoning transparently on the Next Hearing Card.
  - *Why*: Demonstrates real ML engineering rigor for hackathon judges rather than black-box claims.
- **Decision 4: Two-Tier Voice Architecture**:
  - *Chosen Approach*: Attempt Gemini TTS (`gemini-3.8-flash-lite-tts`) via backend endpoint; automatically fall back to browser Web Speech API (`SpeechSynthesisUtterance` with `te-IN` locale) if offline or rate-limited.
  - *Why*: Guarantees voice playback always functions during live demos without latency or quota errors.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Case Delay Radar UI                           │
│  [Upload / Demo]  [Case Autopsy]  [Next Hearing]  [Proof / Benchmarks] │
│  (React 19 + Tailwind CSS + Lucide Icons + Recharts + Web Audio API)   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ /api/proxy (Port 3000 -> 8000)
┌────────────────────────────────────▼───────────────────────────────────┐
│                      FastAPI Service (backend/)                         │
│  ├─ POST /api/analyze-case       (PII redact -> batch Gemini classify) │
│  ├─ GET  /api/demo-case          (Cached 60-hearing benchmark dataset)  │
│  ├─ POST /api/predict-next       (Baseline frequency + Gemini predictor)│
│  ├─ POST /api/translate-telugu   (Telugu translation of action cards)  │
│  ├─ POST /api/tts-audio          (Gemini TTS audio with WAV output)    │
│  └─ GET  /api/evaluation-results (Benchmark results from evaluate.py)  │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │                                          │
┌──────────────▼─────────────┐             ┌──────────────▼──────────────┐
│       Google GenAI SDK     │             │       File Storage /data     │
│   (models/gemini-3.8-flash)│             │  ├─ ramaiah_vs_neighbour.json│
│   • Structured Pydantic    │             │  ├─ test_order_sheets.json  │
│   • Asynchronous Batching  │             │  ├─ benchmark_results.json  │
│   • Telugu Localization    │             │  └─ demo_cache.json         │
└────────────────────────────┘             └─────────────────────────────┘
```

### Data Models & Schemas

```python
class AdjournmentCategory(str, Enum):
    COURT_SIDE = "court_side"
    EXTENSION_SOUGHT = "extension_sought"
    WITNESS_ABSENT = "witness_absent"
    LAWYER_ABSENT = "lawyer_absent"
    SUMMONS_NOT_SERVED = "summons_not_served"
    DOCUMENTS_PENDING = "documents_pending"
    PRODUCTIVE = "productive"
    UNCLEAR = "unclear"

class HearingAnalysis(BaseModel):
    order_no: int
    date: str
    category: AdjournmentCategory
    reason_text: str
    supporting_snippet: str
    days_to_next_hearing: int
    confidence: float
    is_avoidable_by_litigant: bool
```

### Component & State Plan
- **`CaseAutopsy`**: Timeline strip of hearings, summary KPI cards, category breakdown bar chart, avoidable days slider/calculator, and sliding inspector panel displaying original order text with highlighted supporting snippet.
- **`NextHearingCard`**: Dual-method risk prediction gauge (Low/Med/High), risk drivers, and targeted procedural checklist.
- **`TeluguToggleBar`**: State toggle switching active language between English and Telugu, with voice synthesizer trigger.
- **`ProofPage`**: Accuracy matrix, confusion table, evaluation dataset size, and comparative benchmark metrics.
- **`DisclaimerBanner`**: Unobtrusive legal disclaimer and "Synthetic example" indicator.

---

## 5. Implementation Sequence & Verification

1. **Step 1: Synthetic Data Engine (`scripts/generate_data.py`)**:
   - Generate realistic 60-hearing dispute "Ramaiah vs Neighbour" over ~3,285 days with 9 productive listings and 51 adjournments across all 6 delay categories.
   - Generate 40 separate labelled test cases for evaluation.
2. **Step 2: Backend Pipeline (`backend/pipeline.py`, `backend/main.py`)**:
   - PII regex and tokenizer redactor (masks names, mobile numbers, Aadhaar patterns, survey numbers).
   - Gemini structured classifier with fallback to deterministic heuristics/cache on API failure.
   - Predictor comparing 5-hearing rolling frequency against Gemini prompt reasoning.
   - Telugu translation and TTS audio endpoint.
3. **Step 3: Evaluation Suite (`scripts/evaluate.py`)**:
   - Run baseline single-prompt vs structured pipeline on 40 test cases.
   - Save real accuracy stats to `/data/benchmark_results.json`.
4. **Step 4: Frontend Implementation (`src/App.tsx`, components)**:
   - Modern dark-mode judicial dashboard with Recharts, interactive timeline, drawer inspector, Telugu toggle, and audio player.
5. **Step 5: End-to-End Verification & Documentation**:
   - Verify all API endpoints, run evaluation script, verify compilation, and deliver complete README.md.
