import { AdjournmentCategory } from '../types';

export const CATEGORY_COLORS: Record<AdjournmentCategory, { bg: string; text: string; hex: string; label: string }> = {
  productive: {
    bg: 'bg-teal-500/15',
    text: 'text-teal-400',
    hex: '#14B8A6',
    label: 'Productive Hearing',
  },
  court_side: {
    bg: 'bg-slate-700/30',
    text: 'text-slate-300',
    hex: '#64748B',
    label: 'Court-Side (Leave / Vacancy / Strike)',
  },
  extension_sought: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    hex: '#F59E0B',
    label: 'Time Sought for Pleadings',
  },
  witness_absent: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    hex: '#F97316',
    label: 'Witness Absent / Illness Memo',
  },
  lawyer_absent: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    hex: '#FB7185',
    label: 'Counsel Absent / Engaged in HC',
  },
  summons_not_served: {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    hex: '#EAB308',
    label: 'Summons Unserved / Batta Pending',
  },
  documents_pending: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    hex: '#38BDF8',
    label: 'Revenue Records / Report Pending',
  },
  unclear: {
    bg: 'bg-slate-800/40',
    text: 'text-slate-400',
    hex: '#94A3B8',
    label: 'Unclear / Generic Listing',
  },
};
