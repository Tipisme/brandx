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
import { ShieldCheck, Zap, Handshake, Star, ArrowUpRight, HelpCircle, Phone, Sparkles } from 'lucide-react';
import { Language } from './localization';
import { fetchNiceClasses } from './services/niceClasses';

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

  const [dashboardInitialTab, setDashboardInitialTab] = useState<'profile' | 'trademarks' | 'cases' | 'files' | 'settings' | 'support'>('profile');
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
    const handleHashChange = () => {
      const rawHash = window.location.hash || '#/';
      const [hashBase, hashQuery] = rawHash.split('?');
      const hash = hashBase;
      const pathname = window.location.pathname;

      if (hashQuery) {
        const queryParams = new URLSearchParams(hashQuery);
        const searchQ = queryParams.get('q') || queryParams.get('search');
        if (searchQ) {
          setSearchKeyword(searchQ);
        }
      }

      const pathSegments = pathname.split('/').filter(Boolean);
      const hashSegments = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

      const findParams = (segments: string[]) => {
        // Check for 'reset-password' in the URL segments followed by email and token
        const resetIdx = segments.indexOf('reset-password');
        if (resetIdx !== -1 && segments.length > resetIdx + 2) {
          const email = decodeURIComponent(segments[resetIdx + 1]);
          const token = segments[resetIdx + 2];
          if (email.includes('@') && token && token.length >= 10) {
            return { email, token };
          }
        }

        // Fallback search for any segment containing '@' followed by a token
        for (let i = 0; i < segments.length - 1; i++) {
          const seg = segments[i];
          if (seg.includes('@')) {
            const email = decodeURIComponent(seg);
            const token = segments[i + 1];
            if (token && token.length >= 10) {
              return { email, token };
            }
          }
        }
        return null;
      };

      const resetParams = findParams(pathSegments) || findParams(hashSegments);

      if (resetParams) {
        setCurrentRoute('reset-password');
        setResetEmail(resetParams.email);
        setResetToken(resetParams.token);
        setActiveSlug(null);
        setActivePostId(null);
        return;
      }

      if (hash === '#/' || hash === '#/home' || hash === '#home') {
        setCurrentRoute('home');
        setActiveSlug(null);
        setActivePostId(null);
      } else if (hash === '#/catalog' || hash === '#catalog') {
        setCurrentRoute('catalog');
        setActiveSlug(null);
        setActivePostId(null);
      } else if (hash.startsWith('#/catalog/') || hash.startsWith('#catalog/')) {
        setCurrentRoute('catalog-detail');
        const parts = hash.split('/');
        const slug = parts[parts.length - 1];
        setActiveSlug(slug);
        setActivePostId(null);
      } else if (hash === '#/news' || hash === '#news') {
        setCurrentRoute('news');
        setActiveSlug(null);
        setActivePostId(null);
      } else if (hash.startsWith('#/news/') || hash.startsWith('#news/')) {
        setCurrentRoute('news-detail');
        const parts = hash.split('/');
        const postId = parts[parts.length - 1];
        setActivePostId(postId);
        setActiveSlug(null);
      } else if (hash === '#/workflow' || hash === '#workflow') {
        setCurrentRoute('workflow');
        setActiveSlug(null);
        setActivePostId(null);
      } else if (hash === '#/about' || hash === '#/why-brandhub' || hash === '#why-brandhub' || hash === '#about' || hash === '#/ve-chung-toi' || hash === '#ve-chung-toi') {
        setCurrentRoute('about');
        setActiveSlug(null);
        setActivePostId(null);
      } else if (hash === '#/faq' || hash === '#faq' || hash === '#/hoi-dap' || hash === '#hoi-dap') {
        setCurrentRoute('faq');
        setActiveSlug(null);
        setActivePostId(null);
      } else {
        setCurrentRoute('home');
        setActiveSlug(null);
        setActivePostId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    // Also listen to popstate changes (back/forward or pushState changes)
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
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
            window.location.hash = '#/catalog';
          }
          if (viewMode !== 'marketplace') {
            setViewMode('marketplace');
          }
        }}
        onClassSelect={(cls) => {
          setSelectedClass(cls);
          if (currentRoute !== 'catalog') {
            setCurrentRoute('catalog');
            window.location.hash = '#/catalog';
          }
          if (viewMode !== 'marketplace') {
            setViewMode('marketplace');
          }
        }}
        onOpenWizard={handleOpenWizard}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={favorites.length}
        selectedClass={selectedClass}
        onOpenLogin={() => setIsLoginOpen(true)}
        user={user}
        onLogout={() => {
          setUser(null);
          localStorage.removeItem('brandhub_user');
          localStorage.removeItem('brandhub_token');
          setViewMode('marketplace');
        }}
        language={language}
        onLanguageChange={setLanguage}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          if (!user && mode === 'dashboard') {
            setIsLoginOpen(true);
          } else {
            setViewMode(mode);
          }
        }}
        currentRoute={currentRoute}
      />

      {viewMode === 'dashboard' && user ? (
        <UserDashboard
          user={user}
          language={language}
          initialTab={dashboardInitialTab}
          onLogout={() => {
            setUser(null);
            localStorage.removeItem('brandhub_user');
            localStorage.removeItem('brandhub_token');
            setViewMode('marketplace');
          }}
          onCloseDashboard={() => setViewMode('marketplace')}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('brandhub_user', JSON.stringify(updatedUser));
          }}
        />
      ) : (
        <>
          {currentRoute === 'reset-password' && (
            <ResetPasswordPage
              email={resetEmail}
              token={resetToken}
              language={language}
              onBackToLogin={() => {
                window.history.pushState({}, '', '/');
                window.location.hash = '#/home';
                setIsLoginOpen(true);
              }}
            />
          )}

          {currentRoute === 'home' && (
            <>
              {/* 2. Hero Section */}
              <Hero
                onScrollToCatalog={() => { window.location.hash = '#/catalog'; }}
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
        onClose={() => {
          setIsLoginOpen(false);
          setPendingOpenWizard(false);
          setPendingOpenNegotiation(false);
        }}
        onLoginSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem('brandhub_user', JSON.stringify(userData));
          if (userData.token) {
            localStorage.setItem('brandhub_token', userData.token);
          }
          if (pendingOpenWizard) {
            setPendingOpenWizard(false);
            setIsWizardOpen(true);
          } else if (pendingOpenNegotiation) {
            setPendingOpenNegotiation(false);
            setIsNegotiationOpen(true);
          } else {
            setViewMode('dashboard');
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
