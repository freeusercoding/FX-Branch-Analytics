export type TransactionType = 'BUY' | 'SELL';
export type ProductType = 'SPOT' | 'FORWARD' | 'SWAP';
export type CustomerSegment = 'FDI' | 'XNK' | 'VIP' | 'RETAIL';

export interface FXTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  month: number; // 1-12
  quarter: number; // 1-4
  year: number; // e.g. 2025, 2026
  currencyPair: string; // e.g. USD/VND, EUR/VND
  baseCurrency: string; // e.g. USD, EUR, JPY
  type: TransactionType;
  productType: ProductType;
  customerName: string;
  customerSegment: CustomerSegment;
  volume: number; // in base currency
  volumeUSD: number;
  volumeVND: number;
  executionRate: number;
  costRate: number;
  profitVND: number;
  dealerName: string;
  status: 'COMPLETED' | 'SETTLED';
}

export interface TargetPlan {
  year: number;
  period: string; // 'Y2025' | 'Q1' | 'M01' etc.
  targetVolumeUSD: number;
  targetProfitVND: number;
}

export interface FXSummary {
  totalBuyUSD: number;
  totalSellUSD: number;
  totalVolumeUSD: number;
  totalVolumeVND: number;
  totalProfitVND: number;
  targetVolumeUSD: number;
  targetProfitVND: number;
  volumeCompletionRate: number;
  profitCompletionRate: number;
  marginBps: number;
  transactionCount: number;
  customerCount: number;
}

export interface PeriodComparison {
  periodKey: string;
  periodLabel: string;
  volumeUSD: number;
  volumeVND: number;
  profitVND: number;
  targetVolumeUSD: number;
  targetProfitVND: number;
  profitCompletionRate: number;
  growthVolumePct?: number;
  growthProfitPct?: number;
  marginBps: number;
  transactionCount: number;
}

export interface CurrencyBreakdownItem {
  currencyPair: string;
  volumeUSD: number;
  volumeVND: number;
  profitVND: number;
  percentageVolume: number;
  percentageProfit: number;
  transactionCount: number;
}

export interface SegmentBreakdownItem {
  segment: CustomerSegment;
  segmentLabel: string;
  volumeUSD: number;
  profitVND: number;
  percentageVolume: number;
  percentageProfit: number;
  customerCount: number;
}

export interface DealerPerformanceItem {
  dealerName: string;
  volumeUSD: number;
  profitVND: number;
  transactionCount: number;
  targetCompletionRate: number;
}

export type UserRole = 'DIRECTOR' | 'TREASURY_MANAGER' | 'FX_DEALER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  branchName: string;
  avatarUrl?: string;
}

export type TimeFilterType = 'ALL' | 'YEAR' | 'QUARTER' | 'MONTH';
