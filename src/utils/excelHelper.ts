import * as XLSX from 'xlsx';
import { FXTransaction, FXSummary, PeriodComparison, CurrencyBreakdownItem, SegmentBreakdownItem } from '../types/fx';

// Download template Excel file for users to populate
export function downloadSampleTemplate() {
  const templateRows = [
    {
      'Mã Giao Dịch': 'FX-2026-0001',
      'Ngày Giao Dịch': '2026-03-15',
      'Cặp Ngoại Tệ': 'USD/VND',
      'Loại Giao Dịch': 'Bán',
      'Sản Phẩm': 'Giao ngay',
      'Tên Khách Hàng': 'Công ty CP May Sài Gòn',
      'Phân Khúc': 'Doanh nghiệp XNK',
      'Doanh Số Nguyên Tệ': 500000,
      'Doanh Số Quy Đổi USD': 500000,
      'Tỷ Giá Thực Hiện': 25550,
      'Tỷ Giá Vốn': 25480,
      'Lợi Nhuận VND': 35000000,
      'Cán Bộ Dealer': 'Lê Quang Huy',
    },
    {
      'Mã Giao Dịch': 'FX-2026-0002',
      'Ngày Giao Dịch': '2026-03-16',
      'Cặp Ngoại Tệ': 'EUR/VND',
      'Loại Giao Dịch': 'Mua',
      'Sản Phẩm': 'Kỳ hạn',
      'Tên Khách Hàng': 'Công ty TNHH Nestlé Việt Nam',
      'Phân Khúc': 'Doanh nghiệp FDI',
      'Doanh Số Nguyên Tệ': 350000,
      'Doanh Số Quy Đổi USD': 378000,
      'Tỷ Giá Thực Hiện': 27150,
      'Tỷ Giá Vốn': 27240,
      'Lợi Nhuận VND': 31500000,
      'Cán Bộ Dealer': 'Phạm Minh Trang',
    },
    {
      'Mã Giao Dịch': 'FX-2026-0003',
      'Ngày Giao Dịch': '2026-03-18',
      'Cặp Ngoại Tệ': 'JPY/VND',
      'Loại Giao Dịch': 'Bán',
      'Sản Phẩm': 'Giao ngay',
      'Tên Khách Hàng': 'Công ty TNHH Canon Component',
      'Phân Khúc': 'Doanh nghiệp FDI',
      'Doanh Số Nguyên Tệ': 45000000,
      'Doanh Số Quy Đổi USD': 292000,
      'Tỷ Giá Thực Hiện': 165.2,
      'Tỷ Giá Vốn': 164.5,
      'Lợi Nhuận VND': 31500000,
      'Cán Bộ Dealer': 'Hoàng Tuấn Dũng',
    },
    {
      'Mã Giao Dịch': 'FX-2026-0004',
      'Ngày Giao Dịch': '2026-03-20',
      'Cặp Ngoại Tệ': 'USD/VND',
      'Loại Giao Dịch': 'Mua',
      'Sản Phẩm': 'Giao ngay',
      'Tên Khách Hàng': 'Bà Trương Mỹ Hoa (KH VIP Diamond)',
      'Phân Khúc': 'Khách hàng VIP',
      'Doanh Số Nguyên Tệ': 200000,
      'Doanh Số Quy Đổi USD': 200000,
      'Tỷ Giá Thực Hiện': 25420,
      'Tỷ Giá Vốn': 25510,
      'Lợi Nhuận VND': 18000000,
      'Cán Bộ Dealer': 'Lê Quang Huy',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'So_Lieu_FX');

  // Auto column width
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 32 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
  ];

  XLSX.writeFile(workbook, 'Mau_So_Lieu_Kinh_Doanh_Ngoai_Te_Chi_Nhanh.xlsx');
}

// Parse uploaded Excel file and convert to FXTransaction[]
export async function parseExcelFile(file: File): Promise<{
  success: boolean;
  transactions?: FXTransaction[];
  errors?: string[];
  totalRows?: number;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return { success: false, errors: ['File Excel không chứa bất kỳ sheet dữ liệu nào.'] };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (rawData.length === 0) {
      return { success: false, errors: ['Sheet dữ liệu rỗng. Vui lòng kiểm tra lại file.'] };
    }

    const transactions: FXTransaction[] = [];
    const errors: string[] = [];

    rawData.forEach((row, index) => {
      const rowIdx = index + 2;

      // Normalize keys
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
            return row[k];
          }
          // lower & trimmed check
          const found = Object.keys(row).find(
            (rk) => rk.toLowerCase().trim() === k.toLowerCase().trim()
          );
          if (found && row[found] !== undefined && row[found] !== null) {
            return row[found];
          }
        }
        return undefined;
      };

      const dateRaw = getVal('Ngày Giao Dịch', 'Ngay', 'Date', 'Ngày');
      const pairRaw = getVal('Cặp Ngoại Tệ', 'Cặp tiền', 'CurrencyPair', 'Ngoại tệ', 'Cap');
      const typeRaw = getVal('Loại Giao Dịch', 'Loại', 'Type', 'Mua/Bán', 'Chieu');
      const custRaw = getVal('Tên Khách Hàng', 'Khách hàng', 'Customer', 'CustomerName');
      const segRaw = getVal('Phân Khúc', 'Phân khúc KH', 'Segment', 'Nhom');
      const volRaw = getVal('Doanh Số Nguyên Tệ', 'Doanh số', 'Volume', 'SoLuong', 'KhoiLuong');
      const volUSDRaw = getVal('Doanh Số Quy Đổi USD', 'Doanh số USD', 'VolumeUSD', 'USD');
      const execRateRaw = getVal('Tỷ Giá Thực Hiện', 'Tỷ giá', 'ExecutionRate', 'GiaBan', 'GiaMua');
      const costRateRaw = getVal('Tỷ Giá Vốn', 'Tỷ giá vốn', 'CostRate', 'GiaVon');
      const profitRaw = getVal('Lợi Nhuận VND', 'Lợi nhuận', 'Profit', 'ProfitVND', 'Lai');
      const dealerRaw = getVal('Cán Bộ Dealer', 'Dealer', 'Cán bộ', 'NhanVien') || 'Dealer Chi nhánh';
      const idRaw = getVal('Mã Giao Dịch', 'Mã GD', 'ID', 'MaGD') || `FX-UP-${rowIdx}`;

      if (!dateRaw || !pairRaw || !volRaw) {
        errors.push(`Dòng ${rowIdx}: Thiếu thông tin bắt buộc (Ngày, Cặp tiền hoặc Doanh số).`);
        return;
      }

      // Parse Date
      let dateStr = '';
      if (typeof dateRaw === 'number') {
        // Excel serial date number
        const jsDate = new Date((dateRaw - (25567 + 2)) * 86400 * 1000);
        dateStr = jsDate.toISOString().split('T')[0];
      } else {
        const d = new Date(String(dateRaw).trim());
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0];
        } else {
          dateStr = '2026-03-01';
        }
      }

      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10) || 2026;
      const month = parseInt(parts[1], 10) || 1;
      const quarter = Math.ceil(month / 3);

      // Parse pair
      const currencyPair = String(pairRaw).toUpperCase().trim().replace(/[-_]/g, '/');
      const baseCurrency = currencyPair.split('/')[0] || 'USD';

      // Parse transaction type
      const typeStr = String(typeRaw || '').toLowerCase();
      const type: 'BUY' | 'SELL' = typeStr.includes('mua') || typeStr.includes('buy') ? 'BUY' : 'SELL';

      // Parse segment
      const segStr = String(segRaw || '').toLowerCase();
      let customerSegment: 'FDI' | 'XNK' | 'VIP' | 'RETAIL' = 'XNK';
      if (segStr.includes('fdi')) customerSegment = 'FDI';
      else if (segStr.includes('vip') || segStr.includes('private')) customerSegment = 'VIP';
      else if (segStr.includes('lẻ') || segStr.includes('retail') || segStr.includes('du học')) customerSegment = 'RETAIL';

      const volume = Number(volRaw) || 0;
      const executionRate = Number(execRateRaw) || (currencyPair.includes('USD') ? 25400 : 27000);
      const costRate = Number(costRateRaw) || (executionRate * 0.998);

      let volumeUSD = Number(volUSDRaw);
      if (!volumeUSD || isNaN(volumeUSD)) {
        if (baseCurrency === 'USD') volumeUSD = volume;
        else volumeUSD = (volume * executionRate) / 25400;
      }

      const volumeVND = volume * executionRate;
      let profitVND = Number(profitRaw);
      if (!profitVND || isNaN(profitVND)) {
        profitVND = Math.abs(volume * (executionRate - costRate));
      }

      transactions.push({
        id: String(idRaw),
        date: dateStr,
        month,
        quarter,
        year,
        currencyPair,
        baseCurrency,
        type,
        productType: 'SPOT',
        customerName: String(custRaw || 'Khách hàng Chi nhánh'),
        customerSegment,
        volume,
        volumeUSD: Math.round(volumeUSD),
        volumeVND: Math.round(volumeVND),
        executionRate,
        costRate,
        profitVND: Math.round(profitVND),
        dealerName: String(dealerRaw),
        status: 'SETTLED',
      });
    });

    if (transactions.length === 0) {
      return {
        success: false,
        errors: errors.length > 0 ? errors : ['Không tìm thấy dòng dữ liệu giao dịch hợp lệ nào.'],
      };
    }

    return {
      success: true,
      transactions,
      errors: errors.length > 0 ? errors : undefined,
      totalRows: transactions.length,
    };
  } catch (err: any) {
    return {
      success: false,
      errors: [`Không thể đọc file Excel: ${err?.message || 'Định dạng file không tương thích.'}`],
    };
  }
}

// Export Comprehensive Excel Report
export function exportSummaryReportExcel({
  branchName,
  period,
  summary,
  periodComparison,
  currencyBreakdown,
  segmentBreakdown,
  transactions,
  aiCommentary,
}: {
  branchName: string;
  period: string;
  summary: FXSummary;
  periodComparison: PeriodComparison[];
  currencyBreakdown: CurrencyBreakdownItem[];
  segmentBreakdown: SegmentBreakdownItem[];
  transactions: FXTransaction[];
  aiCommentary?: string;
}) {
  const workbook = XLSX.utils.book_new();

  // 1. KPI Sheet
  const kpiData = [
    { 'Chỉ Tiêu / Thước Đo': 'Chi Nhánh Ngân Hàng', 'Giá Trị Thực Hiện': branchName, 'Đơn Vị': '' },
    { 'Chỉ Tiêu / Thước Đo': 'Kỳ Báo Cáo', 'Giá Trị Thực Hiện': period, 'Đơn Vị': '' },
    { 'Chỉ Tiêu / Thước Đo': 'Tổng Doanh Số Mua', 'Giá Trị Thực Hiện': summary.totalBuyUSD, 'Đơn Vị': 'USD' },
    { 'Chỉ Tiêu / Thước Đo': 'Tổng Doanh Số Bán', 'Giá Trị Thực Hiện': summary.totalSellUSD, 'Đơn Vị': 'USD' },
    { 'Chỉ Tiêu / Thước Đo': 'Tổng Doanh Số Quy Đổi USD', 'Giá Trị Thực Hiện': summary.totalVolumeUSD, 'Đơn Vị': 'USD' },
    { 'Chỉ Tiêu / Thước Đo': 'Tổng Doanh Số Quy Đổi VND', 'Giá Trị Thực Hiện': summary.totalVolumeVND, 'Đơn Vị': 'VND' },
    { 'Chỉ Tiêu / Thước Đo': 'Lợi Nhuận Thuần FX', 'Giá Trị Thực Hiện': summary.totalProfitVND, 'Đơn Vị': 'VND' },
    { 'Chỉ Tiêu / Thước Đo': 'Chỉ Tiêu Kế Hoạch Lợi Nhuận', 'Giá Trị Thực Hiện': summary.targetProfitVND, 'Đơn Vị': 'VND' },
    { 'Chỉ Tiêu / Thước Đo': 'Tỷ Lệ Hoàn Thành Kế Hoạch', 'Giá Trị Thực Hiện': `${summary.profitCompletionRate.toFixed(1)}%`, 'Đơn Vị': '%' },
    { 'Chỉ Tiêu / Thước Đo': 'Biên Lợi Nhuận Bình Quân', 'Giá Trị Thực Hiện': `${summary.marginBps.toFixed(1)} bps`, 'Đơn Vị': 'bps' },
    { 'Chỉ Tiêu / Thước Đo': 'Tổng Số Giao Dịch', 'Giá Trị Thực Hiện': summary.transactionCount, 'Đơn Vị': 'Món' },
    { 'Chỉ Tiêu / Thước Đo': 'Số Lượng Khách Hàng', 'Giá Trị Thực Hiện': summary.customerCount, 'Đơn Vị': 'Khách hàng' },
  ];
  const wsKPI = XLSX.utils.json_to_sheet(kpiData);
  wsKPI['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, wsKPI, 'Tong_Quan_KPI');

  // 2. Period Comparison Sheet
  const compData = periodComparison.map((p) => ({
    'Kỳ': p.periodLabel,
    'Doanh Số (USD)': p.volumeUSD,
    'Lợi Nhuận (VND)': p.profitVND,
    'Kế Hoạch LN (VND)': p.targetProfitVND,
    'Tỷ Lệ Đạt (%)': `${p.profitCompletionRate.toFixed(1)}%`,
    'Tăng Trưởng DS (%)': p.growthVolumePct !== undefined ? `${p.growthVolumePct.toFixed(1)}%` : '-',
    'Tăng Trưởng LN (%)': p.growthProfitPct !== undefined ? `${p.growthProfitPct.toFixed(1)}%` : '-',
    'Biên LN (bps)': p.marginBps.toFixed(1),
    'Số Giao Dịch': p.transactionCount,
  }));
  const wsComp = XLSX.utils.json_to_sheet(compData);
  wsComp['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, wsComp, 'So_Sanh_Cac_Ky');

  // 3. Currency Breakdown
  const curData = currencyBreakdown.map((c) => ({
    'Cặp Ngoại Tệ': c.currencyPair,
    'Doanh Số (USD)': c.volumeUSD,
    'Lợi Nhuận (VND)': c.profitVND,
    'Tỷ Trọng Doanh Số (%)': `${c.percentageVolume.toFixed(1)}%`,
    'Tỷ Trọng Lợi Nhuận (%)': `${c.percentageProfit.toFixed(1)}%`,
    'Số Giao Dịch': c.transactionCount,
  }));
  const wsCur = XLSX.utils.json_to_sheet(curData);
  wsCur['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, wsCur, 'Co_Cau_Cap_Tien');

  // 4. Customer Segments
  const segData = segmentBreakdown.map((s) => ({
    'Phân Khúc': s.segmentLabel,
    'Doanh Số (USD)': s.volumeUSD,
    'Lợi Nhuận (VND)': s.profitVND,
    'Tỷ Trọng Doanh Số (%)': `${s.percentageVolume.toFixed(1)}%`,
    'Tỷ Trọng Lợi Nhuận (%)': `${s.percentageProfit.toFixed(1)}%`,
    'Số Lượng Khách Hàng': s.customerCount,
  }));
  const wsSeg = XLSX.utils.json_to_sheet(segData);
  wsSeg['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, wsSeg, 'Phan_Khuc_Khach_Hang');

  // 5. Transactions Ledger
  const txData = transactions.slice(0, 1000).map((t) => ({
    'Mã GD': t.id,
    'Ngày': t.date,
    'Cặp Tiền': t.currencyPair,
    'Chiều': t.type === 'BUY' ? 'Mua' : 'Bán',
    'Khách Hàng': t.customerName,
    'Phân Khúc': t.customerSegment,
    'Doanh Số (USD)': t.volumeUSD,
    'Tỷ Giá Thực Hiện': t.executionRate,
    'Tỷ Giá Vốn': t.costRate,
    'Lợi Nhuận (VND)': t.profitVND,
    'Dealer': t.dealerName,
  }));
  const wsTx = XLSX.utils.json_to_sheet(txData);
  wsTx['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 32 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, wsTx, 'Chi_Tiet_Giao_Dich');

  // 6. AI Commentary Sheet
  if (aiCommentary) {
    const aiData = [
      { 'BÁO CÁO PHÂN TÍCH & TƯ VẤN CHIẾN LƯỢC TĂNG TRƯỞNG LỢI NHUẬN FX BẰNG AI': aiCommentary },
    ];
    const wsAI = XLSX.utils.json_to_sheet(aiData);
    wsAI['!cols'] = [{ wch: 120 }];
    XLSX.utils.book_append_sheet(workbook, wsAI, 'Tu_Van_Chien_Luoc_AI');
  }

  const cleanPeriod = period.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `Bao_Cao_Kinh_Doanh_Ngoai_Te_${cleanPeriod}.xlsx`);
}
