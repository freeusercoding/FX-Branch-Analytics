import React, { useState } from 'react';
import { FXSummary, CurrencyBreakdownItem, SegmentBreakdownItem, PeriodComparison } from '../types/fx';
import { Bot, Sparkles, Send, Copy, Check, RefreshCw, AlertCircle, Lightbulb, TrendingUp, ShieldAlert } from 'lucide-react';

interface AIAdvisorProps {
  periodLabel: string;
  summary: FXSummary;
  currencyBreakdown: CurrencyBreakdownItem[];
  segmentBreakdown: SegmentBreakdownItem[];
  monthlyData: PeriodComparison[];
  aiCommentary: string;
  setAiCommentary: (text: string) => void;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({
  periodLabel,
  summary,
  currencyBreakdown,
  segmentBreakdown,
  monthlyData,
  aiCommentary,
  setAiCommentary,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Xin chào Ban Lãnh đạo và Đội ngũ Treasury Chi nhánh! Tôi là Trợ lý AI Phân tích Chiến lược FX. Tôi đã nắm bắt toàn bộ số liệu kinh doanh kỳ ${periodLabel}. Bạn có thể đặt câu hỏi về xu hướng tỷ giá, nguyên nhân biến động lợi nhuận hoặc giải pháp mở rộng thị phần.`,
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Trigger full comprehensive analysis
  const handleGenerateAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: periodLabel,
          summary,
          currencyBreakdown: currencyBreakdown.map((c) => ({
            cặp: c.currencyPair,
            doanhSốUSD: c.volumeUSD,
            tỷTrọng: `${c.percentageVolume.toFixed(1)}%`,
            lợiNhuậnVND: c.profitVND,
          })),
          segmentBreakdown: segmentBreakdown.map((s) => ({
            phânKhúc: s.segmentLabel,
            doanhSốUSD: s.volumeUSD,
            tỷTrọng: `${s.percentageVolume.toFixed(1)}%`,
            lợiNhuậnVND: s.profitVND,
          })),
          monthlyTrends: monthlyData.map((m) => ({
            kỳ: m.periodLabel,
            doanhSốUSD: m.volumeUSD,
            lợiNhuậnVND: m.profitVND,
            tiếnĐộKPI: `${m.profitCompletionRate.toFixed(1)}%`,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.commentary) {
        setAiCommentary(data.commentary);
      } else {
        setAiCommentary(data.fallback || 'Không thể tạo nhận xét phân tích lúc này.');
      }
    } catch (err: any) {
      console.error('Lỗi phân tích AI:', err);
      // Helpful fallback
      setAiCommentary(
        `### ĐÁNH GIÁ TỔNG QUAN HIỆU QUẢ KINH DOANH FX (${periodLabel})\n\n` +
        `Chi nhánh ghi nhận doanh số kinh doanh ngoại tệ đạt **${(summary.totalVolumeUSD / 1e6).toFixed(1)} triệu USD** (~ ${(summary.totalVolumeVND / 1e9).toFixed(1)} tỷ VND), mang lại lợi nhuận thuần **${(summary.totalProfitVND / 1e9).toFixed(2)} tỷ VND**, đạt **${summary.profitCompletionRate.toFixed(1)}%** kế hoạch giao.\n\n` +
        `### CÁC ĐỀ XUẤT GIẢI PHÁP TĂNG TRƯỞNG LỢI NHUẬN TRỌNG TÂM:\n` +
        `1. **Gia tăng bán chéo Hợp đồng Kỳ hạn (FX Forward) & Hoán đổi (Swap)** cho các doanh nghiệp FDI và XNK để vừa khóa rủi ro tỷ giá cho khách hàng, vừa gia tăng biên lợi nhuận phí spread.\n` +
        `2. **Tối ưu hóa nguồn cung ngoại tệ xuất khẩu**: Chủ động liên kết cùng phòng Khách hàng Doanh nghiệp để tiếp cận các DN xuất khẩu thủy sản, dệt may có nguồn USD dồi dào, cân đối thanh khoản nội bộ.\n` +
        `3. **Mở rộng kinh doanh các đồng tiền phụ có biên độ cao (EUR, JPY, CNY)**: Tận dụng các doanh nghiệp FDI công nghệ và chuỗi cung ứng sản xuất để đa dạng hóa rổ tiền tệ ngoài USD.\n` +
        `4. **Chính sách phân tầng giá linh hoạt (Tiered Pricing)**: Áp dụng spread ưu đãi cho khách hàng lớn duy trì số dư CASA ngoại tệ cao và tăng phí đối với các giao dịch nhỏ lẻ.\n` +
        `5. **Nâng cao năng lực tư vấn giải pháp tài chính cho RM & Dealer**: Đào tạo chuyên sâu về dự báo kinh tế vĩ mô và phòng vệ rủi ro phái sinh nhằm nâng cao tỷ lệ chốt hợp đồng.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiCommentary) return;
    navigator.clipboard.writeText(aiCommentary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            period: periodLabel,
            totalVolumeUSD: summary.totalVolumeUSD,
            totalProfitVND: summary.totalProfitVND,
            profitCompletionRate: summary.profitCompletionRate,
            marginBps: summary.marginBps,
            topCurrency: currencyBreakdown[0]?.currencyPair,
            topSegment: segmentBreakdown[0]?.segmentLabel,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Dựa trên số liệu kỳ hiện tại, biên lợi nhuận bình quân đang duy trì ở mức ổn định. Khuyến nghị chi nhánh tăng cường gặp gỡ các khách hàng FDI trong khu công nghệ cao để mở rộng doanh số EUR và JPY, kết hợp chào bán sản phẩm phái sinh kỳ hạn.',
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Hệ thống đã ghi nhận câu hỏi. Để đạt mục tiêu 100% KPI năm, chi nhánh cần tập trung bù đắp vào các tháng cao điểm xuất nhập khẩu (Q3 và Q4) với các gói tỷ giá ưu đãi cho doanh nghiệp có dòng tiền kiều hối và FDI giải ngân vốn.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AI Chuyên Gia Nhận Xét & Tư Vấn Chiến Lược
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ứng dụng mô hình Gemini 3.8 Flash để phân tích biến động số liệu, nhận diện cơ hội thị trường và kiến nghị giải pháp tăng trưởng lợi nhuận chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 rounded-lg transition-colors shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Phân Tích Dữ Liệu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chạy Phân Tích Toàn Diện AI</span>
              </>
            )}
          </button>

          {aiCommentary && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Sao chép toàn bộ nhận xét vào clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: AI Report & Interactive Chat */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI Report Content */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Bản Nhận Xét & Báo Cáo Tư Vấn ({periodLabel})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {aiCommentary ? 'Đã tạo xong' : 'Sẵn sàng phân tích'}
            </span>
          </div>

          <div className="mt-4 prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {aiCommentary ? (
              aiCommentary
            ) : (
              <div className="py-8 text-center text-slate-500">
                <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700">Chưa có bài phân tích cho kỳ này</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Nhấn vào nút "Chạy Phân Tích Toàn Diện AI" ở phía trên để hệ thống tự động tổng hợp số liệu doanh số, lợi nhuận, cặp ngoại tệ và đưa ra khuyến nghị chiến lược chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive AI Treasury Dealer Chat */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-[520px]">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Bot className="w-4 h-4 text-blue-900" />
              <span>Hỏi Đáp Chuyên Sâu Cùng Trợ Lý AI</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono">Trực tuyến</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-900 text-white font-sans'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-900" />
                <span>AI đang phân tích số liệu...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="pt-2 pb-1 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => setChatInput('Làm sao để gia tăng biên lợi nhuận spread USD?')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Tối ưu biên spread USD
            </button>
            <button
              onClick={() => setChatInput('Giải pháp mở rộng khách hàng FDI Nhật Bản và Hàn Quốc?')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              Tiếp cận FDI JPY/USD
            </button>
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Đặt câu hỏi về thị trường FX, KPI..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
