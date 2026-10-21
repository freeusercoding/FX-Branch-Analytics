import React, { useState } from 'react';
import { FXSummary, PeriodComparison, CurrencyBreakdownItem, SegmentBreakdownItem, FXTransaction, UserProfile } from '../types/fx';
import { exportSummaryReportExcel } from '../utils/excelHelper';
import { formatUSD, formatVND, formatPercent } from '../utils/fxCalculations';
import { Download, Printer, FileSpreadsheet, FileText, X } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName: string;
  periodLabel: string;
  summary: FXSummary;
  periodComparison: PeriodComparison[];
  currencyBreakdown: CurrencyBreakdownItem[];
  segmentBreakdown: SegmentBreakdownItem[];
  transactions: FXTransaction[];
  aiCommentary?: string;
  currentUser: UserProfile;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  branchName,
  periodLabel,
  summary,
  periodComparison,
  currencyBreakdown,
  segmentBreakdown,
  transactions,
  aiCommentary,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'EXCEL' | 'PDF'>('EXCEL');

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportSummaryReportExcel({
      branchName,
      period: periodLabel,
      summary,
      periodComparison,
      currencyBreakdown,
      segmentBreakdown,
      transactions,
      aiCommentary,
    });
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Hidden on print) */}
        <div className="no-print px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Xuất Báo Cáo Kinh Doanh Ngoại Tệ
              </h3>
              <p className="text-xs text-slate-500">
                Tùy chọn xuất file Excel đa sheet hoặc xem bản in chuẩn hóa mẫu ngân hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('EXCEL')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  activeTab === 'EXCEL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                File Excel (.xlsx)
              </button>
              <button
                onClick={() => setActiveTab('PDF')}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  activeTab === 'PDF' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Bản In / PDF
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {activeTab === 'EXCEL' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Báo Cáo Toàn Diện Định Dạng Excel Workbook (.xlsx)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Tệp Excel tải về bao gồm đầy đủ 6 sheet dữ liệu chi tiết theo chuẩn báo cáo nội bộ:
                    </p>
                    <ul className="mt-2 space-y-1 text-[11px] text-slate-600 list-disc pl-5 font-mono">
                      <li>Sheet 1: Tổng quan chỉ tiêu KPI & Lợi nhuận kỳ {periodLabel}</li>
                      <li>Sheet 2: Ma trận so sánh diễn biến qua các kỳ (Tháng / Quý / Năm)</li>
                      <li>Sheet 3: Cơ cấu doanh số & đóng góp lợi nhuận từng cặp ngoại tệ</li>
                      <li>Sheet 4: Phân khúc khách hàng (FDI, XNK, VIP, Bán lẻ)</li>
                      <li>Sheet 5: Sổ nhật ký chi tiết {transactions.length} món giao dịch</li>
                      <li>Sheet 6: Bài phân tích & đề xuất chiến lược tăng trưởng từ AI</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Tên file dự kiến:</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Bao_Cao_Kinh_Doanh_Ngoai_Te_{periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx
                  </div>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Xuống Ngay</span>
                </button>
              </div>
            </div>
          ) : (
            /* Printable PDF Preview */
            <div className="bg-white border border-slate-300 rounded-xl p-8 shadow-sm space-y-6 font-sans printable-report">
              {/* Formal Bank Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    NGÂN HÀNG THƯƠNG MẠI CỔ PHẦN
                  </div>
                  <div className="text-xs font-semibold text-slate-600">{branchName}</div>
                  <div className="text-[10px] text-slate-500">Phòng Kinh Doanh Ngoại Tệ & Nguồn Vốn</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-slate-800">BÁO CÁO NỘI BỘ</div>
                  <div className="text-[11px] text-slate-500 font-mono">Ngày lập: {currentDateStr}</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-lg font-extrabold uppercase text-slate-900 tracking-tight">
                  BÁO CÁO TỔNG HỢP HOẠT ĐỘNG KINH DOANH NGOẠI TỆ
                </h2>
                <p className="text-xs text-slate-600 mt-1">Kỳ báo cáo: {periodLabel}</p>
              </div>

              {/* Summary KPIs Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  I. KẾT QUẢ THỰC HIỆN CÁC CHỈ TIÊU CHÍNH
                </h4>
                <table className="w-full text-xs border border-slate-300 text-left">
                  <thead className="bg-slate-100 font-semibold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Chỉ Tiêu Kinh Doanh</th>
                      <th className="p-2 border-r border-slate-300 text-right">Kế Hoạch Giao</th>
                      <th className="p-2 border-r border-slate-300 text-right">Thực Hiện</th>
                      <th className="p-2 text-center">Tỷ Lệ Đạt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono tabular-nums">
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-sans">Tổng Doanh Số Mua Bán (USD)</td>
                      <td className="p-2 border-r border-slate-300 text-right">{formatUSD(summary.targetVolumeUSD, true)}</td>
                      <td className="p-2 border-r border-slate-300 text-right font-bold">{formatUSD(summary.totalVolumeUSD, true)}</td>
                      <td className="p-2 text-center font-bold text-blue-900">{formatPercent(summary.volumeCompletionRate, 1)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-sans">Doanh Số Quy Đổi VND</td>
                      <td className="p-2 border-r border-slate-300 text-right">-</td>
                      <td className="p-2 border-r border-slate-300 text-right">{formatVND(summary.totalVolumeVND, true)}</td>
                      <td className="p-2 text-center">-</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-sans">Lợi Nhuận Thuần FX (VND)</td>
                      <td className="p-2 border-r border-slate-300 text-right text-slate-600">{formatVND(summary.targetProfitVND, true)}</td>
                      <td className="p-2 border-r border-slate-300 text-right font-bold text-emerald-800">{formatVND(summary.totalProfitVND, true)}</td>
                      <td className="p-2 text-center font-bold text-emerald-800">{formatPercent(summary.profitCompletionRate, 1)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-sans">Biên Lợi Nhuận Bình Quân (Spread)</td>
                      <td className="p-2 border-r border-slate-300 text-right">-</td>
                      <td className="p-2 border-r border-slate-300 text-right font-bold">{summary.marginBps.toFixed(1)} bps</td>
                      <td className="p-2 text-center">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AI Strategic Assessment */}
              {aiCommentary && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    II. ĐÁNH GIÁ XU HƯỚNG & KHUYẾN NGHỊ TĂNG TRƯỞNG LỢI NHUẬN (AI ADVISOR)
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs leading-relaxed whitespace-pre-wrap">
                    {aiCommentary}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 text-center text-xs">
                <div>
                  <div className="font-bold text-slate-800 uppercase">NGƯỜI LẬP BIỂU</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký, họ tên)</div>
                  <div className="h-16" />
                  <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.title}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase">TRƯỞNG PHÒNG TREASURY</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký, họ tên)</div>
                  <div className="h-16" />
                  <div className="font-semibold text-slate-900">Nguyễn Mai Chi</div>
                  <div className="text-[10px] text-slate-500">Trưởng phòng FX</div>
                </div>

                <div>
                  <div className="font-bold text-slate-800 uppercase">GIÁM ĐỐC CHI NHÁNH</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">(Ký, đóng dấu)</div>
                  <div className="h-16" />
                  <div className="font-semibold text-slate-900">Trần Đình Toàn</div>
                  <div className="text-[10px] text-slate-500">Giám đốc Chi nhánh</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Đóng
          </button>

          {activeTab === 'PDF' && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Báo Cáo / Lưu PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
