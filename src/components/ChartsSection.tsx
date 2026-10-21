import React, { useState } from 'react';
import { CurrencyBreakdownItem, SegmentBreakdownItem, DealerPerformanceItem } from '../types/fx';
import { formatUSD, formatVND, formatPercent } from '../utils/fxCalculations';
import { PieChart, Layers, Award } from 'lucide-react';

interface ChartsSectionProps {
  currencyBreakdown: CurrencyBreakdownItem[];
  segmentBreakdown: SegmentBreakdownItem[];
  dealerPerformance: DealerPerformanceItem[];
}

const CURRENCY_COLORS = [
  '#1e3a8a', // blue-900 (USD)
  '#0284c7', // sky-600 (EUR)
  '#059669', // emerald-600 (JPY)
  '#d97706', // amber-600 (GBP)
  '#e11d48', // rose-600 (CNY)
  '#7c3aed', // violet-600 (AUD)
  '#0d9488', // teal-600 (Others)
];

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  currencyBreakdown,
  segmentBreakdown,
  dealerPerformance,
}) => {
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);

  // Calculate SVG Donut slices
  let cumulativePercent = 0;
  const donutSlices = currencyBreakdown.map((item, index) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += item.percentageVolume;
    const endAngle = (cumulativePercent / 100) * 360;

    // Convert polar to cartesian
    const radius = 70;
    const innerRadius = 45;
    const cx = 100;
    const cy = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = item.percentageVolume > 50 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...item,
      pathData,
      color: CURRENCY_COLORS[index % CURRENCY_COLORS.length],
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Box 1: Cơ Cấu Cặp Ngoại Tệ (Donut Chart & List) */}
      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-900" />
                <span>Cơ Cấu Cặp Ngoại Tệ Giao Dịch</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tỷ trọng doanh số & lợi nhuận đóng góp</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {currencyBreakdown.length} cặp tiền
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* SVG Donut */}
            <div className="sm:col-span-5 flex justify-center relative">
              <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-xs">
                {donutSlices.map((slice) => {
                  const isHovered = hoveredCurrency === slice.currencyPair;
                  return (
                    <path
                      key={slice.currencyPair}
                      d={slice.pathData}
                      fill={slice.color}
                      className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                      transform={isHovered ? 'scale(1.04) translate(-4, -4)' : undefined}
                      onMouseEnter={() => setHoveredCurrency(slice.currencyPair)}
                      onMouseLeave={() => setHoveredCurrency(null)}
                    />
                  );
                })}
              </svg>
              {/* Donut Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                  Chủ lực
                </span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">
                  {hoveredCurrency || currencyBreakdown[0]?.currencyPair || 'USD/VND'}
                </span>
              </div>
            </div>

            {/* Currency Legend Table */}
            <div className="sm:col-span-7 space-y-2">
              {donutSlices.map((item) => {
                const isHovered = hoveredCurrency === item.currencyPair;
                return (
                  <div
                    key={item.currencyPair}
                    onMouseEnter={() => setHoveredCurrency(item.currencyPair)}
                    onMouseLeave={() => setHoveredCurrency(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isHovered ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-slate-900">{item.currencyPair}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums text-right">
                      <span className="text-slate-600">{formatUSD(item.volumeUSD, true)}</span>
                      <span className="font-bold text-slate-900 w-12 text-right">
                        {formatPercent(item.percentageVolume, 1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
          <span>*USD/VND chiếm đa số do cơ cấu thanh toán quốc tế</span>
          <span className="font-mono tabular-nums text-slate-700">Tổng 100% doanh số</span>
        </div>
      </div>

      {/* Box 2: Phân Khúc Khách Hàng (Customer Segments) */}
      <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-900" />
                <span>Phân Bổ Theo Phân Khúc Khách Hàng</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tỷ trọng doanh thu & số lượng khách hàng</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">4 Nhóm chính</span>
          </div>

          <div className="mt-5 space-y-4">
            {segmentBreakdown.map((seg) => (
              <div key={seg.segment} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{seg.segmentLabel}</span>
                    <span className="text-slate-400">· {seg.customerCount} KH</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-slate-600">{formatUSD(seg.volumeUSD, true)}</span>
                    <span className="font-bold text-slate-900">{formatPercent(seg.percentageVolume, 1)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="h-full bg-blue-900 rounded-full"
                    style={{ width: `${seg.percentageVolume}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>Lợi nhuận đóng góp: {formatVND(seg.profitVND, true)}</span>
                  <span>Tỷ trọng LN: {formatPercent(seg.percentageProfit, 1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
          <span>Phân khúc Doanh nghiệp XNK & FDI là động lực doanh số nòng cốt</span>
        </div>
      </div>

      {/* Box 3: Bảng Xếp Hạng Dealer / RM Chi Nhánh */}
      <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Hiệu Quả Kinh Doanh Theo Cán Bộ Dealer / RM</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá doanh số thực hiện, lợi nhuận gộp tạo ra và tỷ lệ bám sát chỉ tiêu cá nhân
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Đội ngũ Treasury</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Cán Bộ Dealer</th>
                <th className="py-2.5 px-3 text-right">Doanh Số (USD)</th>
                <th className="py-2.5 px-3 text-right">Lợi Nhuận Thuần (VND)</th>
                <th className="py-2.5 px-3 text-center">Tiến Độ Chỉ Tiêu</th>
                <th className="py-2.5 px-3 text-right">Số Món GD</th>
                <th className="py-2.5 px-3 text-right">Bình Quân / Món</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {dealerPerformance.map((d) => (
                <tr key={d.dealerName} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {d.dealerName.charAt(0)}
                    </div>
                    <span>{d.dealerName}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    {formatUSD(d.volumeUSD, true)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                    {formatVND(d.profitVND, true)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        d.targetCompletionRate >= 100
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {d.targetCompletionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {d.transactionCount} món
                  </td>
                  <td className="py-3 px-3 text-right text-slate-600">
                    {formatUSD(d.transactionCount > 0 ? d.volumeUSD / d.transactionCount : 0, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
