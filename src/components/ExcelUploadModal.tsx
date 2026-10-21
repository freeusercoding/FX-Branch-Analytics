import React, { useState, useRef } from 'react';
import { FXTransaction } from '../types/fx';
import { parseExcelFile, downloadSampleTemplate } from '../utils/excelHelper';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { formatUSD, formatVND } from '../utils/fxCalculations';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (transactions: FXTransaction[], mode: 'REPLACE' | 'APPEND') => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<FXTransaction[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadMode, setUploadMode] = useState<'REPLACE' | 'APPEND'>('REPLACE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);
    setErrors([]);
    setParsedTransactions([]);

    const result = await parseExcelFile(selectedFile);
    setParsing(false);

    if (result.success && result.transactions) {
      setParsedTransactions(result.transactions);
      if (result.errors) {
        setErrors(result.errors);
      }
    } else {
      setErrors(result.errors || ['Không thể đọc được dữ liệu từ file này.']);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedTransactions.length === 0) return;
    onApplyData(parsedTransactions, uploadMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tải Lên File Excel Số Liệu FX
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ định dạng .xlsx, .xls hoặc .csv chuẩn nghiệp vụ ngân hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Download sample template banner */}
          <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-900 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Mẫu Excel Chuẩn Ngân Hàng</div>
                <div className="text-[11px] text-slate-600">
                  Tải file mẫu có sẵn các cột Ngày, Cặp tiền, Tỷ giá, Doanh số để đối chiếu.
                </div>
              </div>
            </div>
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Mẫu Excel</span>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-900 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
            />
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="font-semibold text-slate-800 text-sm">
              Kéo thả file Excel vào đây hoặc <span className="text-blue-900 underline">chọn từ máy tính</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {file ? `Đã chọn: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` : 'Hỗ trợ các file .xlsx, .xls, .csv'}
            </div>
          </div>

          {/* Processing / Loading status */}
          {parsing && (
            <div className="py-4 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-900 border-t-transparent mb-1" />
              <div>Đang đọc và phân tích cấu trúc dữ liệu...</div>
            </div>
          )}

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cảnh báo dữ liệu:</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] text-amber-700 space-y-0.5">
                {errors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 3 && <li>...và {errors.length - 3} cảnh báo khác.</li>}
              </ul>
            </div>
          )}

          {/* Success Preview */}
          {parsedTransactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Đã nhận diện thành công {parsedTransactions.length} giao dịch hợp lệ
                  </span>
                </div>
              </div>

              {/* Mini Preview Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-40">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Ngày</th>
                      <th className="p-2">Cặp Tiền</th>
                      <th className="p-2">Chiều</th>
                      <th className="p-2">Khách Hàng</th>
                      <th className="p-2 text-right">Doanh Số (USD)</th>
                      <th className="p-2 text-right">Lợi Nhuận (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {parsedTransactions.slice(0, 4).map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2">{t.date}</td>
                        <td className="p-2 font-semibold text-slate-900">{t.currencyPair}</td>
                        <td className="p-2 font-sans">{t.type === 'BUY' ? 'Mua' : 'Bán'}</td>
                        <td className="p-2 font-sans truncate max-w-[150px]">{t.customerName}</td>
                        <td className="p-2 text-right">{formatUSD(t.volumeUSD, true)}</td>
                        <td className="p-2 text-right font-semibold text-emerald-700">
                          {formatVND(t.profitVND, true)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mode choice */}
              <div className="pt-2 flex items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700">Phương thức nạp:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="REPLACE"
                    checked={uploadMode === 'REPLACE'}
                    onChange={() => setUploadMode('REPLACE')}
                    className="text-blue-900 focus:ring-blue-900"
                  />
                  <span>Thay thế toàn bộ dữ liệu</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="APPEND"
                    checked={uploadMode === 'APPEND'}
                    onChange={() => setUploadMode('APPEND')}
                    className="text-blue-900 focus:ring-blue-900"
                  />
                  <span>Nối thêm vào dữ liệu sẵn có</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleApply}
            disabled={parsedTransactions.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
          >
            Áp Dụng Dữ Liệu ({parsedTransactions.length} Giao Dịch)
          </button>
        </div>
      </div>
    </div>
  );
};
