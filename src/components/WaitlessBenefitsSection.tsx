import React, { useState, useEffect } from 'react';
import { fetchPageBySlug, ApiPageResponse } from '../services/pageService';
import { decodeHtmlEntities } from './WhyUs';

interface WaitBenefitItem {
  id: string; // primary slug
  contentSlug: string; // content slug
  label: string;
  summaryHtml: string;
  contentHtml: string;
}

const DEFAULT_WAIT_BENEFITS: WaitBenefitItem[] = [
  {
    id: 'khoi-dau-vung-manh',
    contentSlug: 'khoi-dau-vung-manh-content',
    label: 'Khởi đầu vững mạnh',
    summaryHtml: '<p>Được bảo hộ độc quyền giúp tăng tỷ lệ tin cậy của đối tác và quỹ đầu tư.</p>',
    contentHtml: `
      <h4 class="text-xl font-bold text-slate-900 mb-3">Bảo vệ thương quyền tuyệt đối khi ra khơi</h4>
      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
        Sở hữu nhãn hiệu ngay lập tức tạo nên rào cản pháp lý ngăn mọi đối thủ cạnh tranh sao chép ý tưởng, logo hoặc tên gọi sản phẩm của bạn. Giúp xây dựng móng nhà kinh doanh vững vàng, tạo sự an tâm tuyệt đối cho khách hàng và đối tác ký hợp đồng đại lý.
      </p>
    `
  },
  {
    id: 'tiet-kiem-thoi-gian',
    contentSlug: 'tiet-kiem-thoi-gian-content',
    label: 'Tiết kiệm thời gian',
    summaryHtml: '<p>Không lo mất 2 năm chờ đợi mòn mỏi phê duyệt hành chính từ cơ quan nhà nước.</p>',
    contentHtml: `
      <h4 class="text-xl font-bold text-slate-900 mb-3">Tối ưu hàng chục ngàn giờ làm việc</h4>
      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
        Thời gian là tiền bạc. Bỏ qua quy trình nộp đơn ròng rã và giải trình phản đối đơn giúp bạn tung sản phẩm ra thị trường ngay hôm nay, đưa gian hàng lên Mall các sàn Shopee, Lazada, TikTok Shop chỉ trong vài tiếng, chiếm lĩnh thị phần vàng trước đối thủ.
      </p>
    `
  },
  {
    id: 'bo-qua-rui-ro-trung-lap',
    contentSlug: 'bo-qua-rui-ro-trung-lap-content',
    label: 'Bỏ qua rủi ro trùng lắp',
    summaryHtml: '<p>Hạn chế tuyệt đối nguy cơ bị Cục từ chối đơn sau 2 năm vì tương tự gây nhầm lẫn.</p>',
    contentHtml: `
      <h4 class="text-xl font-bold text-slate-900 mb-3">Nói không với tổn thất kinh phí Marketing</h4>
      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
        Hơn 50% đơn đăng ký mới bị từ chối cấp văn bằng sau 2 năm thẩm định. Thử tưởng tượng bạn đã đầu tư hàng tỷ đồng làm bảng hiệu, bao bì, chạy quảng cáo để rồi nhận được quyết định từ chối cấp bằng vì nhãn trùng lặp! Mua nhãn hiệu có sẵn triệt tiêu hoàn toàn rủi ro thảm họa này.
      </p>
    `
  },
  {
    id: 'tang-truong-nhuong-quyen',
    contentSlug: 'tang-truong-nhuong-quyen-content',
    label: 'Tăng trưởng nhượng quyền',
    summaryHtml: '<p>Mở rộng chuỗi kinh doanh nhượng quyền (Franchise) hợp pháp, thu dòng tiền bản quyền.</p>',
    contentHtml: `
      <h4 class="text-xl font-bold text-slate-900 mb-3">Khai thác tối đa doanh số bản quyền</h4>
      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
        Chỉ những nhãn hiệu đã được cấp Văn bằng bảo hộ độc quyền mới đủ điều kiện pháp lý để ký kết hợp đồng li-xăng (nhượng quyền thương mại) chính thức. Sở hữu văn bằng giúp bạn hợp pháp hóa việc thu phí nhượng quyền thương hiệu mỗi tháng từ mạng lưới chi nhánh đại lý.
      </p>
    `
  }
];

const TARGET_WAIT_SLUGS = [
  'khoi-dau-vung-manh',
  'tiet-kiem-thoi-gian',
  'bo-qua-rui-ro-trung-lap',
  'tang-truong-nhuong-quyen'
] as const;

interface WaitlessBenefitsSectionProps {
  pageData?: ApiPageResponse | null;
  slug?: string;
  language?: 'vi' | 'en';
}

export default function WaitlessBenefitsSection({
  pageData: propPageData,
  slug = 'brandix-about',
  language = 'vi'
}: WaitlessBenefitsSectionProps) {
  const [activeWaitBenefit, setActiveWaitBenefit] = useState<string>('khoi-dau-vung-manh');
  const [items, setItems] = useState<WaitBenefitItem[]>(DEFAULT_WAIT_BENEFITS);

  // If pageData is supplied from parent, parse items directly
  useEffect(() => {
    if (!propPageData || !propPageData.values) return;

    const contentMap = new Map<string, string>();
    propPageData.values.forEach(v => {
      contentMap.set(v.slug, v.value);
    });

    const parsedItems: WaitBenefitItem[] = TARGET_WAIT_SLUGS.map((targetSlug, index) => {
      const contentSlug = `${targetSlug}-content`;
      const rawSummary = contentMap.get(targetSlug);
      const rawContent = contentMap.get(contentSlug);

      const summaryHtml = rawSummary || DEFAULT_WAIT_BENEFITS[index].summaryHtml;
      const contentHtml = rawContent || DEFAULT_WAIT_BENEFITS[index].contentHtml;

      // Default fallback label
      let label = DEFAULT_WAIT_BENEFITS[index].label;

      // If summary has a strong/b tag, or content has a heading, extract clean title
      if (rawSummary) {
        const strongMatch = rawSummary.match(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/i);
        if (strongMatch && strongMatch[1]) {
          label = decodeHtmlEntities(strongMatch[1].replace(/<[^>]*>?/gm, '').trim());
        }
      }

      return {
        id: targetSlug,
        contentSlug,
        label,
        summaryHtml,
        contentHtml
      };
    });

    setItems(parsedItems);
  }, [propPageData]);

  // Only fetch internally if propPageData was NOT passed
  useEffect(() => {
    if (propPageData !== undefined) return; // Managed by parent, skip internal fetch!

    let isMounted = true;
    fetchPageBySlug(slug, language)
      .then((data: ApiPageResponse) => {
        if (!isMounted || !data?.values) return;

        const contentMap = new Map<string, string>();
        data.values.forEach(v => {
          contentMap.set(v.slug, v.value);
        });

        const parsedItems: WaitBenefitItem[] = TARGET_WAIT_SLUGS.map((targetSlug, index) => {
          const contentSlug = `${targetSlug}-content`;
          const rawSummary = contentMap.get(targetSlug);
          const rawContent = contentMap.get(contentSlug);

          const summaryHtml = rawSummary || DEFAULT_WAIT_BENEFITS[index].summaryHtml;
          const contentHtml = rawContent || DEFAULT_WAIT_BENEFITS[index].contentHtml;

          // Default fallback label
          let label = DEFAULT_WAIT_BENEFITS[index].label;

          // If summary has a strong/b tag, or content has a heading, extract clean title
          if (rawSummary) {
            const strongMatch = rawSummary.match(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/i);
            if (strongMatch && strongMatch[1]) {
              label = decodeHtmlEntities(strongMatch[1].replace(/<[^>]*>?/gm, '').trim());
            }
          }

          return {
            id: targetSlug,
            contentSlug,
            label,
            summaryHtml,
            contentHtml
          };
        });

        setItems(parsedItems);
      })
      .catch((err) => {
        console.warn('WaitlessBenefitsSection fetch failed, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [propPageData, slug, language]);

  const activeItem = items.find(it => it.id === activeWaitBenefit) || items[0] || DEFAULT_WAIT_BENEFITS[0];

  return (
    <section className="py-20 bg-white" id="waitless-benefits">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">
            Thúc Đẩy Doanh Thu
          </span>
          <h2 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight mb-4">
            Không Cần Chờ Đợi - Sở Hữu Thương Hiệu Độc Quyền Ngay Hôm Nay
          </h2>
          <p className="text-slate-500 text-sm">
            Sở hữu tài sản thương quyền sớm mở ra nhiều cơ hội tăng tốc tăng trưởng quy mô kinh doanh không giới hạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left side tabs select */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {items.map((item) => {
              const isActive = activeWaitBenefit === item.id;
              return (
                <button
                  key={item.id}
                  id={`waitless-tab-${item.id}`}
                  onClick={() => setActiveWaitBenefit(item.id)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg translate-x-2'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-800'
                  }`}
                >
                  <strong className="text-sm font-bold block mb-1.5">{item.label}</strong>
                  <div 
                    className={`text-xs leading-normal [&_p]:m-0 [&_p]:leading-normal ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                    dangerouslySetInnerHTML={{ __html: item.summaryHtml }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right side display card mockup */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                  <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-widest">
                    Lợi thế cạnh tranh vượt trội
                  </span>
                </div>

                <div 
                  className="space-y-4 animate-in fade-in duration-200 wysiwyg-content
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-3
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-3
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-3
                    [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-slate-900 [&_h4]:mb-3
                    [&_p]:text-slate-600 [&_p]:text-xs [&_p]:sm:text-sm [&_p]:leading-relaxed [&_p]:mb-3
                    [&_strong]:text-slate-900 [&_strong]:font-bold
                    [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-disc
                    [&_li]:text-xs [&_li]:text-slate-600"
                  dangerouslySetInnerHTML={{ __html: activeItem.contentHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
