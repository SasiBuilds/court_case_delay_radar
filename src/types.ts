export type AdjournmentCategory =
  | 'court_side'
  | 'extension_sought'
  | 'witness_absent'
  | 'lawyer_absent'
  | 'summons_not_served'
  | 'documents_pending'
  | 'productive'
  | 'unclear';

export interface Hearing {
  order_no: number;
  date: string;
  order_sheet_text: string;
  redacted_text?: string;
  redaction_meta?: {
    is_redacted: boolean;
    counts: { names: number; phones: number; ids: number; addresses: number };
  };
  category: AdjournmentCategory;
  reason_text: string;
  supporting_snippet: string;
  days_to_next_hearing: number;
  confidence: number;
  is_avoidable_by_litigant: boolean;
  source?: string;
}

export interface CategoryBreakdownItem {
  category: string;
  label: string;
  days: number;
  hearings_count: number;
  share_percent: number;
  is_avoidable_by_litigant: boolean;
}

export interface SummaryStats {
  total_listings: number;
  productive_hearings: number;
  adjournment_count: number;
  total_span_days: number;
  total_span_years: number;
  friction_days: number;
  friction_percent: number;
  avoidable_friction_days: number;
  avoidable_friction_percent: number;
  what_if_estimate: {
    factor: number;
    assumption_text: string;
    estimated_days_saved: number;
    estimated_years_saved: number;
  };
  category_breakdown: CategoryBreakdownItem[];
}

export interface RiskPrediction {
  risk_level: 'low' | 'medium' | 'high';
  most_likely_reason: string;
  recommended_actions: string[];
  rationale: string;
  method_used: 'frequency_baseline' | 'gemini_llm';
}

export interface TeluguTranslation {
  title: string;
  summary_te?: string;
  risk_level_te: string;
  most_likely_reason_te: string;
  recommended_actions_te: string[];
  rationale_te: string;
  what_if_te: string;
}

export interface CaseData {
  case_metadata: {
    title: string;
    case_number: string;
    court: string;
    suit_type?: string;
    total_listings: number;
    is_synthetic: boolean;
    label: string;
  };
  hearings: Hearing[];
  summary_stats: SummaryStats;
  predictions: {
    baseline: RiskPrediction;
    gemini: RiskPrediction;
  };
  telugu?: TeluguTranslation;
}

export interface BenchmarkMetrics {
  evaluation_timestamp: string;
  dataset_name: string;
  test_set_size: number;
  model_used: string;
  is_live_api: boolean;
  metrics: {
    reason_classification: {
      single_prompt_baseline_accuracy_pct: number;
      full_pipeline_accuracy_pct: number;
      absolute_gain_pct: number;
    };
    adjournment_risk_prediction: {
      frequency_baseline_accuracy_pct: number;
      pipeline_predictor_accuracy_pct: number;
      absolute_gain_pct: number;
    };
  };
  sample_verifications: Array<{
    order_no: number;
    ground_truth: string;
    predicted: string;
    correct: boolean;
    supporting_snippet: string;
    confidence: number;
  }>;
  markdown_table?: string;
}
