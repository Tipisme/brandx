import React, { useState } from 'react';
import { Search, Phone, Mail, Award, ShoppingCart, User, Menu, X, Sparkles } from 'lucide-react';
import { translations, Language } from '../localization';
import BrandixLogo from './BrandixLogo';

interface HeaderProps {
  onSearchChange: (keyword: string) => void;
  onClassSelect: (cls: number | null) => void;
  onOpenWizard: () => void;
  onOpenCart: () => void;
  cartCount: number;
  selectedClass: number | null;
  onOpenLogin: () => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  viewMode?: 'marketplace' | 'dashboard';
  onViewModeChange?: (mode: 'marketplace' | 'dashboard') => void;
  currentRoute: string;
}

export default function Header({
  onSearchChange,
  onClassSelect,
  onOpenWizard,
  onOpenCart,
  cartCount,
  selectedClass,
  onOpenLogin,
  user,
  onLogout,
  language,
  onLanguageChange,
  viewMode = 'marketplace',
  onViewModeChange,
  currentRoute
}: HeaderProps) {
  const t = translations[language];
  const [searchVal, setSearchVal] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const categories = [
    { id: null, label: language === 'vi' ? "Tất cả danh mục" : "All Categories" },
    { id: 29, label: language === 'vi' ? "Thực phẩm & Sữa (Nhóm 29)" : "Foods & Milk (Class 29)" },
    { id: 30, label: language === 'vi' ? "Cà phê, Trà & Bánh kẹo (Nhóm 30)" : "Coffee, Tea & Confectionery (Class 30)" },
    { id: 32, label: language === 'vi' ? "Đồ uống không cồn (Nhóm 32)" : "Non-alcoholic beverages (Class 32)" },
    { id: 33, label: language === 'vi' ? "Đồ uống có cồn (Nhóm 33)" : "Alcoholic beverages (Class 33)" },
    { id: 9, label: language === 'vi' ? "Thiết bị điện tử (Nhóm 9)" : "Electronic devices (Class 9)" },
    { id: 5, label: language === 'vi' ? "Y tế & Dược phẩm (Nhóm 5)" : "Medical & Pharma (Class 5)" },
    { id: 25, label: language === 'vi' ? "Thời trang & May mặc (Nhóm 25)" : "Fashion & Apparel (Class 25)" },
    { id: 35, label: language === 'vi' ? "Quảng cáo & Bán lẻ (Nhóm 35)" : "Advertising & Retail (Class 35)" },
    { id: 43, label: language === 'vi' ? "Ăn uống & Lưu trú (Nhóm 43)" : "Dining & Lodging (Class 43)" },
    { id: 44, label: language === 'vi' ? "Y tế & Làm đẹp (Nhóm 44)" : "Medical & Beauty (Class 44)" }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); onSearchChange(searchVal); };

  const currentCategoryLabel = categories.find(c => c.id === selectedClass)?.label || (language === 'vi' ? "Chọn Nhóm hàng..." : "Select Class...");

  return (
    <header className="w-full bg-white text-slate-800 shadow-sm sticky top-0 z-40" id="main-header">
      {/* Top Banner Contact */}
      <div className="w-full bg-slate-900 text-white text-[11px] py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              {t.hotline}: <strong className="text-orange-400">1900 8899</strong> (8:00 - 18:00)
            </span>
            <span className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              Email: <span className="text-gray-300">support@brandhub.vn</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="#about" className="hover:text-white transition-colors">{language === 'vi' ? 'Giới thiệu' : 'About'}</a>
            <span className="text-slate-700">|</span>
            <a href="#news" className="hover:text-white transition-colors">{language === 'vi' ? 'Tin tức SHTT' : 'IP News'}</a>
            <span className="text-slate-700">|</span>
            <a href="#faq" className="hover:text-white transition-colors">{t.faq}</a>
            <span className="text-slate-700">|</span>
            
            {/* Language Selector Pill */}
            <div className="flex bg-slate-800 p-0.5 rounded-full border border-slate-700 items-center">
              <button
                type="button"
                onClick={() => onLanguageChange('vi')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition-all ${language === 'vi' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition-all ${language === 'en' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>
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
          onClick={() => { window.location.hash = '#/home'; onSearchChange(""); onClassSelect(null); onViewModeChange?.('marketplace'); }}
        />

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-4 pr-1.5 items-center gap-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-200">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
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
            {t.registerNew}
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
                title={language === 'vi' ? 'Vào trang quản trị' : 'Go to dashboard'}
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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
            <a 
              href="#/home" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'home' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.home}
            </a>
            <a 
              href="#/catalog" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'catalog' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.catalog}
            </a>
            <a 
              href="#/workflow" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'workflow' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.workflow}
            </a>
            <a 
              href="#/about" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'about' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.whyUs}
            </a>
            <a 
              href="#/faq" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${currentRoute === 'faq' && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.faq}
            </a>
            <a 
              href="#/news" 
              onClick={() => { if(viewMode === 'dashboard') { onViewModeChange?.('marketplace'); } }}
              className={`hover:text-orange-500 transition-colors py-1 border-b-2 hover:border-orange-500 ${(currentRoute === 'news' || currentRoute === 'news-detail') && viewMode !== 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'}`}
            >
              {t.news}
            </a>
            {user && (
              <button
                onClick={() => onViewModeChange?.(viewMode === 'dashboard' ? 'marketplace' : 'dashboard')}
                className={`hover:text-orange-500 transition-colors py-1 border-b-2 font-extrabold uppercase tracking-wider text-[11px] cursor-pointer ${
                  viewMode === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-600'
                }`}
              >
                💼 {language === 'vi' ? 'Trang quản trị' : 'Workspace'}
              </button>
            )}
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
              onChange={(e) => setSearchVal(e.target.value)}
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
            <a href="#/home" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'home' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.home}</a>
            <a href="#/catalog" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'catalog' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.catalog}</a>
            <a href="#/workflow" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'workflow' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.workflow}</a>
            <a href="#/about" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'about' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.whyUs}</a>
            <a href="#/faq" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${currentRoute === 'faq' && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.faq}</a>
            <a href="#/news" onClick={() => { setShowMobileMenu(false); onViewModeChange?.('marketplace'); }} className={`hover:text-orange-500 transition-colors py-1 ${(currentRoute === 'news' || currentRoute === 'news-detail') && viewMode !== 'dashboard' ? 'text-orange-500 border-l-2 border-orange-500 pl-2' : ''}`}>{t.news}</a>
            {user && (
              <button
                onClick={() => { setShowMobileMenu(false); onViewModeChange?.(viewMode === 'dashboard' ? 'marketplace' : 'dashboard'); }}
                className="hover:text-orange-500 transition-colors py-1 text-left font-bold uppercase tracking-wide text-xs cursor-pointer flex items-center gap-1"
              >
                💼 {language === 'vi' ? 'Trang quản trị' : 'Workspace'}
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs mb-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">{language === 'vi' ? 'Đã đăng nhập:' : 'Logged in as:'}</span>
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
              {t.registerNew}
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-1">
              {language === 'vi' ? 'Liên kết cơ sở dữ liệu quốc tế WIPO & Cục SHTT' : 'Linked with international WIPO & NOIP databases'}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
