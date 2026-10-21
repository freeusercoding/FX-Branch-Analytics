import React from 'react';
import { RefreshCw, Calendar, TrendingUp } from 'lucide-react';

interface HeroHeaderProps {
  branchName: string;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  selectedQuarter: number | 'ALL';
  onSelectQuarter: (q: number | 'ALL') => void;
  selectedMonth: number | 'ALL';
  onSelectMonth: (m: number | 'ALL') => void;
  onResetSampleData: () => void;
  totalTransactions: number;
  lastUpdated: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  branchName,
  selectedYear,
  onSelectYear,
  selectedQuarter,
  onSelectQuarter,
  selectedMonth,
  onSelectMonth,
  onResetSampleData,
  totalTransactions,
  lastUpdated,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Info */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Zero-Pill metadata with typographic separator */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                <span>Khối Nguồn vốn & Thị trường Tài chính</span>
                <span aria-hidden="true">·</span>
                <span>Hệ thống Quản trị & Phân tích FX</span>
                <span aria-hidden="true">·</span>
                <span>Cập nhật {lastUpdated}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                Báo Cáo Hoạt Động Kinh Doanh Ngoại Tệ Chi Nhánh
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Đơn vị: <span className="font-semibold text-slate-800">{branchName}</span>. Theo dõi doanh số mua bán, đánh giá lợi nhuận gộp thuần, giám sát tỷ lệ hoàn thành kế hoạch KPI và tư vấn chiến lược bằng AI.
              </p>
            </div>

            {/* Time filters & Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {/* Year filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => {
                    onSelectYear(2025);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    selectedYear === 2025
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Năm 2025
                </button>
                <button
                  onClick={() => {
                    onSelectYear(2026);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    selectedYear === 2026
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Năm 2026
                </button>
              </div>

              {/* Quarter filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => {
                    onSelectQuarter('ALL');
                    onSelectMonth('ALL');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedQuarter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cả năm
                </button>
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onSelectQuarter(q);
                      onSelectMonth('ALL');
                    }}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedQuarter === q
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quý {q}
                  </button>
                ))}
              </div>

              {/* Month selector dropdown if quarter is chosen or all */}
              <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-500">Tháng:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    onSelectMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                  }
                  className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="ALL">Tất cả tháng</option>
                  {(selectedQuarter === 'ALL'
                    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                    : [(selectedQuarter - 1) * 3 + 1, (selectedQuarter - 1) * 3 + 2, (selectedQuarter - 1) * 3 + 3]
                  ).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset to sample data button */}
              <button
                onClick={onResetSampleData}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                title="Khôi phục lại dữ liệu mẫu 180 giao dịch chuẩn"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Nạp lại Dữ liệu Mẫu</span>
              </button>
            </div>
          </div>

          {/* Visual Desk Card / Quick stats */}
          <div className="lg:col-span-4 relative rounded-xl overflow-hidden border border-slate-200 shadow-xs min-h-[160px] flex flex-col justify-end p-4">
            <img
              src="/src/assets/images/bank_treasury_banner_1792551546670.jpg"
              alt="Phòng Giao dịch Ngoại hối Chi nhánh"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Scrim overlay for high contrast text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

            <div className="relative z-10 text-white">
              <div className="flex items-center gap-1.5 text-xs text-blue-200 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Bàn Giao Dịch Treasury & FX Dealing Desk</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {branchName}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 font-mono tabular-nums">
                <span>Tổng {totalTransactions} giao dịch</span>
                <span>·</span>
                <span>7 cặp ngoại tệ</span>
                <span>·</span>
                <span>4 phân khúc KH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
