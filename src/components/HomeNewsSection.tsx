import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Language } from '../localization';
import { 
  fetchNewsPosts, 
  getPostImageUrl, 
  stripHtmlAndTruncate 
} from '../services/newsService';

interface HomeNewsSectionProps {
  language: Language;
}

export default function HomeNewsSection({ language }: HomeNewsSectionProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadHomeNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchNewsPosts(1);
        if (isMounted) {
          if (json && json.data && Array.isArray(json.data)) {
            // Take top 3 articles for home page showcase
            setPosts(json.data.slice(0, 3));
          } else {
            setPosts([]);
          }
        }
      } catch (err: any) {
        console.error("Home news fetch error:", err);
        if (isMounted) {
          setError(err.message || 'Không thể tải tin tức mới nhất.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHomeNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-white" id="news">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">
            {language === 'vi' ? 'Cập Nhật Pháp Luật' : 'Legal Updates'}
          </span>
          <h2 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight mb-4">
            {language === 'vi' 
              ? 'Tin Tức & Kiến Thức Sở Hữu Trí Tuệ Mới Nhất' 
              : 'Latest Intellectual Property News & Insights'}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'vi'
              ? 'Học hỏi các kiến thức thực tế về cách khai thác bản quyền thương mại và phòng tránh rủi ro pháp lý thương hiệu.'
              : 'Learn practical knowledge on commercial copyright exploitation and avoiding brand legal risks.'}
          </p>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-slate-50 border border-slate-100 rounded-3xl p-5 h-[400px] flex flex-col justify-between animate-pulse"
              >
                <div className="space-y-4">
                  <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                  <div className="w-1/3 h-4 bg-slate-200 rounded" />
                  <div className="w-full h-6 bg-slate-200 rounded" />
                  <div className="w-4/5 h-6 bg-slate-200 rounded" />
                  <div className="w-full h-12 bg-slate-100 rounded" />
                </div>
                <div className="w-1/2 h-4 bg-slate-200 rounded pt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center text-xs text-red-600 font-medium max-w-md mx-auto">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-500 font-medium">
            {language === 'vi' ? 'Chưa có bài viết mới nào.' : 'No new articles.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((rawPost) => {
                const excerpt = rawPost.meta_description || stripHtmlAndTruncate(rawPost.description, 130);
                const cardImage = getPostImageUrl(rawPost.featured_image);
                const readTime = Math.max(1, Math.ceil((rawPost.description?.length || 1000) / 1000));
                const categoryName = (rawPost.tags && rawPost.tags[0]?.name) || (language === 'vi' ? "Pháp Luật SHTT" : "IP Law");
                const postSlug = rawPost.slug || rawPost.id;

                return (
                  <div
                    key={postSlug}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all flex flex-col justify-between min-h-[410px] h-full group cursor-pointer"
                    onClick={() => {
                      window.location.hash = `#/news/${postSlug}`;
                    }}
                  >
                    <div>
                      {/* Image header */}
                      {cardImage ? (
                        <div className="w-full h-48 overflow-hidden relative shrink-0">
                          <img
                            src={cardImage}
                            alt={rawPost.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                            {categoryName}
                          </span>
                        </div>
                      ) : (
                        <div className="h-2 w-full bg-[#D4AF37]" />
                      )}

                      {/* Content Body */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {!cardImage && (
                            <span className="bg-amber-100/70 text-amber-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {categoryName}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold block">
                            {readTime} {language === 'vi' ? 'phút đọc' : 'min read'}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                          {rawPost.title}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="p-5 pt-0 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">
                        {language === 'vi' ? 'Đăng bởi chuyên gia SHTT' : 'By IP Experts'}
                      </span>
                      <span className="text-amber-600 font-bold group-hover:underline inline-flex items-center gap-1">
                        {language === 'vi' ? 'Đọc thêm' : 'Read more'}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <a
                href="#/news"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-7 py-3.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {language === 'vi' ? 'Xem tất cả tin tức & bài viết' : 'View All News & Articles'}
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
