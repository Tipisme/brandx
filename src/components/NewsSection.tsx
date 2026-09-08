import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  ArrowUpRight, 
  BookOpen, 
  Phone, 
  Send, 
  CheckCircle2, 
  Award, 
  ShieldAlert, 
  FileText, 
  Globe, 
  MessageSquare,
  Facebook,
  Linkedin,
  Copy,
  Check,
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { Language } from '../localization';
import { 
  stripHtmlAndTruncate, 
  getPostImageUrl, 
  fetchNewsPosts, 
  fetchSinglePostBySlug 
} from '../services/newsService';

interface NewsSectionProps {
  language: Language;
  currentPostId: string | null;
  onSelectPost: (id: string | null) => void;
}

export default function NewsSection({
  language,
  currentPostId,
  onSelectPost
}: NewsSectionProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [singlePost, setSinglePost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Quick consult form state
  const [consultPhone, setConsultPhone] = useState('');
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  // Fetch posts for listing view
  useEffect(() => {
    if (!currentPostId) {
      const loadPosts = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const json = await fetchNewsPosts(currentPage);
          if (json && json.data && Array.isArray(json.data)) {
            setPosts(json.data);
            const current_page = json.meta?.current_page ?? json.current_page ?? currentPage;
            const last_page = json.meta?.last_page ?? json.last_page ?? json.meta?.total_pages ?? (json.total && json.per_page ? Math.ceil(json.total / json.per_page) : 1);
            const total = json.meta?.total ?? json.total ?? json.data.length;
            const per_page = json.meta?.per_page ?? json.per_page ?? json.data.length;

            setMeta({
              current_page: Number(current_page) || 1,
              last_page: Number(last_page) || 1,
              total: Number(total) || 0,
              per_page: Number(per_page) || 10
            });
          } else {
            throw new Error('Dữ liệu máy chủ trả về sai định dạng.');
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Lỗi kết nối API Tin Tức.');
        } finally {
          setIsLoading(false);
        }
      };
      loadPosts();
    }
  }, [currentPostId, currentPage]);

  // Fetch single post details for detail view by slug
  useEffect(() => {
    if (currentPostId) {
      const fetchSinglePost = async () => {
        setIsSingleLoading(true);
        setError(null);
        try {
          const json = await fetchSinglePostBySlug(currentPostId);
          if (json && json.data && json.data.length > 0) {
            setSinglePost(json.data[0]);
          } else {
            // Fallback: search in local posts list
            const localFound = posts.find(p => p.slug === currentPostId);
            if (localFound) {
              setSinglePost(localFound);
            } else {
              throw new Error('Bài viết không tồn tại hoặc đã bị gỡ bỏ.');
            }
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Lỗi kết nối nội dung bài viết.');
        } finally {
          setIsSingleLoading(false);
        }
      };
      fetchSinglePost();
    } else {
      setSinglePost(null);
    }
  }, [currentPostId, posts]);

  // Dynamic SEO Updates & JSON-LD Structured Schema.org Injection
  useEffect(() => {
    if (currentPostId && singlePost) {
      const originalTitle = document.title;
      // Set SEO Title
      document.title = `${singlePost.meta_title || singlePost.title} | Cập nhật Pháp Luật Brandix`;
      
      // Update SEO Meta Description
      const metaDesc = document.querySelector('meta[name="description"]');
      const originalMetaDesc = metaDesc?.getAttribute('content') || '';
      const summaryText = singlePost.meta_description || stripHtmlAndTruncate(singlePost.description, 160);
      if (metaDesc) {
        metaDesc.setAttribute('content', summaryText);
      }

      // Append Structured JSON-LD Schema Script
      const scriptId = 'news-article-seo-schema';
      let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      
      const imageUrl = getPostImageUrl(singlePost.featured_image);
      const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": singlePost.title,
        "image": [imageUrl],
        "datePublished": "2026-07-16T00:00:00+07:00",
        "dateModified": "2026-07-16T09:56:44+07:00",
        "author": {
          "@type": "Person",
          "name": "Chuyên gia Pháp lý HDS Law"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Brandix Việt Nam",
          "logo": {
            "@type": "ImageObject",
            "url": "/brandix-logo.jpg"
          }
        },
        "description": summaryText
      };
      
      scriptEl.text = JSON.stringify(schemaMarkup);

      return () => {
        document.title = originalTitle;
        if (metaDesc) {
          metaDesc.setAttribute('content', originalMetaDesc);
        }
        const el = document.getElementById(scriptId);
        if (el) el.remove();
      };
    }
  }, [currentPostId, singlePost]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultPhone.trim()) return;
    
    const savedRequests = JSON.parse(localStorage.getItem('brandhub_consultation_requests') || '[]');
    savedRequests.push({
      phone: consultPhone,
      timestamp: new Date().toISOString(),
      source_slug: currentPostId || 'tin-tuc-page',
      source_title: singlePost?.title || 'Tin Tức'
    });
    localStorage.setItem('brandhub_consultation_requests', JSON.stringify(savedRequests));
    
    setConsultSubmitted(true);
    setConsultPhone('');
    setTimeout(() => setConsultSubmitted(false), 5000);
  };

  const currentPageNum = meta?.current_page || 1;
  const totalPageCount = meta?.last_page || 1;
  const totalArticles = meta?.total || posts.length;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPageCount) return;
    setCurrentPage(page);
    const el = document.getElementById('news-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- RENDERING DETAIL VIEW (Highly Polished SEO Article layout) ---
  if (currentPostId) {
    if (isSingleLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-sm font-medium">
            {language === 'vi' ? 'Đang tải bài viết chi tiết từ API...' : 'Loading news details from production API...'}
          </p>
        </div>
      );
    }

    if (error || !singlePost) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4">
            <p className="text-red-600 font-bold text-sm">
              {language === 'vi' ? 'Không tìm thấy bài viết này trong cơ sở dữ liệu.' : 'Post not found.'}
            </p>
            <button
              onClick={() => onSelectPost(null)}
              className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
            >
              {language === 'vi' ? 'Quay về danh sách tin tức' : 'Back to news list'}
            </button>
          </div>
        </div>
      );
    }

    const detailImage = getPostImageUrl(singlePost.featured_image);
    const readingTime = Math.max(1, Math.ceil((singlePost.description?.length || 1000) / 1000));
    const firstTag = (singlePost.tags && singlePost.tags[0]?.name) || (language === 'vi' ? "Pháp Luật SHTT" : "IP Law");

    return (
      <div className="bg-slate-50 min-h-screen pb-16">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in duration-200" id="news-detail-page">
          
          {/* SEO Structured Breadcrumb Trail */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-semibold" aria-label="Breadcrumb">
            <a href="#/home" className="hover:text-amber-600 transition-colors">
              {language === 'vi' ? 'Trang chủ' : 'Home'}
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <a href="#/news" onClick={() => onSelectPost(null)} className="hover:text-amber-600 transition-colors">
              {language === 'vi' ? 'Tin tức' : 'News'}
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 line-clamp-1 max-w-[200px] sm:max-w-sm">
              {singlePost.title}
            </span>
          </nav>

          {/* Heading block with luxury brand gold border line and serif fonts */}
          <div className="space-y-4 border-l-4 border-[#D4AF37] pl-5 py-2">
            <span className="bg-amber-100/70 text-amber-800 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md">
              {firstTag}
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-slate-900 leading-tight">
              {singlePost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                <User className="w-4 h-4 text-[#D4AF37]" />
                {language === 'vi' ? 'Ban biên tập HDS Law' : 'HDS Law Editor Board'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                16.07.2026
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {readingTime} {language === 'vi' ? 'phút đọc' : 'min read'}
              </span>
            </div>
          </div>

          {/* Centered Main Post Body */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-10 space-y-8 shadow-xs">
            
            {/* Lead Intro text from API if available */}
            {singlePost.meta_description && (
              <p className="font-serif italic text-slate-700 text-sm sm:text-base leading-relaxed border-l-4 border-[#D4AF37] pl-4 py-1.5 bg-amber-50/20 rounded-r-xl">
                {singlePost.meta_description}
              </p>
            )}

            {/* Premium HTML Content Render Container with absolute WYSIWYG reset capability */}
            <div 
              className="blog-content text-slate-700 text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: singlePost.description }} 
            />

            {/* Large high-contrast career or consultation Call To Action button */}
            <div className="mt-12 p-6 sm:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800 relative overflow-hidden shadow-xl text-center space-y-6">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="max-w-2xl mx-auto space-y-3">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                  {language === 'vi' 
                    ? 'Bạn quan tâm đến Cơ hội Hợp tác hay cần Tư vấn Pháp lý?' 
                    : 'Interested in Career Opportunities or need Legal Council?'}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                  {language === 'vi'
                    ? 'Kết nối trực tiếp với đội ngũ Luật sư và Chuyên viên Cao cấp của HDS Law để nhận được phản hồi chính xác và bảo mật trong 24 giờ.'
                    : 'Connect directly with HDS Law partners and advisors to secure high-quality legal support or join our professional team.'}
                </p>
              </div>

              {consultSubmitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 max-w-md mx-auto animate-in zoom-in duration-150">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-white font-bold">{language === 'vi' ? 'Gửi thông tin thành công!' : 'Submission Successful!'}</p>
                  <p className="text-xs text-slate-400 mt-1">{language === 'vi' ? 'HDS Law sẽ liên hệ lại với bạn trong thời gian sớm nhất.' : 'HDS Law board will respond to you shortly.'}</p>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <form onSubmit={handleConsultSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="tel"
                      required
                      placeholder={language === 'vi' ? 'Nhập số điện thoại liên hệ...' : 'Enter phone number...'}
                      value={consultPhone}
                      onChange={(e) => setConsultPhone(e.target.value)}
                      className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-[#D4AF37] hover:bg-[#bfa032] text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-md shrink-0 inline-flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <Send className="w-4 h-4" />
                      {language === 'vi' ? 'Gửi liên hệ ngay' : 'Connect Now'}
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-500 italic">
                    {language === 'vi' 
                      ? '* Thông tin liên hệ của bạn được cam kết bảo mật tuyệt đối theo quy định HDS Law.' 
                      : '* Your contact information remains strictly confidential under HDS Law guidelines.'}
                  </p>
                </div>
              )}
            </div>

            {/* Tags Section from API */}
            {singlePost.tags && singlePost.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  {language === 'vi' ? 'Từ khóa bài viết:' : 'Keywords / Tags:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {singlePost.tags.map((tagObj: any, i: number) => (
                    <span 
                      key={i}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold transition-colors cursor-default"
                    >
                      # {tagObj.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom shares and back controls */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'vi' ? 'Chia sẻ:' : 'Share:'}
                </span>
                
                <button
                  onClick={handleShare}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                  title="Sao chép liên kết"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
                  className="p-2 bg-[#1877F2]/10 text-[#1877F2] rounded-xl hover:bg-[#1877F2]/20 transition-all cursor-pointer"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}
                  className="p-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl hover:bg-[#0A66C2]/20 transition-all cursor-pointer"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 fill-current" />
                </button>
              </div>

              <button
                onClick={() => onSelectPost(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Quay lại danh mục tin tức' : 'Back to News List'}
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // --- RENDERING LIST VIEW WITH PAGINATION ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-12 animate-in fade-in duration-200" id="news-list-section">
      
      {/* Title block */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest block">
          {language === 'vi' ? 'KIẾN THỨC PHÁP LUẬT SHTT' : 'IP LAW KNOWLEDGE'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight">
          {language === 'vi' ? 'Tin tức & Kiến thức Sở Hữu Trí Tuệ' : 'Intellectual Property News & Guides'}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          {language === 'vi' 
            ? 'Cập nhật nhanh nhất các thay đổi quy chế pháp luật, thông tư hướng dẫn của Cục SHTT Việt Nam cùng cẩm nang bảo hộ nhãn hiệu kinh doanh an toàn.'
            : 'Get the latest regulatory amendments, guides from the National Office of Intellectual Property of Vietnam, and guides on safe trademark usage.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-xs font-semibold">{language === 'vi' ? 'Đang kết nối API tin tức từ admin.hdslaw.vn...' : 'Loading news posts from admin.hdslaw.vn...'}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center text-xs text-red-600 font-medium">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500 font-medium">
          {language === 'vi' ? 'Chưa có bài viết nào được đăng tải.' : 'No articles available.'}
        </div>
      ) : (
        <>
          {/* Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((rawPost) => {
              const excerpt = rawPost.meta_description || stripHtmlAndTruncate(rawPost.description, 130);
              const cardImage = getPostImageUrl(rawPost.featured_image);
              const readTime = Math.max(1, Math.ceil((rawPost.description?.length || 1000) / 1000));
              const categoryName = (rawPost.tags && rawPost.tags[0]?.name) || (language === 'vi' ? "Pháp Luật SHTT" : "IP Law");

              return (
                <div 
                  key={rawPost.slug} 
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all flex flex-col justify-between min-h-[380px] h-full group cursor-pointer"
                  onClick={() => onSelectPost(rawPost.slug)}
                >
                  <div>
                    {/* Image top - rendered only if cardImage is present */}
                    {cardImage ? (
                      <div className="w-full h-48 overflow-hidden relative shrink-0">
                        <img
                          src={cardImage}
                          alt={rawPost.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {categoryName}
                        </span>
                      </div>
                    ) : (
                      /* Minimal elegant top border line for image-less premium articles */
                      <div className="h-2 w-full bg-[#D4AF37]" />
                    )}

                    {/* Content body text */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {!cardImage && (
                          <span className="bg-amber-100/70 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                            {categoryName}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-bold block">
                          16.07.2026 • {readTime} {language === 'vi' ? 'phút đọc' : 'min read'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                        {rawPost.title}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-4">
                        {excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">{language === 'vi' ? 'HDS Law Team' : 'HDS Law Panel'}</span>
                    <span className="text-amber-600 font-black group-hover:underline inline-flex items-center gap-1.5">
                      {language === 'vi' ? 'Đọc chi tiết' : 'Read details'}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls driven by meta data */}
          {totalPageCount > 1 && (
            <div className="flex flex-col items-center justify-center gap-3 pt-10 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPageNum <= 1}
                  onClick={() => handlePageChange(currentPageNum - 1)}
                  className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white shadow-2xs"
                  title="Trang trước"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const range: (number | string)[] = [];
                  const siblingCount = 1;

                  const leftSiblingIndex = Math.max(currentPageNum - siblingCount, 1);
                  const rightSiblingIndex = Math.min(currentPageNum + siblingCount, totalPageCount);

                  const shouldShowLeftDots = leftSiblingIndex > 2;
                  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

                  range.push(1);

                  if (shouldShowLeftDots) {
                    range.push("...");
                  } else if (leftSiblingIndex > 1) {
                    for (let i = 2; i < leftSiblingIndex; i++) {
                      range.push(i);
                    }
                  }

                  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                    if (i !== 1 && i !== totalPageCount) {
                      range.push(i);
                    }
                  }

                  if (shouldShowRightDots) {
                    range.push("...");
                  } else if (rightSiblingIndex < totalPageCount) {
                    for (let i = rightSiblingIndex + 1; i < totalPageCount; i++) {
                      range.push(i);
                    }
                  }

                  if (totalPageCount > 1) {
                    range.push(totalPageCount);
                  }

                  return range.map((pageNum, idx) => {
                    if (pageNum === "...") {
                      return (
                        <span key={`dots-${idx}`} className="text-slate-300 px-1.5 text-xs font-bold">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          currentPageNum === pageNum
                            ? 'bg-amber-600 text-white shadow-md scale-105'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}

                <button
                  disabled={currentPageNum >= totalPageCount}
                  onClick={() => handlePageChange(currentPageNum + 1)}
                  className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white shadow-2xs"
                  title="Trang sau"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-medium text-slate-400">
                {language === 'vi' 
                  ? `Hiển thị trang ${currentPageNum} / ${totalPageCount} (${totalArticles} bài viết)`
                  : `Showing page ${currentPageNum} of ${totalPageCount} (${totalArticles} articles)`}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
