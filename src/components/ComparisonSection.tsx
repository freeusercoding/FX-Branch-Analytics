import React, { useState } from 'react';
import { PeriodComparison } from '../types/fx';
import { formatUSD, formatVND, formatPercent, formatNumber } from '../utils/fxCalculations';
import { TrendingUp, TrendingDown, Minus, BarChart3, Table as TableIcon } from 'lucide-react';

interface ComparisonSectionProps {
  monthlyData: PeriodComparison[];
  quarterlyData: PeriodComparison[];
  yearlyData: PeriodComparison[];
  selectedYear: number;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  monthlyData,
  quarterlyData,
  yearlyData,
  selectedYear,
}) => {
  const [viewMode, setViewMode] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeData: PeriodComparison[] =
    viewMode === 'MONTH' ? monthlyData : viewMode === 'QUARTER' ? quarterlyData : yearlyData;

  // Max values for SVG scaling
  const maxVolume = Math.max(...activeData.map((d) => d.volumeUSD), 1);
  const maxProfit = Math.max(...activeData.map((d) => d.profitVND), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-900" />
            <span>So Sánh Kết Quả Kinh Doanh Ngoại Tệ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích đa chiều theo tháng, quý và năm để đánh giá xu hướng tăng trưởng và mức độ bám sát chỉ tiêu.
          </p>
        </div>

        {/* View mode segmented control (Functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'MONTH'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Tháng ({selectedYear})
          </button>
          <button
            onClick={() => setViewMode('QUARTER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'QUARTER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo Quý (Q1 - Q4)
          </button>
          <button
            onClick={() => setViewMode('YEAR')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'YEAR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            So Sánh Hàng Năm (YoY)
          </button>
        </div>
      </div>

      {/* Visual SVG Chart: Dual Axis (Doanh số Cột & Lợi nhuận Đường) */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 font-medium">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-900 inline-block" />
              <span>Doanh số quy đổi USD (Trục trái)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-600 inline-block rounded-full" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 -ml-2 inline-block border-2 border-white" />
              <span>Lợi nhuận thuần VND (Trục phải)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
              <span>Kế hoạch Target Lợi nhuận</span>
            </div>
          </div>
          <span className="font-mono tabular-nums">Số lượng kỳ: {activeData.length}</span>
        </div>

        {/* Responsive Interactive SVG Canvas */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-50/70 rounded-xl border border-slate-100 p-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="800" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="140" x2="800" y2="140" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="200" x2="800" y2="200" stroke="#cbd5e1" />

            {/* Target line (dashed gray) */}
            {activeData.length > 1 && (
              <polyline
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                points={activeData
                  .map((d, i) => {
                    const step = 800 / activeData.length;
                    const x = i * step + step / 2;
                    const y = 200 - (d.targetProfitVND / (maxProfit * 1.15)) * 180;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Bars for Volume USD */}
            {activeData.map((d, i) => {
              const step = 800 / activeData.length;
              const barWidth = Math.max(16, Math.min(48, step * 0.45));
              const x = i * step + (step - barWidth) / 2;
              const height = (d.volumeUSD / (maxVolume * 1.15)) * 180;
              const y = 200 - height;
              const isHovered = hoveredIndex === i;

              return (
                <g key={`bar-${d.periodKey}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(2, height)}
                    rx="4"
                    className={`transition-colors duration-150 cursor-pointer ${
                      isHovered ? 'fill-blue-700' : 'fill-blue-900'
                    }`}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* Period Label at bottom */}
                  <text
                    x={i * step + step / 2}
                    y="222"
                    textAnchor="middle"
                    className="text-[11px] fill-slate-600 font-medium"
                  >
                    {d.periodLabel}
                  </text>
                </g>
              );
            })}

            {/* Profit Line (Emerald) */}
            {activeData.length > 1 && (
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={activeData
                  .map((d, i) => {
                    const step = 800 / activeData.length;
                    const x = i * step + step / 2;
                    const y = 200 - (d.profitVND / (maxProfit * 1.15)) * 180;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Profit Points */}
            {activeData.map((d, i) => {
              const step = 800 / activeData.length;
              const x = i * step + step / 2;
              const y = 200 - (d.profitVND / (maxProfit * 1.15)) * 180;
              const isHovered = hoveredIndex === i;

              return (
                <circle
                  key={`pt-${d.periodKey}`}
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  className="fill-emerald-600 stroke-white stroke-2 cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip when hovered */}
          {hoveredIndex !== null && activeData[hoveredIndex] && (
            <div
              className="absolute z-20 top-2 pointer-events-none bg-slate-900 text-white rounded-lg p-3 text-xs shadow-xl border border-slate-700 font-mono"
              style={{
                left: `${Math.min(75, Math.max(10, ((hoveredIndex + 0.5) / activeData.length) * 100))}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold text-sm text-slate-100 border-b border-slate-700 pb-1 mb-1 font-sans">
                {activeData[hoveredIndex].periodLabel}
              </div>
              <div className="flex justify-between gap-4 py-0.5">
                <span className="text-slate-400">Doanh số USD:</span>
                <span className="font-semibold text-blue-300">
                  {formatUSD(activeData[hoveredIndex].volumeUSD)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-0.5">
                <span className="text-slate-400">Lợi nhuận VND:</span>
                <span className="font-semibold text-emerald-400">
                  {formatVND(activeData[hoveredIndex].profitVND)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-0.5">
                <span className="text-slate-400">Target Kế hoạch:</span>
                <span className="text-slate-300">
                  {formatVND(activeData[hoveredIndex].targetProfitVND)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-0.5">
                <span className="text-slate-400">Hoàn thành KPI:</span>
                <span className="font-semibold text-amber-300">
                  {formatPercent(activeData[hoveredIndex].profitCompletionRate)}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-0.5 border-t border-slate-700/60 mt-1 pt-1">
                <span className="text-slate-400">Biên độ Spread:</span>
                <span className="text-slate-200">
                  {activeData[hoveredIndex].marginBps.toFixed(1)} bps
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* High-Density Comparative Financial Table */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <TableIcon className="w-4 h-4 text-slate-500" />
            <span>Bảng Số Liệu Chi Tiết So Sánh Các Kỳ</span>
          </h3>
          <span className="text-xs text-slate-500">Đơn vị: Triệu USD & Tỷ VND</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Kỳ Báo Cáo</th>
                <th className="py-2.5 px-3 text-right">Doanh Số (USD)</th>
                <th className="py-2.5 px-3 text-right">Doanh Số (VND)</th>
                <th className="py-2.5 px-3 text-right">Lợi Nhuận Thuần</th>
                <th className="py-2.5 px-3 text-right">Kế Hoạch LN</th>
                <th className="py-2.5 px-3 text-center">Tiến Độ KPI</th>
                <th className="py-2.5 px-3 text-right">Tăng Trưởng DS</th>
                <th className="py-2.5 px-3 text-right">Tăng Trưởng LN</th>
                <th className="py-2.5 px-3 text-right">Biên LN (bps)</th>
                <th className="py-2.5 px-3 text-right">Số Món</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {activeData.map((row, idx) => {
                const isOver = row.profitCompletionRate >= 100;
                const isHighlighted = hoveredIndex === idx;

                return (
                  <tr
                    key={row.periodKey}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`transition-colors ${
                      isHighlighted ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      {row.periodLabel}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                      {formatUSD(row.volumeUSD, true)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatVND(row.volumeVND, true)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                      {formatVND(row.profitVND, true)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {formatVND(row.targetProfitVND, true)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          isOver
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.profitCompletionRate >= 85
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {formatPercent(row.profitCompletionRate, 1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.growthVolumePct !== undefined && idx > 0 ? (
                        <span
                          className={`inline-flex items-center gap-0.5 font-medium ${
                            row.growthVolumePct > 0
                              ? 'text-emerald-700'
                              : row.growthVolumePct < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.growthVolumePct > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : row.growthVolumePct < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {formatPercent(Math.abs(row.growthVolumePct), 1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.growthProfitPct !== undefined && idx > 0 ? (
                        <span
                          className={`inline-flex items-center gap-0.5 font-medium ${
                            row.growthProfitPct > 0
                              ? 'text-emerald-700'
                              : row.growthProfitPct < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.growthProfitPct > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : row.growthProfitPct < 0 ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          {formatPercent(Math.abs(row.growthProfitPct), 1)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                      {row.marginBps.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatNumber(row.transactionCount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
