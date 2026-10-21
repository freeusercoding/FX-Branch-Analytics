import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types/fx';
import { UploadCloud, Download, Shield, ChevronDown, Check } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  onOpenUpload,
  onOpenExport,
  activeTab,
  onSelectTab,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Tổng Quan' },
    { id: 'comparison', label: 'So Sánh Kỳ' },
    { id: 'breakdown', label: 'Cơ Cấu Ngoại Tệ' },
    { id: 'transactions', label: 'Sổ Giao Dịch' },
    { id: 'ai-advisor', label: 'Tư Vấn Chiến Lược AI' },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return 'Giám Đốc Chi Nhánh';
      case 'TREASURY_MANAGER':
        return 'Trưởng Phòng FX';
      case 'FX_DEALER':
        return 'Chuyên Viên Dealer';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              FX
            </div>
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('overview');
              }}
              className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-900 transition-colors"
            >
              FX Branch Analytics
            </a>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-blue-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + role profile */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200"
              title="Tải lên dữ liệu kinh doanh từ file Excel"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Nạp Excel</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              title="Xuất báo cáo tổng hợp Excel hoặc PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo</span>
            </button>

            {/* Role dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
                title="Chuyển đổi phân quyền người dùng"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Phân Quyền Chi Nhánh
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {currentUser.branchName}
                      </div>
                    </div>
                    <div className="p-1 space-y-1">
                      {availableUsers.map((usr) => (
                        <button
                          key={usr.id}
                          onClick={() => {
                            onSelectUser(usr);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            usr.id === currentUser.id
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{usr.name}</div>
                            <div className="text-[11px] text-slate-500">{usr.title}</div>
                          </div>
                          {usr.id === currentUser.id && (
                            <Check className="w-4 h-4 text-blue-800 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="px-3 pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Quyền: {currentUser.role === 'DIRECTOR' ? 'Xem & Phê duyệt toàn bộ' : currentUser.role === 'TREASURY_MANAGER' ? 'Quản trị phòng & Nạp dữ liệu' : 'Khai thác & Nhập liệu'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
