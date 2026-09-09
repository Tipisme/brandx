import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutPage from './components/AboutPage';
import Workflow from './components/Workflow';
import TrademarkList from './components/TrademarkList';
import TrademarkModal from './components/TrademarkModal';
import RegistrationWizard from './components/RegistrationWizard';
import CartDrawer from './components/CartDrawer';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import UserDashboard from './components/UserDashboard';
import TrademarkDetailPage from './components/TrademarkDetailPage';
import NewsSection from './components/NewsSection';
import HomeNewsSection from './components/HomeNewsSection';
import ResetPasswordPage from './components/ResetPasswordPage';
import DocxModalViewer from './components/DocxModalViewer';
import NegotiationModal from './components/NegotiationModal';
import { MOCK_TRADEMARKS, MOCK_BLOGS, MOCK_REVIEWS } from './data';
import { Trademark } from './types';
import { ShieldCheck, Zap, Handshake, Star, ArrowUpRight, HelpCircle, Phone, Sparkles, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from './localization';
import { fetchNiceClasses } from './services/niceClasses';
import {
  parseCurrentLocation,
  navigateTo,
  saveLoginRedirect,
  getSavedLoginRedirect,
  clearSavedLoginRedirect,
  AdminTab,
  getAdminTabPath,
  getAdminTabLabel
} from './utils/routes';

export default function App() {
  // Application State managers
  const [selectedTrademark, setSelectedTrademark] = useState<Trademark | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [pendingOpenWizard, setPendingOpenWizard] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [pendingOpenNegotiation, setPendingOpenNegotiation] = useState(false);
  const [negotiationSlug, setNegotiationSlug] = useState<string | null>(null);
  const [negotiationName, setNegotiationName] = useState<string | undefined>(undefined);
  const [negotiationPrice, setNegotiationPrice] = useState<number | string>(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; token?: string } | null>(() => {
    const savedUser = localStorage.getItem('brandhub_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse brandhub_user', e);
      }
    }
    return null;
  });

  const [dashboardInitialTab, setDashboardInitialTab] = useState<AdminTab>('profile');
  const [loginRedirectNotice, setLoginRedirectNotice] = useState<string>('');
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState('chinh-sach-bao-mat');

  const handleOpenPolicy = (docId: string = 'chinh-sach-bao-mat') => {
    setSelectedPolicyId(docId);
    setPolicyModalOpen(true);
  };

  const handleOpenWizard = () => {
    if (!user) {
      setPendingOpenWizard(true);
      setIsLoginOpen(true);
    } else {
      setIsWizardOpen(true);
    }
  };

  const handleOpenNegotiation = (slug: string, trademarkName?: string, price?: number | string) => {
    setNegotiationSlug(slug);
    setNegotiationName(trademarkName);
    setNegotiationPrice(price || 0);
    if (!user) {
      setPendingOpenNegotiation(true);
      setIsLoginOpen(true);
    } else {
      setIsNegotiationOpen(true);
    }
  };

  const handleNegotiationSuccess = () => {
    setIsNegotiationOpen(false);
    setDashboardInitialTab('cases');
    setViewMode('dashboard');
    navigateTo('/quan-tri/quan-ly-yeu-cau');
  };

  const handleRegistrationSuccess = (orderData: any) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('brandhub_orders') || '[]');
      const newOrder = {
        id: orderData.slug || `REQ-${Date.now()}`,
        clientName: user?.name || orderData.name || 'Khách hàng',
        trademarkName: orderData.brandName || orderData.name || 'Nhãn hiệu mới',
        status: 'pending',
        serviceType: 'Đăng ký nhãn hiệu',
        createdAt: new Date().toISOString(),
        amount: orderData.total?.formatted || '1.500.000 ₫',
        slug: orderData.slug,
        ...orderData
      };
      localStorage.setItem('brandhub_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch (e) {
      console.error('Error saving order', e);
    }

    setIsWizardOpen(false);
    setDashboardInitialTab('cases');
    setViewMode('dashboard');
    navigateTo('/quan-tri/quan-ly-yeu-cau');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brandhub_user');
    localStorage.removeItem('brandhub_token');
    clearSavedLoginRedirect();
    setLoginRedirectNotice('');
    setViewMode('marketplace');
    navigateTo('/');
  };
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>('vi');
  const [niceClasses, setNiceClasses] = useState<Record<number, { name: string; desc: string }>>({});

  useEffect(() => {
    let active = true;
    fetchNiceClasses(language).then((data) => {
      if (active) {
        setNiceClasses(data);
      }
    });
    return () => {
      active = false;
    };
  }, [language]);

  const [viewMode, setViewMode] = useState<'marketplace' | 'dashboard'>(() => {
    const savedUser = localStorage.getItem('brandhub_user');
    return savedUser ? 'dashboard' : 'marketplace';
  });
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  useEffect(() => {
    const syncRouteFromUrl = () => {
      const parsed = parseCurrentLocation();

      if (parsed.searchQuery) {
        setSearchKeyword(parsed.searchQuery);
      }

      if (parsed.route === 'reset-password' && parsed.resetEmail && parsed.resetToken) {
        setCurrentRoute('reset-password');
        setResetEmail(parsed.resetEmail);
        setResetToken(parsed.resetToken);
        setActiveSlug(null);
        setActivePostId(null);
        setViewMode('marketplace');
        return;
      }

      if (parsed.route === 'dashboard') {
        const tab = parsed.adminTab || 'profile';
        setDashboardInitialTab(tab);
        setViewMode('dashboard');
        setCurrentRoute('dashboard');
        setActiveSlug(null);
        setActivePostId(null);

        // Check if user is logged in
        const storedUser = localStorage.getItem('brandhub_user');
        if (!storedUser) {
          const tabLabel = getAdminTabLabel(tab, language);
          saveLoginRedirect(parsed.path, tab, tabLabel);
          setLoginRedirectNotice(`Vui lòng đăng nhập để truy cập: ${tabLabel}`);
          setIsLoginOpen(true);
        }
        return;
      }

      setViewMode('marketplace');
      setCurrentRoute(parsed.route);
      setActiveSlug(parsed.slug || null);
      setActivePostId(parsed.postId || null);
    };

    syncRouteFromUrl();
    window.addEventListener('hashchange', syncRouteFromUrl);
    window.addEventListener('popstate', syncRouteFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromUrl);
      window.removeEventListener('popstate', syncRouteFromUrl);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  const [favoriteTrademarks, setFavoriteTrademarks] = useState<any[]>([]);

  // Favorites / Interest wishlist actions
  const handleToggleFavorite = (id: string, fullTm?: any) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fId) => fId !== id));
      setFavoriteTrademarks(favoriteTrademarks.filter((o) => o.id !== id));
    } else {
      setFavorites([...favorites, id]);
      if (fullTm) {
        setFavoriteTrademarks([...favoriteTrademarks, fullTm]);
      } else {
        const mockItem = MOCK_TRADEMARKS.find((m) => m.id === id);
        if (mockItem) {
          setFavoriteTrademarks([...favoriteTrademarks, mockItem]);
        } else {
          setFavoriteTrademarks([...favoriteTrademarks, {
            id,
            name: `Nhãn hiệu #${id}`,
            price: 0,
            applicationNo: `VN4${id}`,
            logoBg: "from-slate-700 to-slate-900"
          }]);
        }
      }
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((fId) => fId !== id));
    setFavoriteTrademarks(favoriteTrademarks.filter((o) => o.id !== id));
  };

  // Get active bookmarked trademarks
  const savedTrademarks = favoriteTrademarks;

  // Quick action: scroll down to catalog listing
  const handleScrollToCatalog = () => {
    const catalogSec = document.getElementById('catalog');
    if (catalogSec) {
      catalogSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white" id="main-app">
      
      {/* 1. Header Navigation */}
      <Header
        searchKeyword={searchKeyword}
        onSearchChange={(keyword) => {
          setSearchKeyword(keyword);
          if (currentRoute !== 'catalog') {
            setCurrentRoute('catalog');
            navigateTo('/catalog');
          }
          if (viewMode !== 'marketplace') {
            setViewMode('marketplace');
          }
        }}
        onClassSelect={(cls) => {
          setSelectedClass(cls);
          if (currentRoute !== 'catalog') {
            setCurrentRoute('catalog');
            navigateTo('/catalog');
          }
          if (viewMode !== 'marketplace') {
            setViewMode('marketplace');
          }
        }}
        onOpenWizard={handleOpenWizard}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={favorites.length}
        selectedClass={selectedClass}
        onOpenLogin={(redirectTarget) => {
          if (redirectTarget) {
            saveLoginRedirect(redirectTarget.path, redirectTarget.tab, redirectTarget.label);
            if (redirectTarget.label) {
              setLoginRedirectNotice(`Vui lòng đăng nhập để truy cập: ${redirectTarget.label}`);
            }
          } else {
            setLoginRedirectNotice('');
          }
          setIsLoginOpen(true);
        }}
        user={user}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={setLanguage}
        viewMode={viewMode}
        adminTab={dashboardInitialTab}
        onNavigate={(path) => {
          navigateTo(path);
        }}
        onViewModeChange={(mode) => {
          if (mode === 'dashboard') {
            if (!user) {
              const tab = dashboardInitialTab || 'profile';
              const tabLabel = getAdminTabLabel(tab, language);
              saveLoginRedirect(getAdminTabPath(tab), tab, tabLabel);
              setLoginRedirectNotice(`Vui lòng đăng nhập để truy cập: ${tabLabel}`);
              setIsLoginOpen(true);
            } else {
              setViewMode('dashboard');
              navigateTo(getAdminTabPath(dashboardInitialTab || 'profile'));
            }
          } else {
            setViewMode('marketplace');
            navigateTo('/');
          }
        }}
        currentRoute={currentRoute}
      />

      {viewMode === 'dashboard' ? (
        user ? (
          <UserDashboard
            user={user}
            language={language}
            initialTab={dashboardInitialTab}
            activeTab={dashboardInitialTab}
            onTabChange={(tab) => {
              setDashboardInitialTab(tab);
              navigateTo(getAdminTabPath(tab));
            }}
            onLogout={handleLogout}
            onCloseDashboard={() => {
              setViewMode('marketplace');
              navigateTo('/');
            }}
            onUserUpdate={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('brandhub_user', JSON.stringify(updatedUser));
            }}
          />
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 bg-slate-50/50">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xs text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">
                  {language === 'vi' ? 'Yêu cầu đăng nhập quản trị' : 'Workspace Login Required'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'vi'
                    ? `Bạn đang truy cập mục "${getAdminTabLabel(dashboardInitialTab, 'vi')}". Vui lòng đăng nhập tài khoản để xem và quản lý dữ liệu.`
                    : `You are accessing "${getAdminTabLabel(dashboardInitialTab, 'en')}". Please log in to view and manage your data.`}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const tabLabel = getAdminTabLabel(dashboardInitialTab, language);
                    saveLoginRedirect(getAdminTabPath(dashboardInitialTab), dashboardInitialTab, tabLabel);
                    setLoginRedirectNotice(`Vui lòng đăng nhập để truy cập: ${tabLabel}`);
                    setIsLoginOpen(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{language === 'vi' ? 'Đăng nhập ngay' : 'Log In Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setViewMode('marketplace');
                    navigateTo('/');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'vi' ? 'Về trang chủ' : 'Back to Home'}</span>
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {currentRoute === 'reset-password' && (
            <ResetPasswordPage
              email={resetEmail}
              token={resetToken}
              language={language}
              onBackToLogin={() => {
                navigateTo('/');
                setIsLoginOpen(true);
              }}
            />
          )}

          {currentRoute === 'home' && (
            <>
              {/* 2. Hero Section */}
              <Hero
                onScrollToCatalog={() => { navigateTo('/catalog'); }}
                onOpenSellRequest={handleOpenWizard}
              />

              {/* 7. Stats Counter Block Row */}
              <section className="bg-slate-900 text-white py-14 border-t border-b border-slate-800" id="stats-block">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  <div className="space-y-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white block">368+</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Cơ sở dữ liệu nhãn hiệu gốc</span>
                  </div>
                  <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-slate-800 py-6 sm:py-0">
                    <span className="text-4xl font-extrabold tracking-tight text-orange-500 block">16+ Năm</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Đại diện sở hữu trí tuệ</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white block">1,100+</span>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Doanh nghiệp đã đồng hành</span>
                  </div>
                </div>
              </section>

              {/* 10. Reviews Testimonials Slider */}
              <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="testimonials">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">Đánh Giá Từ Khách Hàng</span>
                    <h2 className="text-3xl font-sans font-extrabold tracking-tight mb-4">
                      Hơn 1,100 Doanh Nghiệp Đã Đồng Hành Cùng Brandix
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Xem nhận định từ những CEO, Quản lý thương hiệu và Nhà sáng lập đã giao dịch thành công tại Brandix Việt Nam.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {MOCK_REVIEWS.map((rev) => (
                      <div key={rev.id} className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full hover:border-slate-700 transition-colors">
                        <div>
                          {/* Rating Stars */}
                          <div className="flex gap-1 mb-4 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>

                          {/* Review Content */}
                          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 italic">
                            "{rev.content}"
                          </p>
                        </div>

                        {/* Author Info */}
                        <div className="flex items-center gap-3.5 pt-4 border-t border-slate-800/60">
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <strong className="text-xs font-bold text-white block">{rev.author}</strong>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{rev.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 11. Latest News / Blogs Section calling API */}
              <HomeNewsSection language={language} />
            </>
          )}

          {currentRoute === 'catalog' && (
            /* 6. Dynamic Sàn Giao Dịch Trademarks Catalog */
            <TrademarkList
              onSelectTrademark={(tm) => {
                window.location.hash = `#/catalog/${tm.slug}`;
              }}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              selectedClass={selectedClass}
              onClassSelect={setSelectedClass}
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
              language={language}
              niceClasses={niceClasses}
              onRequestRegistration={handleOpenWizard}
            />
          )}

          {currentRoute === 'catalog-detail' && activeSlug && (
            /* Single blade / Detail component calling product API */
            <TrademarkDetailPage
              slug={activeSlug}
              language={language}
              onBack={() => { window.location.hash = '#/catalog'; }}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              onRequestRegistration={handleOpenWizard}
              user={user}
              onOpenNegotiation={handleOpenNegotiation}
            />
          )}

          {(currentRoute === 'news' || currentRoute === 'news-detail') && (
            /* News screen list view with pagination + news detail */
            <NewsSection
              language={language}
              currentPostId={activePostId}
              onSelectPost={(id) => {
                if (id) {
                  window.location.hash = `#/news/${id}`;
                } else {
                  window.location.hash = `#/news`;
                }
              }}
            />
          )}

          {currentRoute === 'workflow' && (
            <>
              {/* 4. Interactive Transaction Workflow */}
              <Workflow />

              {/* 8. CTA Banner: Want to Register? */}
              <section className="py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white relative overflow-hidden" id="cta-banner">
                {/* Background textures */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  <div className="lg:col-span-8 space-y-4">
                    <span className="bg-white/10 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest inline-block border border-white/20">
                      Bạn Muốn Sở Hữu Nhãn Hiệu Riêng Theo Tên Cá Nhân?
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight leading-tight">
                      Bỏ Qua Quy Trình Đăng Ký Chờ Đợi Trùng Lắp Phức Tạp
                    </h2>
                    <p className="text-orange-50 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Hãy gửi cho chúng tôi tên nhãn hiệu và ý tưởng của bạn. Brandix sẽ tra cứu chuyên sâu trên hệ thống cơ sở dữ liệu ngầm và nộp đơn bảo hộ độc quyền tốc hành chỉ trong 24 giờ.
                    </p>
                  </div>
                  <div className="lg:col-span-4 lg:text-right">
                    <button
                      onClick={handleOpenWizard}
                      className="bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs uppercase px-8 py-4 rounded-xl shadow-lg transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      Đăng ký ngay bảo hộ thương hiệu
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {currentRoute === 'about' && (
            <AboutPage 
              language={language} 
              onOpenWizard={handleOpenWizard} 
            />
          )}

          {currentRoute === 'faq' && (
            /* 12. FAQ Section */
            <FAQ />
          )}

          {/* 13. Footer Section */}
          <Footer onOpenPolicy={handleOpenPolicy} />

          {/* Floating Interactive Widget Contacts */}
          <div className="fixed bottom-6 left-6 z-40 hidden sm:flex flex-col gap-3" id="floating-widgets">
            {/* Support hotline action */}
            <a
              href="tel:0901727373"
              className="bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:-translate-y-1 transition-all group relative cursor-pointer"
              title="Gọi Hotline hỗ trợ Brandix"
            >
              <Phone className="w-5 h-5 animate-bounce" />
              <span className="absolute left-full ml-3 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                Hotline SHTT: 0901727373
              </span>
            </a>
          </div>
        </>
      )}

      {/* 14. Modals Overlays Container */}
      <DocxModalViewer
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialDocId={selectedPolicyId}
      />

      <TrademarkModal
        trademark={selectedTrademark}
        onClose={() => setSelectedTrademark(null)}
        onAddToInterest={handleToggleFavorite}
        isInterested={selectedTrademark ? favorites.includes(selectedTrademark.id) : false}
        niceClasses={niceClasses}
        language={language}
      />

      <RegistrationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        niceClasses={niceClasses}
        language={language}
        user={user}
        onSuccess={handleRegistrationSuccess}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        savedTrademarks={savedTrademarks}
        onRemoveTrademark={handleRemoveFavorite}
      />

      <LoginModal
        isOpen={isLoginOpen}
        redirectNotice={loginRedirectNotice}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginRedirectNotice('');
          setPendingOpenWizard(false);
          setPendingOpenNegotiation(false);
        }}
        onLoginSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('brandhub_user', JSON.stringify(userData));
          if (userData.token) {
            localStorage.setItem('brandhub_token', userData.token);
          }
          setLoginRedirectNotice('');
          if (pendingOpenWizard) {
            setPendingOpenWizard(false);
            setIsWizardOpen(true);
          } else if (pendingOpenNegotiation) {
            setPendingOpenNegotiation(false);
            setIsNegotiationOpen(true);
          } else {
            const savedRedirect = getSavedLoginRedirect();
            if (savedRedirect && savedRedirect.path) {
              clearSavedLoginRedirect();
              setViewMode('dashboard');
              if (savedRedirect.tab) {
                setDashboardInitialTab(savedRedirect.tab);
              }
              navigateTo(savedRedirect.path);
            } else {
              setViewMode('dashboard');
              setDashboardInitialTab('profile');
              navigateTo('/quan-tri/ca-nhan-to-chuc');
            }
          }
        }}
      />

      {negotiationSlug && (
        <NegotiationModal
          isOpen={isNegotiationOpen}
          onClose={() => setIsNegotiationOpen(false)}
          slug={negotiationSlug}
          trademarkName={negotiationName}
          initialPrice={negotiationPrice}
          language={language}
          user={user}
          onSuccess={handleNegotiationSuccess}
        />
      )}
    </div>
  );
}
