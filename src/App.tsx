import React, { useState, useMemo } from 'react';
import { FXTransaction, TargetPlan, UserProfile } from './types/fx';
import { DEFAULT_USERS, SAMPLE_TARGETS, INITIAL_TRANSACTIONS } from './data/sampleData';
import {
  calculateSummary,
  getMonthlyComparison,
  getQuarterlyComparison,
  getYearlyComparison,
  getCurrencyBreakdown,
  getSegmentBreakdown,
  getDealerPerformance,
} from './utils/fxCalculations';

import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { KPISummary } from './components/KPISummary';
import { ComparisonSection } from './components/ComparisonSection';
import { ChartsSection } from './components/ChartsSection';
import { TransactionTable } from './components/TransactionTable';
import { AIAdvisor } from './components/AIAdvisor';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  const [transactions, setTransactions] = useState<FXTransaction[]>(INITIAL_TRANSACTIONS);
  const [targets] = useState<TargetPlan[]>(SAMPLE_TARGETS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS[0]);

  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'ALL'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('20/10/2026 19:50');

  // Pre-seed an executive AI Commentary for instant insights
  const [aiCommentary, setAiCommentary] = useState<string>(
    `### I. ĐÁNH GIÁ TỔNG QUAN HIỆU QUẢ KINH DOANH FX\n` +
    `Chi nhánh ghi nhận kết quả kinh doanh ngoại tệ năm 2025 bứt phá mạnh mẽ, đạt tổng doanh số quy đổi **$203.45M USD** (~ 5,167 tỷ VND), hoàn thành **106.8%** chỉ tiêu doanh số năm. Lợi nhuận gộp thuần đạt **16.58 tỷ VND** (tương đương 107.0% kế hoạch giao).\n` +
    `Biên lợi nhuận bình quân toàn danh mục duy trì mức **32.1 bps**, tăng 3.4 bps so với năm trước nhờ việc tái cơ cấu danh mục khách hàng trọng tâm.\n\n` +
    `### II. PHÂN TÍCH XU HƯỚNG & CƠ CẤU DANH MỤC\n` +
    `- **Cặp tiền tệ**: USD/VND tiếp tục chiếm tỷ trọng chi phối (64.2% doanh số, 59.8% lợi nhuận). Nhóm ngoại tệ chéo có biên lợi nhuận cao như EUR/VND (16.8%), JPY/VND (9.4%) và CNY/VND (6.2%) ghi nhận mức tăng trưởng doanh số trên 25% YoY.\n` +
    `- **Phân khúc khách hàng**: Nhóm Doanh nghiệp Xuất nhập khẩu và Doanh nghiệp FDI đóng góp 78.5% tổng doanh số, là động lực tăng trưởng cốt lõi của chi nhánh. Khách hàng VIP cá nhân mang lại biên lợi nhuận cao nhất (đạt 48.5 bps).\n\n` +
    `### III. NHẬN DIỆN ĐIỂM NGHẼN & RỦI RO\n` +
    `1. Tỷ lệ khách hàng sử dụng sản phẩm phái sinh phòng ngừa rủi ro (FX Forward / Swap) mới chỉ chiếm 18.2% tổng doanh số, còn lại 81.8% vẫn là giao dịch giao ngay (Spot).\n` +
    `2. Phụ thuộc lớn vào nguồn cung USD từ các doanh nghiệp xuất khẩu lớn vào cuối quý; rủi ro thiếu hụt thanh khoản ngoại tệ tạm thời trong các đợt cao điểm giải ngân nhập khẩu.\n\n` +
    `### IV. 5 GIẢI PHÁP CHIẾN LƯỢC TĂNG TRƯỞNG LỢI NHUẬN\n` +
    `1. **Tập trung bán chéo Hợp đồng Kỳ hạn (FX Forward) & Hoán đổi (Swap)**: Ban hành chương trình ưu đãi phí tài trợ thương mại cho doanh nghiệp XNK ký kết hợp đồng FX Forward từ 30 - 90 ngày nhằm khóa biên độ spread an toàn.\n` +
    `2. **Tiếp cận sâu chuỗi cung ứng FDI**: Kết hợp cùng phòng Khách hàng Doanh nghiệp tiếp cận hệ sinh thái các nhà cung ứng cấp 1, cấp 2 của Samsung, Canon, Foxconn để mở rộng giao dịch CNY và JPY.\n` +
    `3. **Tối ưu hóa chính sách định giá linh hoạt (Spread Tiering)**: Giảm 2 - 3 bps cho các khách hàng VIP cam kết duy trì tiền gửi không kỳ hạn (CASA) ngoại tệ quy mô trên $1M USD.\n` +
    `4. **Tăng cường giải pháp phòng vệ rủi ro tỷ giá cho doanh nghiệp vay ngoại tệ**: Tư vấn chuyển đổi cấu trúc nợ sang VND kết hợp hoán đổi lãi suất/tiền tệ.\n` +
    `5. **Đào tạo chuyên môn & số hóa công cụ cho Dealer/RM**: Trang bị bảng tính định giá tức thời và kịch bản phân tích vĩ mô để RM tự tin tư vấn cho ban giám đốc tài chính (CFO) của khách hàng.`
  );

  // Period label string
  const periodLabel = useMemo(() => {
    if (selectedMonth !== 'ALL') {
      return `Tháng ${selectedMonth}/${selectedYear}`;
    }
    if (selectedQuarter !== 'ALL') {
      return `Quý ${selectedQuarter}/${selectedYear}`;
    }
    return `Năm ${selectedYear}`;
  }, [selectedYear, selectedQuarter, selectedMonth]);

  // Filtered transactions for the current selection
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.year !== selectedYear) return false;
      if (selectedQuarter !== 'ALL' && t.quarter !== selectedQuarter) return false;
      if (selectedMonth !== 'ALL' && t.month !== selectedMonth) return false;
      return true;
    });
  }, [transactions, selectedYear, selectedQuarter, selectedMonth]);

  // Financial calculations
  const summary = useMemo(() => {
    return calculateSummary(
      transactions,
      targets,
      selectedYear,
      selectedQuarter,
      selectedMonth
    );
  }, [transactions, targets, selectedYear, selectedQuarter, selectedMonth]);

  const monthlyComparison = useMemo(() => {
    return getMonthlyComparison(transactions, targets, selectedYear);
  }, [transactions, targets, selectedYear]);

  const quarterlyComparison = useMemo(() => {
    return getQuarterlyComparison(transactions, targets, selectedYear);
  }, [transactions, targets, selectedYear]);

  const yearlyComparison = useMemo(() => {
    return getYearlyComparison(transactions, targets);
  }, [transactions, targets]);

  const currencyBreakdown = useMemo(() => {
    return getCurrencyBreakdown(filteredTransactions.length > 0 ? filteredTransactions : transactions);
  }, [filteredTransactions, transactions]);

  const segmentBreakdown = useMemo(() => {
    return getSegmentBreakdown(filteredTransactions.length > 0 ? filteredTransactions : transactions);
  }, [filteredTransactions, transactions]);

  const dealerPerformance = useMemo(() => {
    return getDealerPerformance(filteredTransactions.length > 0 ? filteredTransactions : transactions);
  }, [filteredTransactions, transactions]);

  // Handlers
  const handleResetSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay');
  };

  const handleApplyData = (newTx: FXTransaction[], mode: 'REPLACE' | 'APPEND') => {
    if (mode === 'REPLACE') {
      setTransactions(newTx);
    } else {
      setTransactions((prev) => [...newTx, ...prev]);
    }
    setLastUpdated(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        availableUsers={DEFAULT_USERS}
        onSelectUser={setCurrentUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. Branch & Period Control Strip */}
      <HeroHeader
        branchName={currentUser.branchName}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        selectedQuarter={selectedQuarter}
        onSelectQuarter={setSelectedQuarter}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onResetSampleData={handleResetSampleData}
        totalTransactions={transactions.length}
        lastUpdated={lastUpdated}
      />

      {/* 3. Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* KPI Strip */}
        <section id="overview" className="scroll-mt-20">
          <KPISummary summary={summary} periodLabel={periodLabel} />
        </section>

        {/* Tab-driven or full-view sections */}
        {(activeTab === 'overview' || activeTab === 'comparison') && (
          <section id="comparison" className="scroll-mt-20">
            <ComparisonSection
              monthlyData={monthlyComparison}
              quarterlyData={quarterlyComparison}
              yearlyData={yearlyComparison}
              selectedYear={selectedYear}
            />
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'breakdown') && (
          <section id="breakdown" className="scroll-mt-20">
            <ChartsSection
              currencyBreakdown={currencyBreakdown}
              segmentBreakdown={segmentBreakdown}
              dealerPerformance={dealerPerformance}
            />
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'ai-advisor') && (
          <section id="ai-advisor" className="scroll-mt-20">
            <AIAdvisor
              periodLabel={periodLabel}
              summary={summary}
              currencyBreakdown={currencyBreakdown}
              segmentBreakdown={segmentBreakdown}
              monthlyData={monthlyComparison}
              aiCommentary={aiCommentary}
              setAiCommentary={setAiCommentary}
            />
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'transactions') && (
          <section id="transactions" className="scroll-mt-20">
            <TransactionTable transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions} />
          </section>
        )}
      </main>

      {/* 4. Quiet Banking Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FX Branch Analytics</span>
            <span>·</span>
            <span>Hệ thống Quản trị & Phân tích Kinh doanh Ngoại tệ Chi nhánh</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Bảo mật cấp độ Ngân hàng</span>
            <span>·</span>
            <span>Phiên bản Quản trị Nội bộ</span>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <ExcelUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyData={handleApplyData}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        branchName={currentUser.branchName}
        periodLabel={periodLabel}
        summary={summary}
        periodComparison={monthlyComparison}
        currencyBreakdown={currencyBreakdown}
        segmentBreakdown={segmentBreakdown}
        transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions}
        aiCommentary={aiCommentary}
        currentUser={currentUser}
      />
    </div>
  );
}
