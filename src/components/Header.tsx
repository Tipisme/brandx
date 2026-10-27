import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Mail, Award, ShoppingCart, User, Menu, X, Sparkles, ChevronDown, Briefcase, Folder, Settings, HelpCircle, ShieldCheck, Coins } from 'lucide-react';
import { translations, Language } from '../localization';
import BrandixLogo from './BrandixLogo';
import { AdminTab, getAdminTabPath, ADMIN_TAB_LABELS, navigateTo } from '../utils/routes';

interface HeaderProps {
  searchKeyword?: string;
  onSearchChange: (keyword: string) => void;
  onClassSelect: (cls: number | null) => void;
  onOpenWizard: () => void;
  onOpenCart: () => void;
  cartCount: number;
  selectedClass: number | null;
  onOpenLogin: (redirectTarget?: { path: string; tab?: AdminTab; label?: string }) => void;
  user: { name: string; email: string; is_partner?: boolean | number | string; [key: string]: any } | null;
  onLogout: () => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  viewMode?: 'marketplace' | 'dashboard';
  onViewModeChange?: (mode: 'marketplace' | 'dashboard') => void;
  currentRoute: string;
  adminTab?: AdminTab;
  onNavigate?: (path: string) => void;
}

export default function Header({
  searchKeyword = "",
  onSearchChange,
  onClassSelect,
  onOpenWizard,
  onOpenCart,
  cartCount,
  selectedClass,
  onOpenLogin,
  user,
  onLogout,
  language = 'vi',
  onLanguageChange,
  viewMode = 'marketplace',
  onViewModeChange,
  currentRoute,
  adminTab = 'profile',
  onNavigate
}: HeaderProps) {
  const t = translations.vi;
  const [searchVal, setSearchVal] = useState(searchKeyword);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Partner status verification - default is false unless is_partner is true
  const isPartner = Boolean(
    user?.is_partner === true ||
    (user as any)?.is_partner === 1 ||
    (user as any)?.is_partner === '1' ||
    (user as any)?.is_partner === 'true'
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal search input value when searchKeyword changes from outside
  useEffect(() => {
    if (searchKeyword !== undefined) {
      setSearchVal(searchKeyword);
    }
  }, [searchKeyword]);

  const categories = [
    { id: null, label: "Tất cả danh mục" },
    { id: 29, label: "Thực phẩm & Sữa (Nhóm 29)" },
    { id: 30, label: "Cà phê, Trà & Bánh kẹo (Nhóm 30)" },
    { id: 32, label: "Đồ uống không cồn (Nhóm 32)" },
    { id: 33, label: "Đồ uống có cồn (Nhóm 33)" },
    { id: 9, label: "Thiết bị điện tử (Nhóm 9)" },
    { id: 5, label: "Y tế & Dược phẩm (Nhóm 5)" },
    { id: 25, label: "Thời trang & May mặc (Nhóm 25)" },
    { id: 35, label: "Quảng cáo & Bán lẻ (Nhóm 35)" },
    { id: 43, label: "Ăn uống & Lưu trú (Nhóm 43)" },
    { id: 44, label: "Y tế & Làm đẹp (Nhóm 44)" }
  ];

  // Simply update local input text while typing - do NOT jump page while typing
  const handleInputChange = (newVal: string) => {
    setSearchVal(newVal);
  };

  // Only jump page and trigger search query when user clicks "Tra Cứu" button or presses Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoute !== 'catalog' || viewMode === 'dashboard') {
      onViewModeChange?.('marketplace');
      navigateTo('/catalog');
    }
    onSearchChange(searchVal.trim());
  };

  const currentCategoryLabel = categories.find(c => c.id === selectedClass)?.label || "Chọn Nhóm hàng...";

  return (
    <header className="w-full bg-white text-slate-800 shadow-sm sticky top-0 z-40" id="main-header">
      {/* Top Banner Contact */}
      <div className="w-full bg-slate-900 text-white text-[11px] py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <a href="tel:0901727373" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>Điện thoại: <strong className="text-orange-400">0901727373</strong></span>
            </a>
            <a href="mailto:ipagent@hdslaw.vn" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span>Email: <span className="text-gray-300 hover:text-orange-400 transition-colors">ipagent@hdslaw.vn</span></span>
            </a>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('/about'); }} className="hover:text-white transition-colors">{t.whyUs}</a>
            <span className="text-slate-700">|</span>
            <a href="/news" onClick={(e) => { e.preventDefault(); navigateTo('/news'); }} className="hover:text-white transition-colors">Tin tức SHTT</a>
            <span className="text-slate-700">|</span>
            <a href="/faq" onClick={(e) => { e.preventDefault(); if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } navigateTo('/faq'); }} className="hover:text-white transition-colors">{t.faq}</a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <BrandixLogo
          size="md"
          variant="horizontal"
          showTagline={true}
          onClick={() => { navigateTo('/'); onSearchChange(""); onClassSelect(null); onViewModeChange?.('marketplace'); }}
        />

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-4 pr-1.5 items-center gap-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchVal}
            onChange={(e) => handleInputChange(e.target.value)}
            className="bg-transparent flex-1 outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
          
          {/* Dropdown Category Selector */}
          <div className="relative border-l border-slate-200 pl-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-3 rounded-md flex items-center gap-1.5 focus:outline-none"
            >
              <span className="max-w-[130px] truncate">{currentCategoryLabel}</span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>
            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                {categories.map((cat) => (
                  <button
                    key={cat.id ?? 'all'}
                    type="button"
                    onClick={() => {
                      onClassSelect(cat.id);
                      setShowCategoryDropdown(false);
                      if (currentRoute !== 'catalog' || viewMode === 'dashboard') {
                        onViewModeChange?.('marketplace');
                        window.location.hash = '#/catalog';
                      }
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-50 text-xs transition-colors flex justify-between items-center ${selectedClass === cat.id ? 'text-orange-500 font-semibold bg-orange-50/50' : 'text-slate-700'}`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            {t.searchBtn}
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenWizard}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all duration-150 shadow-sm shadow-orange-500/10 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Đăng ký mới
          </button>

          {/* Cart Interest Button */}
          <button
            onClick={onOpenCart}
            className="p-2.5 border border-slate-200 rounded-full hover:bg-slate-50 relative text-slate-600 transition-colors cursor-pointer"
            title="Nhãn hiệu quan tâm"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile / Account Action */}
          {user ? (
            <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 rounded-full hidden sm:flex">
              <button 
                onClick={() => onViewModeChange?.('dashboard')}
                className="text-[11px] font-bold text-slate-700 max-w-[80px] truncate hover:text-orange-500 transition-colors cursor-pointer text-left focus:outline-none"
                title="Vào trang quản trị"
              >
                {user.name}
              </button>
              <button
                onClick={onLogout}
                className="text-[9px] bg-slate-200 hover:bg-slate-300 hover:text-red-600 px-2.5 py-1.5 rounded-full font-bold text-slate-600 cursor-pointer transition-colors"
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="p-2.5 border border-slate-200 rounded-full hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer hidden sm:block"
              title="Đăng nhập / Đăng ký"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 md:hidden hover:bg-slate-100 rounded-lg text-slate-700"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Menu (Desktop) */}
      <nav className="w-full border-t border-slate-100 bg-slate-50/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-7 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/') : (window.location.hash = '#/');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'home' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.home}
            </a>
            <a 
              href="/catalog" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/catalog') : (window.location.hash = '#/catalog');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'catalog' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.catalog}
            </a>
            <a 
              href="/workflow" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/workflow') : (window.location.hash = '#/workflow');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'workflow' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.workflow}
            </a>
            <a 
              href="/about" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/about') : (window.location.hash = '#/about');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'about' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.whyUs}
            </a>
            <a 
              href="/faq" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/faq') : (window.location.hash = '#/faq');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'faq' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.faq}
            </a>
            <a 
              href="/news" 
              onClick={(e) => {
                e.preventDefault();
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace');
                onNavigate ? onNavigate('/news') : (window.location.hash = '#/news');
              }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${(currentRoute === 'news' || currentRoute === 'news-detail') && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.news}
            </a>

            {/* Trang Quản Trị with sub-menus dropdown */}
            <div className="relative" ref={adminDropdownRef}>
              <div className="flex items-center">
                <a
                  href="/quan-tri"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!user) {
                      onOpenLogin({ path: '/quan-tri/ca-nhan-to-chuc', tab: 'profile', label: 'Trang quản trị' });
                    } else {
                      onViewModeChange?.('dashboard');
                      onNavigate?.(getAdminTabPath(adminTab || 'profile'));
                    }
                  }}
                  className={`hover:text-orange-500 transition-colors py-1 border-b-2 font-extrabold uppercase tracking-wider text-[11px] cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                  <span>Trang quản trị</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className={`p-1 hover:text-orange-500 transition-colors cursor-pointer ${
                    viewMode === 'dashboard' ? 'text-orange-500' : 'text-slate-400'
                  }`}
                  title="Xem các mục quản trị"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${showAdminDropdown ? 'rotate-180 text-orange-500' : ''}`} />
                </button>
              </div>

              {/* Dropdown Menu for Admin Tabs */}
              {showAdminDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 text-xs normal-case animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mục quản trị tài khoản
                  </div>

                  <a
                    href="/quan-tri/ca-nhan-to-chuc"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/ca-nhan-to-chuc', tab: 'profile', label: 'Cá nhân và tổ chức' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/ca-nhan-to-chuc');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'profile' ? 'bg-orange-50/80 text-orange-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Cá nhân và tổ chức</div>
                      <div className="text-[10px] text-slate-400">/quan-tri/ca-nhan-to-chuc</div>
                    </div>
                  </a>

                  <a
                    href="/quan-tri/quan-ly-tai-san"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/quan-ly-tai-san', tab: 'trademarks', label: 'Quản lý tài sản' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/quan-ly-tai-san');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'trademarks' ? 'bg-orange-50/80 text-orange-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Award className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Quản lý tài sản</div>
                      <div className="text-[10px] text-slate-400">/quan-tri/quan-ly-tai-san</div>
                    </div>
                  </a>

                  <a
                    href="/quan-tri/quan-ly-yeu-cau"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/quan-ly-yeu-cau', tab: 'cases', label: 'Quản lý yêu cầu' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/quan-ly-yeu-cau');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'cases' ? 'bg-orange-50/80 text-orange-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Quản lý yêu cầu</div>
                      <div className="text-[10px] text-slate-400">/quan-tri/quan-ly-yeu-cau</div>
                    </div>
                  </a>

                  <a
                    href="/quan-tri/quan-ly-file"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/quan-ly-file', tab: 'files', label: 'Quản lý file' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/quan-ly-file');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'files' ? 'bg-orange-50/80 text-orange-600 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Folder className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Quản lý file</div>
                      <div className="text-[10px] text-slate-400">/quan-tri/quan-ly-file</div>
                    </div>
                  </a>

                  {isPartner && (
                    <a
                      href="/quan-tri/hoa-hong-cua-toi"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAdminDropdown(false);
                        if (!user) {
                          onOpenLogin({ path: '/quan-tri/hoa-hong-cua-toi', tab: 'commissions', label: 'Hoa hồng của tôi' });
                        } else {
                          onViewModeChange?.('dashboard');
                          onNavigate?.('/quan-tri/hoa-hong-cua-toi');
                        }
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                        viewMode === 'dashboard' && adminTab === 'commissions' ? 'bg-orange-50/80 text-orange-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <div className="font-bold text-xs">Hoa hồng của tôi</div>
                        <div className="text-[10px] text-slate-400">/quan-tri/hoa-hong-cua-toi</div>
                      </div>
                    </a>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <a
                    href="/quan-tri/cai-dat"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/cai-dat', tab: 'settings', label: 'Cài đặt' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/cai-dat');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'settings' ? 'text-orange-600 font-bold' : 'text-slate-600'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-xs">Cài đặt</span>
                  </a>

                  <a
                    href="/quan-tri/ho-tro"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAdminDropdown(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/ho-tro', tab: 'support', label: 'Hỗ trợ' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/ho-tro');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                      viewMode === 'dashboard' && adminTab === 'support' ? 'text-orange-600 font-bold' : 'text-slate-600'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-xs">Hỗ trợ</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 shadow-inner flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex bg-slate-50 border border-slate-200 rounded-full p-1.5 items-center">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchVal}
              onChange={(e) => handleInputChange(e.target.value)}
              className="bg-transparent flex-1 outline-none text-xs text-slate-800 px-2"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full font-bold cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Links */}
          <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-wide text-slate-700">
            <a 
              href="/" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/') : (window.location.hash = '#/');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'home' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.home}
            </a>
            <a 
              href="/catalog" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/catalog') : (window.location.hash = '#/catalog');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'catalog' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.catalog}
            </a>
            <a 
              href="/workflow" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/workflow') : (window.location.hash = '#/workflow');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'workflow' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.workflow}
            </a>
            <a 
              href="/about" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/about') : (window.location.hash = '#/about');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'about' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.whyUs}
            </a>
            <a 
              href="/faq" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/faq') : (window.location.hash = '#/faq');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'faq' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.faq}
            </a>
            <a 
              href="/news" 
              onClick={(e) => { 
                e.preventDefault(); 
                setShowMobileMenu(false); 
                if (viewMode === 'dashboard') onViewModeChange?.('marketplace'); 
                onNavigate ? onNavigate('/news') : (window.location.hash = '#/news');
              }} 
              className={`hover:text-orange-500 transition-colors py-1 ${(currentRoute === 'news' || currentRoute === 'news-detail') && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}
            >
              {t.news}
            </a>

            {/* Mobile Admin Section with deep-links */}
            <div className="border-t border-slate-100 pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                💼 Trang quản trị (URLs riêng)
              </div>
              <div className="pl-2 space-y-2 text-xs normal-case font-medium">
                <a
                  href="/quan-tri/ca-nhan-to-chuc"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMobileMenu(false);
                    if (!user) {
                      onOpenLogin({ path: '/quan-tri/ca-nhan-to-chuc', tab: 'profile', label: 'Cá nhân và tổ chức' });
                    } else {
                      onViewModeChange?.('dashboard');
                      onNavigate?.('/quan-tri/ca-nhan-to-chuc');
                    }
                  }}
                  className={`block py-1 hover:text-orange-500 ${viewMode === 'dashboard' && adminTab === 'profile' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
                >
                  • Cá nhân và tổ chức
                </a>
                <a
                  href="/quan-tri/quan-ly-tai-san"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMobileMenu(false);
                    if (!user) {
                      onOpenLogin({ path: '/quan-tri/quan-ly-tai-san', tab: 'trademarks', label: 'Quản lý tài sản' });
                    } else {
                      onViewModeChange?.('dashboard');
                      onNavigate?.('/quan-tri/quan-ly-tai-san');
                    }
                  }}
                  className={`block py-1 hover:text-orange-500 ${viewMode === 'dashboard' && adminTab === 'trademarks' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
                >
                  • Quản lý tài sản
                </a>
                <a
                  href="/quan-tri/quan-ly-yeu-cau"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMobileMenu(false);
                    if (!user) {
                      onOpenLogin({ path: '/quan-tri/quan-ly-yeu-cau', tab: 'cases', label: 'Quản lý yêu cầu' });
                    } else {
                      onViewModeChange?.('dashboard');
                      onNavigate?.('/quan-tri/quan-ly-yeu-cau');
                    }
                  }}
                  className={`block py-1 hover:text-orange-500 ${viewMode === 'dashboard' && adminTab === 'cases' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
                >
                  • Quản lý yêu cầu
                </a>
                <a
                  href="/quan-tri/quan-ly-file"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMobileMenu(false);
                    if (!user) {
                      onOpenLogin({ path: '/quan-tri/quan-ly-file', tab: 'files', label: 'Quản lý file' });
                    } else {
                      onViewModeChange?.('dashboard');
                      onNavigate?.('/quan-tri/quan-ly-file');
                    }
                  }}
                  className={`block py-1 hover:text-orange-500 ${viewMode === 'dashboard' && adminTab === 'files' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
                >
                  • Quản lý file
                </a>
                {isPartner && (
                  <a
                    href="/quan-tri/hoa-hong-cua-toi"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMobileMenu(false);
                      if (!user) {
                        onOpenLogin({ path: '/quan-tri/hoa-hong-cua-toi', tab: 'commissions', label: 'Hoa hồng của tôi' });
                      } else {
                        onViewModeChange?.('dashboard');
                        onNavigate?.('/quan-tri/hoa-hong-cua-toi');
                      }
                    }}
                    className={`block py-1 hover:text-orange-500 ${viewMode === 'dashboard' && adminTab === 'commissions' ? 'text-orange-600 font-bold' : 'text-slate-600'}`}
                  >
                    • Hoa hồng của tôi
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs mb-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Đã đăng nhập:</span>
                  <strong className="text-slate-800 font-bold block">{user.name}</strong>
                </div>
                <button
                  onClick={() => { setShowMobileMenu(false); onLogout(); }}
                  className="bg-slate-200 hover:bg-slate-300 hover:text-red-600 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowMobileMenu(false); onOpenLogin(); }}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 w-full py-2.5 rounded-lg font-bold text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer mb-1"
              >
                <User className="w-4 h-4" />
                {t.loginRegister}
              </button>
            )}
            <button
              onClick={() => { setShowMobileMenu(false); onOpenWizard(); }}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2.5 rounded-lg font-bold text-xs text-center cursor-pointer"
            >
              Đăng ký mới
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-1">
              Liên kết cơ sở dữ liệu quốc tế WIPO & CSDL quốc gia
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
