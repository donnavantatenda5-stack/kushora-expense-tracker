export interface NavItem {
  name: string;
  label: string;
  icon: string;
}

/** Drives both the tab bar and the screen titles. */
export const NAV: NavItem[] = [
  { name: 'index', label: 'Dashboard', icon: '⌂' },
  { name: 'transactions', label: 'Transactions', icon: '☰' },
  { name: 'expenses', label: 'Expenses', icon: '−' },
  { name: 'income', label: 'Income', icon: '+' },
  { name: 'categories', label: 'Categories', icon: '◫' },
  { name: 'reports', label: 'Reports', icon: '▥' },
  { name: 'assistant', label: 'Assistant', icon: '✦' },
  { name: 'settings', label: 'Settings', icon: '⚙' },
];

export const titleFor = (name: string): string =>
  NAV.find((n) => n.name === name)?.label ?? 'Kushora';
