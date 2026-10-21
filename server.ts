import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google Gemini AI SDK on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint: AI Analysis for FX Business Operations
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { period, summary, currencyBreakdown, segmentBreakdown, monthlyTrends } = req.body;

    const systemPrompt = `Bạn là Chuyên gia Tư vấn Cấp cao về Quản lý Nguồn vốn & Kinh doanh Ngoại tệ (Treasury & FX Senior Advisor) cho Chi nhánh Ngân hàng Thương mại tại Việt Nam.
Nhiệm vụ của bạn là phân tích dữ liệu kinh doanh ngoại tệ thực tế của chi nhánh trong kỳ báo cáo (${period || 'Giai đoạn phân tích'}), nhận xét xu hướng biến động và đề xuất các giải pháp tăng trưởng lợi nhuận cụ thể, có tính khả thi cao.

Quy định phản hồi:
- Sử dụng tiếng Việt nghiệp vụ ngân hàng chuyên nghiệp, rõ ràng, gãy gọn.
- Cấu trúc bài phân tích thành 4 phần logic:
  1. ĐÁNH GIÁ TỔNG QUAN HIỆU QUẢ KINH DOANH (Doanh số mua bán, quy đổi USD/VND, lợi nhuận gộp, tỷ lệ hoàn thành kế hoạch KPI).
  2. PHÂN TÍCH XU HƯỚNG & CƠ CẤU (Cặp ngoại tệ chủ lực như USD/VND, EUR/VND, JPY/VND, CNY/VND; tỷ trọng phân khúc khách hàng FDI, XNK, Bán lẻ).
  3. NHẬN DIỆN ĐIỂM NGHẼN & RỦI RO (Rủi ro tỷ giá, biến động spread, áp lực cạnh tranh, mức độ tập trung danh mục khách hàng).
  4. ĐỀ XUẤT 5 GIẢI PHÁP CHIẾN LƯỢC TĂNG TRƯỞNG LỢI NHUẬN (Giải pháp cụ thể: đẩy mạnh phái sinh Forward/Swap, tối ưu hóa biên độ spread, khai thác nguồn ngoại tệ từ FDI/XNK, giải pháp nhân sự Dealer/RM).
- Trả về văn bản định dạng Markdown rõ ràng, dễ đọc với gạch đầu dòng và số liệu minh chứng.`;

    const userMessage = `Dưới đây là số liệu kinh doanh ngoại tệ chi nhánh:
- Kỳ báo cáo: ${period}
- Tổng doanh số Mua: ${summary?.totalBuyUSD ? (summary.totalBuyUSD / 1e6).toFixed(2) + ' triệu USD' : 'N/A'}
- Tổng doanh số Bán: ${summary?.totalSellUSD ? (summary.totalSellUSD / 1e6).toFixed(2) + ' triệu USD' : 'N/A'}
- Tổng doanh số quy đổi USD: ${summary?.totalVolumeUSD ? (summary.totalVolumeUSD / 1e6).toFixed(2) + ' triệu USD' : 'N/A'} (Quy đổi VND: ${summary?.totalVolumeVND ? (summary.totalVolumeVND / 1e9).toFixed(2) + ' tỷ VND' : 'N/A'})
- Lợi nhuận thuần FX: ${summary?.totalProfitVND ? (summary.totalProfitVND / 1e9).toFixed(2) + ' tỷ VND' : 'N/A'}
- Chỉ tiêu kế hoạch Lợi nhuận: ${summary?.targetProfitVND ? (summary.targetProfitVND / 1e9).toFixed(2) + ' tỷ VND' : 'N/A'}
- Tỷ lệ hoàn thành kế hoạch: ${summary?.profitCompletionRate ? summary.profitCompletionRate.toFixed(1) + '%' : 'N/A'}
- Biên lợi nhuận trung bình: ${summary?.marginBps ? summary.marginBps.toFixed(1) + ' bps' : 'N/A'}

Cơ cấu theo cặp ngoại tệ:
${JSON.stringify(currencyBreakdown || [], null, 2)}

Cơ cấu theo phân khúc khách hàng:
${JSON.stringify(segmentBreakdown || [], null, 2)}

Diễn biến qua các tháng/kỳ:
${JSON.stringify(monthlyTrends || [], null, 2)}

Hãy đưa ra bài nhận xét phân tích chuyên sâu và đề xuất giải pháp chiến lược bứt phá cho Giám đốc Chi nhánh và Trưởng phòng Kinh doanh Ngoại tệ.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] },
      ],
    });

    const commentary = response.text || 'Không thể tạo nhận xét phân tích vào lúc này.';
    res.json({ success: true, commentary });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi khi gọi dịch vụ phân tích AI.',
      fallback: 'Chi nhánh ghi nhận kết quả kinh doanh ngoại tệ tích cực với doanh số duy trì ổn định. Cần tập trung mở rộng tập khách hàng xuất nhập khẩu và tăng tỷ trọng bán chéo các sản phẩm phái sinh kỳ hạn (FX Forward) để tối ưu hóa biên lợi nhuận.'
    });
  }
});

// API endpoint: AI Chat Assistant for FX inquiries
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    const systemPrompt = `Bạn là Chuyên gia Tư vấn Cấp cao về FX & Thị trường Nguồn vốn ngân hàng.
Bạn đang hỗ trợ Ban Giám đốc và Phòng Kinh doanh Ngoại tệ của chi nhánh ngân hàng.
Hãy trả lời câu hỏi của người dùng một cách chính xác, sắc bén, bám sát số liệu kinh doanh ngoại tệ thực tế được cung cấp trong ngữ cảnh.`;

    const fullPrompt = `${systemPrompt}\n\n[BỐI CẢNH SỐ LIỆU CHI NHÁNH]:\n${JSON.stringify(context || {}, null, 2)}\n\n[CÂU HỎI]:\n${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
    });

    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi khi xử lý câu hỏi với AI.',
    });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
