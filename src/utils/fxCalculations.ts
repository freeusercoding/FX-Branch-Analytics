import {
  FXTransaction,
  FXSummary,
  PeriodComparison,
  CurrencyBreakdownItem,
  SegmentBreakdownItem,
  DealerPerformanceItem,
  TargetPlan,
  CustomerSegment,
} from '../types/fx';

export function formatVND(amount: number, short = false): string {
  if (short) {
    if (Math.abs(amount) >= 1e9) {
      return `${(amount / 1e9).toFixed(2)} tỷ`;
    }
    if (Math.abs(amount) >= 1e6) {
      return `${(amount / 1e6).toFixed(1)} tr`;
    }
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number, short = false): string {
  if (short) {
    if (Math.abs(amount) >= 1e6) {
      return `$${(amount / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1e3) {
      return `$${(amount / 1e3).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculateSummary(
  transactions: FXTransaction[],
  targets: TargetPlan[],
  selectedYear: number,
  selectedQuarter: number | 'ALL',
  selectedMonth: number | 'ALL'
): FXSummary {
  let filtered = transactions.filter((t) => t.year === selectedYear);

  if (selectedQuarter !== 'ALL') {
    filtered = filtered.filter((t) => t.quarter === selectedQuarter);
  }
  if (selectedMonth !== 'ALL') {
    filtered = filtered.filter((t) => t.month === selectedMonth);
  }

  const totalBuyUSD = filtered
    .filter((t) => t.type === 'BUY')
    .reduce((sum, t) => sum + t.volumeUSD, 0);

  const totalSellUSD = filtered
    .filter((t) => t.type === 'SELL')
    .reduce((sum, t) => sum + t.volumeUSD, 0);

  const totalVolumeUSD = filtered.reduce((sum, t) => sum + t.volumeUSD, 0);
  const totalVolumeVND = filtered.reduce((sum, t) => sum + t.volumeVND, 0);
  const totalProfitVND = filtered.reduce((sum, t) => sum + t.profitVND, 0);

  // Calculate target for current selection
  let targetVolumeUSD = 0;
  let targetProfitVND = 0;

  const relevantTargets = targets.filter((target) => {
    if (target.year !== selectedYear) return false;
    const targetMonthStr = target.period.split('-')[1];
    const targetMonth = parseInt(targetMonthStr, 10);
    const targetQuarter = Math.ceil(targetMonth / 3);

    if (selectedMonth !== 'ALL') {
      return targetMonth === selectedMonth;
    }
    if (selectedQuarter !== 'ALL') {
      return targetQuarter === selectedQuarter;
    }
    return true;
  });

  relevantTargets.forEach((t) => {
    targetVolumeUSD += t.targetVolumeUSD;
    targetProfitVND += t.targetProfitVND;
  });

  // Default fallback target if none configured
  if (targetVolumeUSD === 0) targetVolumeUSD = totalVolumeUSD * 0.95;
  if (targetProfitVND === 0) targetProfitVND = totalProfitVND * 0.95;

  const volumeCompletionRate = targetVolumeUSD > 0 ? (totalVolumeUSD / targetVolumeUSD) * 100 : 0;
  const profitCompletionRate = targetProfitVND > 0 ? (totalProfitVND / targetProfitVND) * 100 : 0;
  const marginBps = totalVolumeVND > 0 ? (totalProfitVND / totalVolumeVND) * 10000 : 0;

  const uniqueCustomers = new Set(filtered.map((t) => t.customerName));

  return {
    totalBuyUSD,
    totalSellUSD,
    totalVolumeUSD,
    totalVolumeVND,
    totalProfitVND,
    targetVolumeUSD,
    targetProfitVND,
    volumeCompletionRate,
    profitCompletionRate,
    marginBps,
    transactionCount: filtered.length,
    customerCount: uniqueCustomers.size,
  };
}

// Generate comparison across all 12 months for a year
export function getMonthlyComparison(
  transactions: FXTransaction[],
  targets: TargetPlan[],
  year: number
): PeriodComparison[] {
  const result: PeriodComparison[] = [];
  const yearTx = transactions.filter((t) => t.year === year);

  for (let m = 1; m <= 12; m++) {
    const monthTx = yearTx.filter((t) => t.month === m);
    const volumeUSD = monthTx.reduce((sum, t) => sum + t.volumeUSD, 0);
    const volumeVND = monthTx.reduce((sum, t) => sum + t.volumeVND, 0);
    const profitVND = monthTx.reduce((sum, t) => sum + t.profitVND, 0);

    const monthKey = `${year}-${String(m).padStart(2, '0')}`;
    const target = targets.find((t) => t.year === year && t.period === monthKey);
    const targetVolumeUSD = target ? target.targetVolumeUSD : volumeUSD * 0.95;
    const targetProfitVND = target ? target.targetProfitVND : profitVND * 0.95;

    const profitCompletionRate = targetProfitVND > 0 ? (profitVND / targetProfitVND) * 100 : 0;
    const marginBps = volumeVND > 0 ? (profitVND / volumeVND) * 10000 : 0;

    let growthVolumePct = 0;
    let growthProfitPct = 0;

    if (m > 1) {
      const prev = result[m - 2];
      if (prev && prev.volumeUSD > 0) {
        growthVolumePct = ((volumeUSD - prev.volumeUSD) / prev.volumeUSD) * 100;
      }
      if (prev && prev.profitVND > 0) {
        growthProfitPct = ((profitVND - prev.profitVND) / prev.profitVND) * 100;
      }
    }

    result.push({
      periodKey: monthKey,
      periodLabel: `Tháng ${m}`,
      volumeUSD,
      volumeVND,
      profitVND,
      targetVolumeUSD,
      targetProfitVND,
      profitCompletionRate,
      growthVolumePct,
      growthProfitPct,
      marginBps,
      transactionCount: monthTx.length,
    });
  }

  return result;
}

// Generate quarterly comparison for a year
export function getQuarterlyComparison(
  transactions: FXTransaction[],
  targets: TargetPlan[],
  year: number
): PeriodComparison[] {
  const result: PeriodComparison[] = [];
  const yearTx = transactions.filter((t) => t.year === year);

  for (let q = 1; q <= 4; q++) {
    const qTx = yearTx.filter((t) => t.quarter === q);
    const volumeUSD = qTx.reduce((sum, t) => sum + t.volumeUSD, 0);
    const volumeVND = qTx.reduce((sum, t) => sum + t.volumeVND, 0);
    const profitVND = qTx.reduce((sum, t) => sum + t.profitVND, 0);

    // Sum monthly targets in this quarter
    let targetVolumeUSD = 0;
    let targetProfitVND = 0;
    for (let m = (q - 1) * 3 + 1; m <= q * 3; m++) {
      const monthKey = `${year}-${String(m).padStart(2, '0')}`;
      const target = targets.find((t) => t.year === year && t.period === monthKey);
      if (target) {
        targetVolumeUSD += target.targetVolumeUSD;
        targetProfitVND += target.targetProfitVND;
      }
    }

    if (targetProfitVND === 0) targetProfitVND = profitVND * 0.95;
    if (targetVolumeUSD === 0) targetVolumeUSD = volumeUSD * 0.95;

    const profitCompletionRate = targetProfitVND > 0 ? (profitVND / targetProfitVND) * 100 : 0;
    const marginBps = volumeVND > 0 ? (profitVND / volumeVND) * 10000 : 0;

    let growthVolumePct = 0;
    let growthProfitPct = 0;
    if (q > 1 && result[q - 2]) {
      const prev = result[q - 2];
      if (prev.volumeUSD > 0) {
        growthVolumePct = ((volumeUSD - prev.volumeUSD) / prev.volumeUSD) * 100;
      }
      if (prev.profitVND > 0) {
        growthProfitPct = ((profitVND - prev.profitVND) / prev.profitVND) * 100;
      }
    }

    result.push({
      periodKey: `Q${q}-${year}`,
      periodLabel: `Quý ${q}/${year}`,
      volumeUSD,
      volumeVND,
      profitVND,
      targetVolumeUSD,
      targetProfitVND,
      profitCompletionRate,
      growthVolumePct,
      growthProfitPct,
      marginBps,
      transactionCount: qTx.length,
    });
  }

  return result;
}

// Generate Year over Year comparison
export function getYearlyComparison(
  transactions: FXTransaction[],
  targets: TargetPlan[]
): PeriodComparison[] {
  const years = Array.from(new Set(transactions.map((t) => t.year))).sort((a, b) => a - b);
  const result: PeriodComparison[] = [];

  years.forEach((yr, idx) => {
    const yrTx = transactions.filter((t) => t.year === yr);
    const volumeUSD = yrTx.reduce((sum, t) => sum + t.volumeUSD, 0);
    const volumeVND = yrTx.reduce((sum, t) => sum + t.volumeVND, 0);
    const profitVND = yrTx.reduce((sum, t) => sum + t.profitVND, 0);

    const yrTargets = targets.filter((t) => t.year === yr);
    const targetVolumeUSD = yrTargets.reduce((sum, t) => sum + t.targetVolumeUSD, 0) || volumeUSD * 0.95;
    const targetProfitVND = yrTargets.reduce((sum, t) => sum + t.targetProfitVND, 0) || profitVND * 0.95;

    const profitCompletionRate = targetProfitVND > 0 ? (profitVND / targetProfitVND) * 100 : 0;
    const marginBps = volumeVND > 0 ? (profitVND / volumeVND) * 10000 : 0;

    let growthVolumePct = 0;
    let growthProfitPct = 0;
    if (idx > 0 && result[idx - 1]) {
      const prev = result[idx - 1];
      if (prev.volumeUSD > 0) {
        growthVolumePct = ((volumeUSD - prev.volumeUSD) / prev.volumeUSD) * 100;
      }
      if (prev.profitVND > 0) {
        growthProfitPct = ((profitVND - prev.profitVND) / prev.profitVND) * 100;
      }
    }

    result.push({
      periodKey: `Y${yr}`,
      periodLabel: `Năm ${yr}`,
      volumeUSD,
      volumeVND,
      profitVND,
      targetVolumeUSD,
      targetProfitVND,
      profitCompletionRate,
      growthVolumePct,
      growthProfitPct,
      marginBps,
      transactionCount: yrTx.length,
    });
  });

  return result;
}

// Currency pair breakdown
export function getCurrencyBreakdown(transactions: FXTransaction[]): CurrencyBreakdownItem[] {
  const map = new Map<string, { volumeUSD: number; volumeVND: number; profitVND: number; count: number }>();
  let totalVolUSD = 0;
  let totalProfVND = 0;

  transactions.forEach((t) => {
    totalVolUSD += t.volumeUSD;
    totalProfVND += t.profitVND;

    const curr = map.get(t.currencyPair) || { volumeUSD: 0, volumeVND: 0, profitVND: 0, count: 0 };
    curr.volumeUSD += t.volumeUSD;
    curr.volumeVND += t.volumeVND;
    curr.profitVND += t.profitVND;
    curr.count += 1;
    map.set(t.currencyPair, curr);
  });

  const list: CurrencyBreakdownItem[] = [];
  map.forEach((data, pair) => {
    list.push({
      currencyPair: pair,
      volumeUSD: data.volumeUSD,
      volumeVND: data.volumeVND,
      profitVND: data.profitVND,
      percentageVolume: totalVolUSD > 0 ? (data.volumeUSD / totalVolUSD) * 100 : 0,
      percentageProfit: totalProfVND > 0 ? (data.profitVND / totalProfVND) * 100 : 0,
      transactionCount: data.count,
    });
  });

  return list.sort((a, b) => b.volumeUSD - a.volumeUSD);
}

// Customer segment breakdown
export function getSegmentBreakdown(transactions: FXTransaction[]): SegmentBreakdownItem[] {
  const segmentLabels: Record<CustomerSegment, string> = {
    FDI: 'Doanh nghiệp FDI',
    XNK: 'Doanh nghiệp Xuất Nhập Khẩu',
    VIP: 'Khách hàng Cá nhân VIP (Private)',
    RETAIL: 'Bán lẻ & Định cư / Du học',
  };

  const map = new Map<CustomerSegment, { volumeUSD: number; profitVND: number; customers: Set<string> }>();
  (['FDI', 'XNK', 'VIP', 'RETAIL'] as CustomerSegment[]).forEach((seg) => {
    map.set(seg, { volumeUSD: 0, profitVND: 0, customers: new Set() });
  });

  let totalVolUSD = 0;
  let totalProfVND = 0;

  transactions.forEach((t) => {
    totalVolUSD += t.volumeUSD;
    totalProfVND += t.profitVND;

    const segData = map.get(t.customerSegment);
    if (segData) {
      segData.volumeUSD += t.volumeUSD;
      segData.profitVND += t.profitVND;
      segData.customers.add(t.customerName);
    }
  });

  const list: SegmentBreakdownItem[] = [];
  map.forEach((data, seg) => {
    list.push({
      segment: seg,
      segmentLabel: segmentLabels[seg],
      volumeUSD: data.volumeUSD,
      profitVND: data.profitVND,
      percentageVolume: totalVolUSD > 0 ? (data.volumeUSD / totalVolUSD) * 100 : 0,
      percentageProfit: totalProfVND > 0 ? (data.profitVND / totalProfVND) * 100 : 0,
      customerCount: data.customers.size,
    });
  });

  return list.sort((a, b) => b.volumeUSD - a.volumeUSD);
}

// Dealer performance
export function getDealerPerformance(transactions: FXTransaction[]): DealerPerformanceItem[] {
  const map = new Map<string, { volumeUSD: number; profitVND: number; count: number }>();

  transactions.forEach((t) => {
    const d = map.get(t.dealerName) || { volumeUSD: 0, profitVND: 0, count: 0 };
    d.volumeUSD += t.volumeUSD;
    d.profitVND += t.profitVND;
    d.count += 1;
    map.set(t.dealerName, d);
  });

  const list: DealerPerformanceItem[] = [];
  map.forEach((data, name) => {
    // Arbitrary target benchmark ~ 35M USD per dealer
    const completion = Math.min(130, Math.round((data.volumeUSD / 30000000) * 100));
    list.push({
      dealerName: name,
      volumeUSD: data.volumeUSD,
      profitVND: data.profitVND,
      transactionCount: data.count,
      targetCompletionRate: completion,
    });
  });

  return list.sort((a, b) => b.profitVND - a.profitVND);
}
