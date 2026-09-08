import React, { useState, useEffect } from 'react';
import { fetchPageBySlug, ApiPageResponse } from '../services/pageService';
import { decodeHtmlEntities } from './WhyUs';

interface ComparisonSectionProps {
  pageData?: ApiPageResponse | null;
  slug?: string;
  language?: 'vi' | 'en';
  onOpenWizard?: () => void;
}

export default function ComparisonSection({
  pageData: propPageData,
  slug = 'brandix-about',
  language = 'vi',
  onOpenWizard
}: ComparisonSectionProps) {
  const [dataMap, setDataMap] = useState<Map<string, string>>(new Map());

  // If pageData is supplied from parent, populate dataMap directly
  useEffect(() => {
    if (!propPageData || !propPageData.values) return;
    const map = new Map<string, string>();
    propPageData.values.forEach(v => {
      map.set(v.slug, v.value);
    });
    setDataMap(map);
  }, [propPageData]);

  // Only fetch internally if propPageData was NOT passed
  useEffect(() => {
    if (propPageData !== undefined) return; // Managed by parent, skip internal fetch!

    let isMounted = true;
    fetchPageBySlug(slug, language)
      .then((data: ApiPageResponse) => {
        if (!isMounted || !data?.values) return;
        const map = new Map<string, string>();
        data.values.forEach(v => {
          map.set(v.slug, v.value);
        });
        setDataMap(map);
      })
      .catch((err) => {
        console.warn('ComparisonSection fetch failed, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [propPageData, slug, language]);

  // Helper to render WYSIWYG html or fallback
  const renderItem = (key: string, fallback: string) => {
    const raw = dataMap.get(key);
    if (!raw) return fallback;
    return (
      <span 
        className="[&_p]:m-0 [&_p]:inline"
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  };

  return (
    <section className="py-20 bg-slate-50" id="comparison-block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">
            Đặc Quyền Thời Gian
          </span>
          <h2 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight mb-4">
            Sở Hữu Nhãn Hiệu Trong Vài Ngày, Thay Vì Chờ Đợi 2 Năm
          </h2>
          <p className="text-slate-600 text-sm">
            Xem bảng so sánh trực quan về thời gian, chi phí và mức độ rủi ro giữa việc mua lại nhãn hiệu có sẵn và đăng ký mới.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Box 1: Pre-registered Brand via Brandix */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between border-t-4 border-orange-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-extrabold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1 rounded-full uppercase tracking-wider">
                  Sở hữu ngay nhãn hiệu đã bảo hộ
                </span>
                <span className="text-xs text-emerald-400 font-bold">Phương án Tối ưu</span>
              </div>

              <h3 className="text-xl font-bold mb-4">Mua nhãn hiệu có sẵn qua Brandix</h3>
              
              <div className="space-y-4 text-xs mt-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Thời gian cấp bằng:
                  </span>
                  <strong className="text-emerald-400 text-sm text-right">
                    {renderItem('mua-nhan-hieu-thoi-gian-cap-bang', 'Sở hữu ngay trong 3 - 5 ngày')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Tỷ lệ thành công pháp lý:
                  </span>
                  <strong className="text-emerald-400 text-sm text-right">
                    {renderItem('mua-nhan-hieu-ty-le-thanh-cong', '100% (Đã được Cục SHTT cấp bằng)')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Rủi ro bị phản đối đơn:
                  </span>
                  <strong className="text-emerald-400 text-sm text-right">
                    {renderItem('mua-nhan-hieu-rui-ro', 'Không thể xảy ra (0%)')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Hiệu quả khởi nghiệp:
                  </span>
                  <strong className="text-white text-sm text-right">
                    {renderItem('mua-nhan-hieu-hieu-qua', 'Bắt đầu sản xuất, chạy Marketing ngay lập tức')}
                  </strong>
                </div>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-slate-800">
              <button
                onClick={() => { window.location.hash = '#/catalog'; }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-colors"
              >
                Tìm mua nhãn hiệu sẵn có ngay
              </button>
            </div>
          </div>

          {/* Box 2: Starting Brand Registration from Scratch */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
                  Đăng ký nhãn hiệu hoàn toàn mới
                </span>
                <span className="text-xs text-red-500 font-bold">Rủi ro tiềm ẩn</span>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-4">Nộp hồ sơ tự đăng ký mới</h3>
              
              <div className="space-y-4 text-xs mt-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Thời gian cấp bằng:
                  </span>
                  <strong className="text-red-500 text-sm text-right">
                    {renderItem('nop-ho-so-thoi-gian-cap-bang', '18 - 24 tháng (Chờ đợi thẩm định)')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Tỷ lệ thành công pháp lý:
                  </span>
                  <strong className="text-red-500 text-sm text-right">
                    {renderItem('nop-ho-so-ty-le-thanh-cong', 'Dưới 50% (Hơn một nửa bị bác bỏ)')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Rủi ro bị phản đối đơn:
                  </span>
                  <strong className="text-red-500 text-sm text-right">
                    {renderItem('nop-ho-so-rui-ro', 'Cực kỳ cao (Đối thủ khiếu nại, phản biện)')}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 gap-4">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                    Hiệu quả khởi nghiệp:
                  </span>
                  <strong className="text-slate-700 text-sm text-right">
                    {renderItem('nop-ho-so-hieu-qua', 'Dễ phải đổi tên nhãn sau 2 năm nếu đơn bị từ chối')}
                  </strong>
                </div>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={onOpenWizard}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-colors"
              >
                Nộp hồ sơ đăng ký nhãn hiệu mới
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
