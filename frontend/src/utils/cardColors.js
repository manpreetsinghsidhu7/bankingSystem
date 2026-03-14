// Shared card color themes — index 0 for 1st account, 1 for 2nd, 2 for 3rd
export const CARD_COLORS = [
  { from: 'from-surface-900', to: 'to-surface-950', chip: 'from-brand-400 to-brand-600', accent: 'rgba(251,191,36,0.4)', label: 'Gold' },
  { from: 'from-blue-950', to: 'to-slate-950', chip: 'from-blue-400 to-blue-600', accent: 'rgba(96,165,250,0.4)', label: 'Sapphire' },
  { from: 'from-emerald-950', to: 'to-slate-950', chip: 'from-emerald-400 to-emerald-600', accent: 'rgba(52,211,153,0.4)', label: 'Emerald' },
];

export const getCardColor = (index) => CARD_COLORS[index % 3];
