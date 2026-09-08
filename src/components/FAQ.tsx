import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { MOCK_FAQS } from '../data';

interface ApiValueItem {
  slug: string;
  value: string;
}

interface ApiPageResponse {
  name: string;
  body?: string;
  title?: string | null;
  description?: string | null;
  slug: string;
  values: ApiValueItem[];
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

type TabCategory = 'nguoi-mua' | 'nguoi-ban' | 'van-de-dang-ky';

interface TabConfig {
  key: TabCategory;
  label: string;
  fallbackCat: 'buy' | 'sell' | 'register';
}

const TABS: TabConfig[] = [
  { key: 'nguoi-mua', label: 'Dành cho Người mua', fallbackCat: 'buy' },
  { key: 'nguoi-ban', label: 'Dành cho Người bán (Ký gửi)', fallbackCat: 'sell' },
  { key: 'van-de-dang-ky', label: 'Vấn đề Đăng ký mới', fallbackCat: 'register' }
];

// Helper to strip HTML tags and decode HTML entities for clean question title
function formatQuestionText(raw: string): string {
  if (!raw) return '';
  try {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    return (doc.body.textContent || doc.body.innerText || '').trim();
  } catch {
    return raw.replace(/<[^>]+>/g, '').trim();
  }
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<TabCategory>('nguoi-mua');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<{ name: string; body: string } | null>(null);

  const [faqData, setFaqData] = useState<Record<TabCategory, FaqItem[]>>({
    'nguoi-mua': [],
    'nguoi-ban': [],
    'van-de-dang-ky': []
  });

  const fetchFaqData = async () => {
    setIsLoading(true);
    setError(null);

    const slug = 'brandix-hoi-dap';
    const apiUrl = `https://admin.hdslaw.vn/api/pages/${slug}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
      }

      const data: ApiPageResponse = await res.json();
      
      if (data && data.name) {
        setPageInfo({
          name: data.name,
          body: data.body || 'Mọi thắc mắc về sở hữu trí tuệ, quyền tác giả, chuyển nhượng văn bằng bảo hộ và cách thức thanh toán ký quỹ.'
        });
      }

      const valueMap = new Map<string, string>();
      (data.values || []).forEach(item => {
        if (item && item.slug) {
          valueMap.set(item.slug.trim(), item.value || '');
        }
      });

      const parsedResult: Record<TabCategory, FaqItem[]> = {
        'nguoi-mua': [],
        'nguoi-ban': [],
        'van-de-dang-ky': []
      };

      // Extract question and corresponding answer for each category
      TABS.forEach(tab => {
        const prefix = tab.key;
        const items: Array<{ id: string; num: number; question: string; answer: string }> = [];

        for (const [sKey, qVal] of valueMap.entries()) {
          // Look for slugs starting with ${prefix}-question
          if (sKey.startsWith(`${prefix}-question`)) {
            // Extract suffix, e.g. "1", "2" from "nguoi-mua-question-1"
            const match = sKey.match(new RegExp(`^${prefix}-question(?:-(.+))?$`));
            const suffix = match && match[1] ? match[1] : '';

            // Corresponding answer slug, e.g. "nguoi-mua-answer-1"
            const answerSlug = suffix ? `${prefix}-answer-${suffix}` : `${prefix}-answer`;
            const aVal = valueMap.get(answerSlug) || '';

            const num = parseInt(suffix, 10);
            items.push({
              id: sKey,
              num: isNaN(num) ? 999 : num,
              question: formatQuestionText(qVal),
              answer: aVal
            });
          }
        }

        // Sort questions sequentially by index (question-1, question-2...)
        items.sort((a, b) => a.num - b.num);

        parsedResult[prefix] = items.map(it => ({
          id: it.id,
          question: it.question,
          answer: it.answer
        }));
      });

      setFaqData(parsedResult);

      // Auto expand first question of active tab
      const currentList = parsedResult[activeCategory];
      if (currentList && currentList.length > 0) {
        setExpandedId(currentList[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch FAQ from API, using fallback data:', err);
      setError(err?.message || 'Không thể tải dữ liệu hỏi đáp từ máy chủ.');

      // Fallback to local mock FAQs so the user is never left with an empty screen
      const fallbackResult: Record<TabCategory, FaqItem[]> = {
        'nguoi-mua': MOCK_FAQS.filter(f => f.category === 'buy').map(f => ({ id: f.id, question: f.question, answer: f.answer })),
        'nguoi-ban': MOCK_FAQS.filter(f => f.category === 'sell').map(f => ({ id: f.id, question: f.question, answer: f.answer })),
        'van-de-dang-ky': MOCK_FAQS.filter(f => f.category === 'register').map(f => ({ id: f.id, question: f.question, answer: f.answer }))
      };
      setFaqData(fallbackResult);
      if (fallbackResult[activeCategory]?.length > 0) {
        setExpandedId(fallbackResult[activeCategory][0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqData();
  }, []);

  const handleTabChange = (tabKey: TabCategory) => {
    setActiveCategory(tabKey);
    const list = faqData[tabKey];
    if (list && list.length > 0) {
      setExpandedId(list[0].id);
    } else {
      setExpandedId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const currentFaqs = faqData[activeCategory] || [];

  return (
    <section className="py-20 bg-slate-50 border-t border-b border-slate-100 min-h-[600px]" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/60 px-3.5 py-1 rounded-full text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">
            <span>Hỏi Đáp Pháp Lý & Thương Mại</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-3">
            {pageInfo?.name ? pageInfo.name : 'Giải Đáp Thắc Mắc Thường Gặp'}
          </h2>
          {pageInfo?.body ? (
            <div 
              className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: pageInfo.body }}
            />
          ) : (
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto">
              Mọi thắc mắc về sở hữu trí tuệ, quyền tác giả, chuyển nhượng văn bằng bảo hộ và cách thức thanh toán ký quỹ an toàn.
            </p>
          )}
        </div>

        {/* Tab Categories Filters */}
        <div className="flex flex-wrap sm:flex-nowrap justify-center bg-slate-200/60 p-1.5 rounded-2xl mb-8 max-w-xl mx-auto gap-1">
          {TABS.map((cat) => {
            const count = faqData[cat.key]?.length || 0;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleTabChange(cat.key)}
                className={`flex-1 min-w-[140px] text-center py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-orange-500 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error} Đang hiển thị thông tin dự phòng.</span>
            </div>
            <button
              onClick={fetchFaqData}
              className="inline-flex items-center gap-1 font-bold text-amber-900 hover:underline cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Tải lại
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3.5 py-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-600 mb-4">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span>Đang tải danh sách câu hỏi từ hệ thống Brandix...</span>
            </div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 w-3/4">
                    <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                  </div>
                  <div className="w-4 h-4 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Accordions List */
          <div className="space-y-3.5">
            {currentFaqs.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xs">
                Chưa có câu hỏi nào trong chuyên mục này.
              </div>
            ) : (
              currentFaqs.map((faq, index) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isExpanded
                        ? 'border-orange-200 shadow-md ring-1 ring-orange-500/10'
                        : 'border-slate-100 shadow-xs hover:shadow-sm hover:border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left p-5 sm:p-6 flex justify-between items-start gap-4 cursor-pointer focus:outline-none select-none"
                    >
                      <div className="flex items-start gap-3.5 text-sm sm:text-base font-bold text-slate-800">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-black shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="leading-snug text-slate-900">{faq.question}</span>
                      </div>
                      <div className="text-slate-400 shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-orange-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 border-t border-slate-100/80 leading-relaxed bg-orange-50/20">
                        {faq.answer ? (
                          <div 
                            className="space-y-2 leading-relaxed text-slate-700 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:text-slate-900"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        ) : (
                          <p className="text-slate-400 italic">Nội dung câu trả lời đang được cập nhật.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer help desk notice */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200/60">
          <p className="text-xs text-slate-500">
            Bạn vẫn chưa tìm được câu trả lời mong muốn?{' '}
            <a href="tel:0901727373" className="text-orange-600 hover:underline font-bold">
              Gọi trực tiếp cho Luật sư SHTT Brandix: 0901 727 373 (Miễn phí tư vấn)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

