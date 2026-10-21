import React from 'react';
import { FXSummary } from '../types/fx';
import { formatUSD, formatVND, formatPercent, formatNumber } from '../utils/fxCalculations';
import { ArrowUpRight, ArrowDownLeft, Target, Award, Users } from 'lucide-react';

interface KPISummaryProps {
  summary: FXSummary;
  periodLabel: string;
}

export const KPISummary: React.FC<KPISummaryProps> = ({ summary, periodLabel }) => {
  const isOverTarget = summary.profitCompletionRate >= 100;
  const isNearTarget = summary.profitCompletionRate >= 85 && summary.profitCompletionRate < 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng Doanh Số Mua Bán */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Doanh Số FX
            </span>
            <span className="text-xs text-slate-400 font-medium">{periodLabel}</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {formatUSD(summary.totalVolumeUSD, true)}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
            Quy đổi: {formatVND(summary.totalVolumeVND, true)} VND
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">Mua: </span>
              <span className="font-semibold font-mono tabular-nums">{formatUSD(summary.totalBuyUSD, true)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="text-slate-500">Bán: </span>
              <span className="font-semibold font-mono tabular-nums">{formatUSD(summary.totalSellUSD, true)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI 2: Lợi Nhuận Thuần Kinh Doanh Ngoại Tệ */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lợi Nhuận Thuần FX
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono tabular-nums">
              {summary.marginBps.toFixed(1)} bps
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums text-emerald-700">
              {formatVND(summary.totalProfitVND, true)}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
            Tương đương ~ {formatUSD((summary.totalProfitVND / 25400), true)}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span>Biên lợi nhuận ròng:</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {formatPercent((summary.totalProfitVND / (summary.totalVolumeVND || 1)) * 100, 2)}
          </span>
        </div>
      </div>

      {/* KPI 3: Tỷ Lệ Hoàn Thành Kế Hoạch */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tiến Độ Kế Hoạch KPI
            </span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${
              isOverTarget ? 'text-emerald-700' : isNearTarget ? 'text-blue-900' : 'text-amber-700'
            }`}>
              {formatPercent(summary.profitCompletionRate, 1)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isOverTarget ? 'Vượt chỉ tiêu' : isNearTarget ? 'Đạt tiến độ' : 'Cần bứt phá'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverTarget ? 'bg-emerald-600' : isNearTarget ? 'bg-blue-800' : 'bg-amber-600'
              }`}
              style={{ width: `${Math.min(100, summary.profitCompletionRate)}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span>Chỉ tiêu giao:</span>
          <span className="font-semibold font-mono tabular-nums text-slate-800">
            {formatVND(summary.targetProfitVND, true)}
          </span>
        </div>
      </div>

      {/* KPI 4: Quy Mô Giao Dịch & Khách Hàng */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Giao Dịch & Mạng Lưới
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {formatNumber(summary.transactionCount)}
            </span>
            <span className="text-xs font-medium text-slate-500">giao dịch</span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
            {formatNumber(summary.customerCount)} khách hàng doanh nghiệp & VIP
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span>Bình quân/giao dịch:</span>
          <span className="font-semibold font-mono tabular-nums text-slate-800">
            {formatUSD(summary.transactionCount > 0 ? summary.totalVolumeUSD / summary.transactionCount : 0, true)}
          </span>
        </div>
      </div>
    </div>
  );
};
