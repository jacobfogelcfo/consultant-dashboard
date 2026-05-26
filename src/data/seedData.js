// ─── SEED DATA ───────────────────────────────────────────────────────────────

export const CLIENTS = [
  {
    id: 'c1',
    name: 'AAA Corp',
    industry: 'Technology',
    contractPdf: null,
    paymentAmount: 18000,
    paymentCurrency: 'USD',
    paymentCadence: 'monthly',
    paymentCadenceDetail: 'First of month',
    services: ['Strategy Consulting', 'Market Analysis', 'Executive Advisory'],
    description: 'Long-term strategic advisory for their EMEA expansion. Focused on market entry, partnerships, and org design.',
    monthlyBudget: 7100,
    yearlyBudget: 85200,
    status: 'active',
    color: '#6366f1',
  },
  {
    id: 'c2',
    name: 'The Transportation Authority',
    industry: 'Government',
    contractPdf: null,
    paymentAmount: 45000,
    paymentCurrency: 'ILS',
    paymentCadence: 'quarterly',
    paymentCadenceDetail: 'First of Q1 month',
    services: ['Operations Consulting', 'Process Improvement', 'Staff Training'],
    description: 'Multi-phase operational improvement project. Phase 2 of 3 currently underway.',
    monthlyBudget: 4100,
    yearlyBudget: 49200,
    status: 'active',
    color: '#ec4899',
  },
  {
    id: 'c3',
    name: 'The Bagels Co.',
    industry: 'F&B',
    contractPdf: null,
    paymentAmount: 8000,
    paymentCurrency: 'USD',
    paymentCadence: 'monthly',
    paymentCadenceDetail: 'Net 30',
    services: ['Brand Strategy', 'Franchise Development'],
    description: 'Franchise expansion strategy across 3 cities. Brand playbook and franchisee selection process.',
    monthlyBudget: 2600,
    yearlyBudget: 31200,
    status: 'active',
    color: '#f59e0b',
  },
  {
    id: 'c4',
    name: 'Zylophone Media',
    industry: 'Media',
    contractPdf: null,
    paymentAmount: 12000,
    paymentCurrency: 'USD',
    paymentCadence: 'annually',
    paymentCadenceDetail: 'January 1st',
    services: ['Content Strategy', 'Digital Transformation'],
    description: 'Digital transformation roadmap. CMS migration and content ops redesign.',
    monthlyBudget: 3200,
    yearlyBudget: 38400,
    status: 'inactive',
    color: '#10b981',
  },
  {
    id: 'c5',
    name: 'NovaTech Solutions',
    industry: 'SaaS',
    contractPdf: null,
    paymentAmount: 22000,
    paymentCurrency: 'USD',
    paymentCadence: 'monthly',
    paymentCadenceDetail: 'First of month',
    services: ['Product Strategy', 'GTM Consulting', 'Pricing Advisory'],
    description: 'Series B growth strategy. GTM playbook, pricing model overhaul, and channel expansion.',
    monthlyBudget: 8500,
    yearlyBudget: 102000,
    status: 'active',
    color: '#8b5cf6',
  },
];

export const CATEGORIES = [
  { id: 'travel', name: 'Travel', type: 'COGS', color: '#6366f1' },
  { id: 'meals', name: 'Meals & Entertainment', type: 'COGS', color: '#ec4899' },
  { id: 'design', name: 'Design', type: 'COGS', color: '#f59e0b' },
  { id: 'subcontractors', name: 'Subcontractors', type: 'COGS', color: '#10b981' },
  { id: 'software', name: 'Software & Tools', type: 'OPEX', color: '#8b5cf6' },
  { id: 'salary', name: 'Salary', type: 'OPEX', color: '#06b6d4' },
  { id: 'office', name: 'Office & Admin', type: 'OPEX', color: '#84cc16' },
  { id: 'marketing', name: 'Marketing', type: 'OPEX', color: '#f97316' },
  { id: 'legal', name: 'Legal & Accounting', type: 'OPEX', color: '#ef4444' },
  { id: 'reimbursement', name: 'Reimbursements', type: 'REIMBURSEMENT', color: '#14b8a6' },
];

// Generate monthly P&L data for 18 months (12 past + 6 future projected)
const months = ['Jul 24','Aug 24','Sep 24','Oct 24','Nov 24','Dec 24','Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25'];

export const PNL_DATA = months.map((month, i) => {
  const isProjected = i >= 12;
  const base = 55000 + Math.sin(i * 0.5) * 8000 + i * 800;
  const revenue = isProjected ? base * 1.05 : base + (Math.random() - 0.4) * 6000;
  const cogs = revenue * (0.28 + Math.random() * 0.06);
  const opex = revenue * (0.18 + Math.random() * 0.04);
  const reimbursements = cogs * 0.12;
  const net = revenue - cogs - opex + reimbursements;

  return {
    month,
    isProjected,
    revenue: Math.round(revenue),
    cogs: Math.round(cogs),
    opex: Math.round(opex),
    reimbursements: Math.round(reimbursements),
    net: Math.round(net),
    margin: Math.round((net / revenue) * 100),
    byClient: {
      c1: Math.round(revenue * 0.30),
      c2: Math.round(revenue * 0.22),
      c3: Math.round(revenue * 0.15),
      c4: Math.round(revenue * 0.18),
      c5: Math.round(revenue * 0.15),
    },
    byCategory: {
      travel: Math.round(cogs * 0.25),
      meals: Math.round(cogs * 0.15),
      design: Math.round(cogs * 0.20),
      subcontractors: Math.round(cogs * 0.40),
      software: Math.round(opex * 0.15),
      salary: Math.round(opex * 0.55),
      office: Math.round(opex * 0.10),
      marketing: Math.round(opex * 0.12),
      legal: Math.round(opex * 0.08),
    },
  };
});

// Client monthly data
export const CLIENT_MONTHLY_DATA = {};
CLIENTS.forEach(client => {
  CLIENT_MONTHLY_DATA[client.id] = months.map((month, i) => {
    const revenue = Math.round(client.paymentAmount * (0.85 + Math.random() * 0.3));
    const expenses = Math.round(client.monthlyBudget * (0.6 + Math.random() * 0.8));
    const reimbursements = Math.round(expenses * 0.1);
    const net = revenue - expenses + reimbursements;
    return {
      month,
      revenue,
      expenses,
      reimbursements,
      net,
      margin: Math.round((net / revenue) * 100),
      lineItems: [
        { category: 'Travel', amount: Math.round(expenses * 0.25), type: 'expense' },
        { category: 'Subcontractors', amount: Math.round(expenses * 0.40), type: 'expense' },
        { category: 'Design', amount: Math.round(expenses * 0.20), type: 'expense' },
        { category: 'Meals', amount: Math.round(expenses * 0.15), type: 'expense' },
        { category: 'Travel Reimbursement', amount: Math.round(reimbursements * 0.7), type: 'reimbursement' },
        { category: 'Misc Reimbursement', amount: Math.round(reimbursements * 0.3), type: 'reimbursement' },
      ],
    };
  });
});

// Bank accounts
export const BANK_ACCOUNTS = [
  { id: 'b1', bank: 'Hapoalim', name: 'Main ILS Account', currency: 'ILS', balance: 285000, accountNumber: '****4821' },
  { id: 'b2', bank: 'Hapoalim', name: 'FX Dollar Account', currency: 'USD', balance: 48200, accountNumber: '****7734' },
  { id: 'b3', bank: 'Wells Fargo', name: 'US Operations', currency: 'USD', balance: 32500, accountNumber: '****9012' },
  { id: 'b4', bank: 'Wise', name: 'Wise Multi-Currency', currency: 'USD', balance: 12800, accountNumber: '****3301' },
];

export const CC_ACCOUNTS = [
  { id: 'cc1', name: 'Amex Business', bank: 'Amex', currency: 'USD', spent: 8400, limit: 25000, dueDate: 'Jun 15, 2025', color: '#6366f1' },
  { id: 'cc2', name: 'Visa Hapoalim', bank: 'Hapoalim', currency: 'ILS', spent: 14200, limit: 40000, dueDate: 'Jun 10, 2025', color: '#ec4899' },
  { id: 'cc3', name: 'Mastercard Wise', bank: 'Wise', currency: 'USD', spent: 3100, limit: 10000, dueDate: 'Jun 22, 2025', color: '#10b981' },
];

// Cash projection data
export const CASH_DATA = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2025, 4, 1);
  date.setDate(date.getDate() + i);
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const ilsBalance = 285000 + Math.sin(i * 0.15) * 30000 + i * 800 - Math.random() * 5000;
  const usdBalance = 93500 + Math.sin(i * 0.12) * 10000 + i * 300 - Math.random() * 2000;
  return {
    date: label,
    ils: Math.round(ilsBalance),
    usd: Math.round(usdBalance),
    total_usd: Math.round(usdBalance + ilsBalance / 3.7),
    isProjected: i > 0,
  };
});

// Transactions feed
let txId = 1;
export const TRANSACTIONS = [
  {
    id: `tx${txId++}`, date: 'May 26, 2025', type: 'expense', status: 'pending',
    description: 'CC Repayment', vendor: 'Bank Transfer', amount: -4089,
    currency: 'USD', category: 'CC Repayment', clientId: null,
    isCC: false, dueDate: 'May 12', recurring: true, recurringFreq: 'monthly',
    ccLimit: 10000, bank: 'Wells Fargo',
  },
  {
    id: `tx${txId++}`, date: 'May 15, 2025', type: 'expense', status: 'paid',
    description: 'Graphic Design Services', vendor: 'Studio Pixel', amount: -2200,
    currency: 'USD', category: 'Design', clientId: 'c1',
    isCC: true, ccAccount: 'Amex Business', bank: null,
    reimbursable: true, reimbursed: false,
  },
  {
    id: `tx${txId++}`, date: 'May 15, 2025', type: 'expense', status: 'pending',
    description: 'AAA Travel — Tel Aviv', vendor: 'El Al Airlines', amount: -4089,
    currency: 'USD', category: 'Travel', clientId: 'c1',
    isCC: true, ccAccount: 'Amex Business', bank: null,
    reimbursable: true, reimbursed: false, dueDate: 'May 15',
  },
  {
    id: `tx${txId++}`, date: 'May 20, 2025', type: 'income', status: 'paid',
    description: 'AAA Corp — May Retainer', vendor: 'AAA Corp', amount: 18000,
    currency: 'USD', category: 'Revenue', clientId: 'c1',
    isCC: false, bank: 'Wells Fargo',
  },
  {
    id: `tx${txId++}`, date: 'May 18, 2025', type: 'expense', status: 'paid',
    description: 'NovaTech — Subcontractor', vendor: 'Dev Studio Ltd', amount: -6500,
    currency: 'USD', category: 'Subcontractors', clientId: 'c5',
    isCC: false, bank: 'Wells Fargo',
  },
  {
    id: `tx${txId++}`, date: 'May 10, 2025', type: 'income', status: 'pending',
    description: 'Transportation Auth — Q2 Payment', vendor: 'TRA', amount: 45000,
    currency: 'ILS', category: 'Revenue', clientId: 'c2',
    isCC: false, bank: 'Hapoalim',
  },
  {
    id: `tx${txId++}`, date: 'May 8, 2025', type: 'expense', status: 'paid',
    description: 'Notion — Annual Plan', vendor: 'Notion', amount: -960,
    currency: 'USD', category: 'Software & Tools', clientId: null,
    isCC: true, ccAccount: 'Mastercard Wise', bank: null,
    recurring: true, recurringFreq: 'annually',
  },
  {
    id: `tx${txId++}`, date: 'May 5, 2025', type: 'expense', status: 'paid',
    description: 'Team Lunch — Strategy', vendor: 'Al Dente', amount: -340,
    currency: 'USD', category: 'Meals & Entertainment', clientId: 'c3',
    isCC: true, ccAccount: 'Amex Business', bank: null,
  },
  {
    id: `tx${txId++}`, date: 'May 1, 2025', type: 'income', status: 'paid',
    description: 'NovaTech — May Retainer', vendor: 'NovaTech Solutions', amount: 22000,
    currency: 'USD', category: 'Revenue', clientId: 'c5',
    isCC: false, bank: 'Wells Fargo',
  },
  {
    id: `tx${txId++}`, date: 'Apr 28, 2025', type: 'expense', status: 'paid',
    description: 'Legal Retainer — Q2', vendor: 'Cohen & Associates', amount: -3500,
    currency: 'ILS', category: 'Legal & Accounting', clientId: null,
    isCC: false, bank: 'Hapoalim',
  },
  {
    id: `tx${txId++}`, date: 'Jun 1, 2025', type: 'income', status: 'pending',
    description: 'AAA Corp — Jun Retainer', vendor: 'AAA Corp', amount: 18000,
    currency: 'USD', category: 'Revenue', clientId: 'c1',
    isCC: false, bank: 'Wells Fargo', isProjected: true,
  },
  {
    id: `tx${txId++}`, date: 'Jun 5, 2025', type: 'expense', status: 'pending',
    description: 'Salary — June', vendor: 'Payroll', amount: -14000,
    currency: 'USD', category: 'Salary', clientId: null,
    isCC: false, bank: 'Wells Fargo', recurring: true, recurringFreq: 'monthly', isProjected: true,
  },
];

export const SPEND_CATEGORIES_DATA = CATEGORIES.map(cat => {
  const monthlyBudget = cat.type === 'OPEX'
    ? [4000, 8000, 25000, 2000, 3000, 1200][CATEGORIES.filter(c => c.type === 'OPEX').indexOf(cat)] || 3000
    : [3500, 1800, 4500, 12000][CATEGORIES.filter(c => c.type === 'COGS').indexOf(cat)] || 2000;

  const monthlySpent = Math.round(monthlyBudget * (0.4 + Math.random() * 0.9));

  return {
    ...cat,
    monthlyBudget,
    yearlyBudget: monthlyBudget * 12,
    monthlySpent,
    yearlySpent: Math.round(monthlyBudget * 12 * (0.5 + Math.random() * 0.6)),
    clientBreakdown: {
      c1: Math.round(monthlySpent * 0.3),
      c2: Math.round(monthlySpent * 0.2),
      c3: Math.round(monthlySpent * 0.15),
      c5: Math.round(monthlySpent * 0.2),
      general: Math.round(monthlySpent * 0.15),
    },
  };
});