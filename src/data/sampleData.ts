import { FXTransaction, TargetPlan, UserProfile } from '../types/fx';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_dir_01',
    name: 'Trần Đình Toàn',
    role: 'DIRECTOR',
    title: 'Giám đốc Chi nhánh',
    branchName: 'Chi nhánh Sài Gòn - Khối Kinh doanh Ngoại tệ & Nguồn vốn',
    avatarUrl: '/src/assets/images/avatar_bank_director_1792551546288.jpg',
  },
  {
    id: 'usr_mgr_02',
    name: 'Nguyễn Mai Chi',
    role: 'TREASURY_MANAGER',
    title: 'Trưởng phòng Kinh doanh Ngoại tệ & Treasury',
    branchName: 'Chi nhánh Sài Gòn',
  },
  {
    id: 'usr_dealer_03',
    name: 'Lê Quang Huy',
    role: 'FX_DEALER',
    title: 'Chuyên viên Kinh doanh Ngoại tệ (Senior Dealer)',
    branchName: 'Chi nhánh Sài Gòn',
  },
];

export const SAMPLE_TARGETS: TargetPlan[] = [
  // 2025 Monthly Targets
  { year: 2025, period: '2025-01', targetVolumeUSD: 14000000, targetProfitVND: 1150000000 },
  { year: 2025, period: '2025-02', targetVolumeUSD: 13000000, targetProfitVND: 1050000000 },
  { year: 2025, period: '2025-03', targetVolumeUSD: 16000000, targetProfitVND: 1300000000 },
  { year: 2025, period: '2025-04', targetVolumeUSD: 15000000, targetProfitVND: 1200000000 },
  { year: 2025, period: '2025-05', targetVolumeUSD: 16500000, targetProfitVND: 1350000000 },
  { year: 2025, period: '2025-06', targetVolumeUSD: 17500000, targetProfitVND: 1450000000 },
  { year: 2025, period: '2025-07', targetVolumeUSD: 16000000, targetProfitVND: 1300000000 },
  { year: 2025, period: '2025-08', targetVolumeUSD: 17000000, targetProfitVND: 1400000000 },
  { year: 2025, period: '2025-09', targetVolumeUSD: 18500000, targetProfitVND: 1550000000 },
  { year: 2025, period: '2025-10', targetVolumeUSD: 18000000, targetProfitVND: 1500000000 },
  { year: 2025, period: '2025-11', targetVolumeUSD: 19000000, targetProfitVND: 1600000000 },
  { year: 2025, period: '2025-12', targetVolumeUSD: 20000000, targetProfitVND: 1750000000 },

  // 2026 Monthly Targets
  { year: 2026, period: '2026-01', targetVolumeUSD: 16500000, targetProfitVND: 1400000000 },
  { year: 2026, period: '2026-02', targetVolumeUSD: 15500000, targetProfitVND: 1300000000 },
  { year: 2026, period: '2026-03', targetVolumeUSD: 18000000, targetProfitVND: 1550000000 },
  { year: 2026, period: '2026-04', targetVolumeUSD: 17500000, targetProfitVND: 1500000000 },
  { year: 2026, period: '2026-05', targetVolumeUSD: 19000000, targetProfitVND: 1650000000 },
  { year: 2026, period: '2026-06', targetVolumeUSD: 20500000, targetProfitVND: 1800000000 },
];

// Helper to seed realistic transactions
function generateSampleTransactions(): FXTransaction[] {
  const transactions: FXTransaction[] = [];
  const dealers = ['Lê Quang Huy', 'Phạm Minh Trang', 'Hoàng Tuấn Dũng', 'Vũ Bích Ngọc'];
  
  const customers = [
    { name: 'Công ty TNHH Samsung Electronics HCMC', segment: 'FDI' as const, pair: 'USD/VND' },
    { name: 'Tập đoàn Dệt may Phong Phú', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Công ty CP Thủy sản Minh Phú', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Công ty TNHH Nestlé Việt Nam', segment: 'FDI' as const, pair: 'EUR/VND' },
    { name: 'Công ty TNHH Canon Việt Nam', segment: 'FDI' as const, pair: 'JPY/VND' },
    { name: 'Công ty CP Sữa Vinamilk', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Công ty TNHH Foxconn Precision', segment: 'FDI' as const, pair: 'CNY/VND' },
    { name: 'Công ty TNHH Cơ điện Lạnh REE', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Bà Nguyễn Thị Hoàng Oanh (KH VIP Diamond)', segment: 'VIP' as const, pair: 'USD/VND' },
    { name: 'Ông Đặng Lê Nguyên (KH VIP Private)', segment: 'VIP' as const, pair: 'EUR/VND' },
    { name: 'Khách hàng cá nhân - Du học Australia', segment: 'RETAIL' as const, pair: 'AUD/VND' },
    { name: 'Khách hàng cá nhân - Du lịch & Định cư UK', segment: 'RETAIL' as const, pair: 'GBP/VND' },
    { name: 'Công ty CP Hàng không Tre Việt', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Công ty TNHH Piaggio Việt Nam', segment: 'FDI' as const, pair: 'EUR/VND' },
    { name: 'Công ty TNHH Yazaki HCMC Component', segment: 'FDI' as const, pair: 'JPY/VND' },
    { name: 'Công ty Cổ phần Thép Hòa Phát', segment: 'XNK' as const, pair: 'USD/VND' },
    { name: 'Công ty TNHH Luxshare-ICT', segment: 'FDI' as const, pair: 'CNY/VND' },
    { name: 'Tập đoàn Hóa chất Đức Giang', segment: 'XNK' as const, pair: 'USD/VND' },
  ];

  let idCounter = 1000;

  // Generate 2025 full 12 months & 2026 early months
  const yearConfigs = [
    { year: 2025, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { year: 2026, months: [1, 2, 3, 4, 5, 6] },
  ];

  yearConfigs.forEach(({ year, months }) => {
    months.forEach((month) => {
      // 10-14 transactions per month
      const count = 10 + ((month * 7) % 5);
      for (let i = 0; i < count; i++) {
        idCounter++;
        const cust = customers[(idCounter + i) % customers.length];
        const day = Math.min(28, 1 + ((i * 3 + month * 2) % 27));
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const quarter = Math.ceil(month / 3);

        const type = (idCounter + i) % 2 === 0 ? ('BUY' as const) : ('SELL' as const);
        const productType = (i % 5 === 0) ? ('FORWARD' as const) : (i % 7 === 0 ? ('SWAP' as const) : ('SPOT' as const));
        const dealer = dealers[(idCounter + i) % dealers.length];

        let baseCurrency = 'USD';
        let costRate = 25300;
        let spreadBps = 25; // 25 bps = 0.25%
        let volumeUSD = 0;
        let volume = 0;

        if (cust.pair === 'USD/VND') {
          baseCurrency = 'USD';
          costRate = year === 2025 ? 25150 + month * 18 : 25420 + month * 12;
          volume = Math.round((250000 + ((idCounter * 43) % 950000)) / 10000) * 10000;
          volumeUSD = volume;
          spreadBps = cust.segment === 'FDI' ? 18 : (cust.segment === 'XNK' ? 24 : 45);
        } else if (cust.pair === 'EUR/VND') {
          baseCurrency = 'EUR';
          costRate = 27200 + (month % 5) * 60;
          volume = Math.round((180000 + ((idCounter * 31) % 550000)) / 5000) * 5000;
          volumeUSD = volume * 1.08;
          spreadBps = cust.segment === 'VIP' ? 35 : 28;
        } else if (cust.pair === 'JPY/VND') {
          baseCurrency = 'JPY';
          costRate = 164 + (month % 4) * 0.8;
          volume = Math.round((35000000 + ((idCounter * 120000) % 90000000)) / 1000000) * 1000000;
          volumeUSD = (volume * costRate) / 25300;
          spreadBps = 32;
        } else if (cust.pair === 'CNY/VND') {
          baseCurrency = 'CNY';
          costRate = 3480 + (month % 3) * 15;
          volume = Math.round((1200000 + ((idCounter * 50000) % 3500000)) / 100000) * 100000;
          volumeUSD = (volume * costRate) / 25300;
          spreadBps = 38;
        } else if (cust.pair === 'AUD/VND') {
          baseCurrency = 'AUD';
          costRate = 16400 + (month % 4) * 50;
          volume = Math.round((80000 + ((idCounter * 15000) % 250000)) / 10000) * 10000;
          volumeUSD = (volume * costRate) / 25300;
          spreadBps = 60;
        } else {
          baseCurrency = 'GBP';
          costRate = 32300 + (month % 3) * 80;
          volume = Math.round((60000 + ((idCounter * 12000) % 200000)) / 5000) * 5000;
          volumeUSD = (volume * costRate) / 25300;
          spreadBps = 55;
        }

        // Execution rate calculation
        const spreadAmount = costRate * (spreadBps / 10000);
        const executionRate = type === 'BUY'
          ? Math.round((costRate - spreadAmount) * 100) / 100
          : Math.round((costRate + spreadAmount) * 100) / 100;

        const volumeVND = Math.round(volume * executionRate);
        const profitVND = Math.round(volume * Math.abs(executionRate - costRate));

        transactions.push({
          id: `FX-${year}-${String(idCounter).slice(-4)}`,
          date: dateStr,
          month,
          quarter,
          year,
          currencyPair: cust.pair,
          baseCurrency,
          type,
          productType,
          customerName: cust.name,
          customerSegment: cust.segment,
          volume,
          volumeUSD: Math.round(volumeUSD),
          volumeVND,
          executionRate,
          costRate,
          profitVND,
          dealerName: dealer,
          status: 'SETTLED',
        });
      }
    });
  });

  return transactions;
}

export const INITIAL_TRANSACTIONS: FXTransaction[] = generateSampleTransactions();
