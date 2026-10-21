import React, { useState, useMemo } from 'react';
import { FXTransaction } from '../types/fx';
import { formatUSD, formatVND, formatNumber } from '../utils/fxCalculations';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

interface TransactionTableProps {
  transactions: FXTransaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPair, setSelectedPair] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'volumeUSD' | 'profitVND'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Unique pairs
  const currencyPairs = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.currencyPair))).sort();
  }, [transactions]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    let list = transactions.filter((t) => {
      if (selectedPair !== 'ALL' && t.currencyPair !== selectedPair) return false;
      if (selectedType !== 'ALL' && t.type !== selectedType) return false;
      if (selectedSegment !== 'ALL' && t.customerSegment !== selectedSegment) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = t.customerName.toLowerCase().includes(query);
        const matchId = t.id.toLowerCase().includes(query);
        const matchDealer = t.dealerName.toLowerCase().includes(query);
        return matchName || matchId || matchDealer;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = a.date.localeCompare(b.date);
      } else if (sortField === 'volumeUSD') {
        cmp = a.volumeUSD - b.volumeUSD;
      } else if (sortField === 'profitVND') {
        cmp = a.profitVND - b.profitVND;
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [transactions, selectedPair, selectedType, selectedSegment, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const handleSort = (field: 'date' | 'volumeUSD' | 'profitVND') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-900" />
            <span>Sổ Nhật Ký Giao Dịch Ngoại Tệ Chi Nhánh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chi tiết từng lệnh mua bán, tỷ giá khớp, tỷ giá vốn và lợi nhuận gộp thực hiện.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Hiển thị {filteredList.length} / {transactions.length} giao dịch
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo Khách hàng, Mã GD, Dealer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white"
          />
        </div>

        {/* Currency Pair Filter */}
        <div>
          <select
            value={selectedPair}
            onChange={(e) => {
              setSelectedPair(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white cursor-pointer"
          >
            <option value="ALL">Tất cả cặp ngoại tệ</option>
            {currencyPairs.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>

        {/* Type (Buy/Sell) Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white cursor-pointer"
          >
            <option value="ALL">Chiều: Mua & Bán</option>
            <option value="BUY">Mua ngoại tệ</option>
            <option value="SELL">Bán ngoại tệ</option>
          </select>
        </div>

        {/* Segment Filter */}
        <div>
          <select
            value={selectedSegment}
            onChange={(e) => {
              setSelectedSegment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:bg-white cursor-pointer"
          >
            <option value="ALL">Tất cả phân khúc</option>
            <option value="FDI">Doanh nghiệp FDI</option>
            <option value="XNK">Doanh nghiệp XNK</option>
            <option value="VIP">Khách hàng VIP</option>
            <option value="RETAIL">Bán lẻ & Định cư</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Mã GD</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  <span>Ngày GD</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">Cặp Ngoại Tệ</th>
              <th className="py-2.5 px-3 text-center">Chiều</th>
              <th className="py-2.5 px-3">Khách Hàng / Phân Khúc</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
                onClick={() => handleSort('volumeUSD')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Doanh Số (USD)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Tỷ Giá Khớp</th>
              <th className="py-2.5 px-3 text-right">Tỷ Giá Vốn</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-200/60 transition-colors"
                onClick={() => handleSort('profitVND')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Lợi Nhuận (VND)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">Dealer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                  Không tìm thấy giao dịch nào thỏa mãn bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              paginatedList.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{row.id}</td>
                  <td className="py-2.5 px-3 text-slate-600">{row.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.currencyPair}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        row.type === 'BUY'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {row.type === 'BUY' ? 'Mua' : 'Bán'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-medium text-slate-900 truncate max-w-[220px]">
                      {row.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {row.customerSegment === 'FDI'
                        ? 'FDI Doanh Nghiệp'
                        : row.customerSegment === 'XNK'
                        ? 'Doanh Nghiệp XNK'
                        : row.customerSegment === 'VIP'
                        ? 'Khách Hàng VIP'
                        : 'Bán Lẻ'}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-900">
                    {formatUSD(row.volumeUSD)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                    {formatNumber(row.executionRate, row.currencyPair.includes('JPY') ? 2 : 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {formatNumber(row.costRate, row.currencyPair.includes('JPY') ? 2 : 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                    {formatVND(row.profitVND)}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 truncate max-w-[130px]">
                    {row.dealerName}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Trang <span className="font-semibold text-slate-800 font-mono">{currentPage}</span> /{' '}
          <span className="font-semibold text-slate-800 font-mono">{totalPages}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
