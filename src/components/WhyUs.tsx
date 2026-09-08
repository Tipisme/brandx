import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  BadgeCheck, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { fetchPageBySlug, ApiPageResponse } from '../services/pageService';

export interface BenefitTab {
  id: string; // primary slug (e.g. 'bao-ve-phap-ly-tuyet-doi')
  contentSlug: string; // content slug (e.g. 'bao-ve-phap-ly-tuyet-doi-content')
  title: string; // title decoded from <h3> in content or slug
  summaryHtml: string; // WYSIWYG HTML from primary slug (e.g. <p>Tránh hoàn toàn rủi ro...</p>)
  contentHtml: string; // WYSIWYG HTML from content slug (e.g. <h3...>...</h3><p>...</p>...)
  icon: React.ComponentType<any>;
  colorClass: string;
}

/**
 * Decode HTML entities like &aacute;, &agrave;, &ocirc;, &nbsp;, etc.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  if (typeof document !== 'undefined') {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent || text;
  }
  return text
    .replace(/&aacute;/g, 'á')
    .replace(/&agrave;/g, 'à')
    .replace(/&atilde;/g, 'ã')
    .replace(/&acirc;/g, 'â')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&iacute;/g, 'í')
    .replace(/&igrave;/g, 'ì')
    .replace(/&oacute;/g, 'ó')
    .replace(/&ograve;/g, 'ò')
    .replace(/&otilde;/g, 'õ')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&utilde;/g, 'ũ')
    .replace(/&yacute;/g, 'ý')
    .replace(/&ygrave;/g, 'ỳ')
    .replace(/&ytilde;/g, 'ỹ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Strictly 5 tabs requested for "Tại Sao Nên Sở Hữu Thương Hiệu Từ Brandix?"
const TARGET_WHYUS_SLUGS = [
  'bao-ve-phap-ly-tuyet-doi',
  'so-huu-ngay-lap-tuc',
  'nhan-hieu-da-phe-duyet',
  'danh-sach-xac-thuc-3-lop',
  'ky-quy-chuyen-giao-an-toan'
] as const;

const DEFAULT_BENEFITS: BenefitTab[] = [
  {
    id: 'bao-ve-phap-ly-tuyet-doi',
    contentSlug: 'bao-ve-phap-ly-tuyet-doi-content',
    title: 'Bảo Vệ Pháp Lý Tuyệt Đối',
    summaryHtml: '<p>Tránh hoàn toàn rủi ro tranh chấp xâm phạm thương quyền.</p>',
    contentHtml: `
      <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">Bảo Vệ Pháp Lý Tuyệt Đối</h3>
      <p class="text-gray-300 text-sm leading-relaxed mb-6">Sở hữu ngay sự bảo hộ pháp lý tức thời với các nhãn hiệu đã được Cục Sở Hữu Trí Tuệ cấp Văn bằng bảo hộ độc quyền độc lập. Bảo vệ hoạt động kinh doanh của bạn khỏi các hành vi làm giả, làm nhái và các vấn đề pháp lý phức tạp khác. Bắt đầu kinh doanh một cách yên tâm khi biết rằng tài sản sở hữu trí tuệ của bạn được an toàn tuyệt đối dưới sự bảo trợ của Luật SHTT Việt Nam.</p>
      <div class="space-y-2 mb-8">
        <ul>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đại diện làm thủ tục trọn gói miễn phí</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</li>
        </ul>
      </div>
    `,
    icon: Shield,
    colorClass: 'from-orange-500 to-amber-600'
  },
  {
    id: 'so-huu-ngay-lap-tuc',
    contentSlug: 'so-huu-ngay-lap-tuc-content',
    title: 'Sở Hữu Ngay Lập Tức',
    summaryHtml: '<p>Bắt đầu bán hàng và nhượng quyền kinh doanh trong 3 ngày.</p>',
    contentHtml: `
      <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">Sở Hữu Ngay Lập Tức</h3>
      <p class="text-gray-300 text-sm leading-relaxed mb-6">Thay vì chờ đợi từ 18 đến 24 tháng đối với một đơn đăng ký nhãn hiệu thông thường với tỷ lệ rủi ro bị từ chối cực kỳ cao, việc mua lại nhãn hiệu đã bảo hộ sẵn cho phép bạn ký hợp đồng khai thác thương mại và sở hữu ngay trong vòng vài ngày. Giúp doanh nghiệp của bạn chớp lấy cơ hội vàng trên thị trường nhanh gấp 200 lần.</p>
      <div class="space-y-2 mb-8">
        <ul>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đại diện làm thủ tục trọn gói miễn phí</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</li>
        </ul>
      </div>
    `,
    icon: Clock,
    colorClass: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'nhan-hieu-da-phe-duyet',
    contentSlug: 'nhan-hieu-da-phe-duyet-content',
    title: 'Nhãn Hiệu Đã Phê Duyệt',
    summaryHtml: '<p>100% nhãn hiệu đã có văn bằng bảo hộ độc quyền từ Cục SHTT.</p>',
    contentHtml: `
      <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">Nhãn Hiệu Đã Phê Duyệt</h3>
      <p class="text-gray-300 text-sm leading-relaxed mb-6">Tất cả các nhãn hiệu nằm trong danh mục giao dịch chính của Brandix đều đã được cấp Văn bằng bảo hộ (Giấy chứng nhận đăng ký nhãn hiệu) có giá trị pháp lý hiện hữu, còn nguyên thời hạn sử dụng. Bạn loại bỏ hoàn toàn khả năng bị bên thứ ba phản đối đơn hoặc bị thẩm định viên từ chối cấp bằng do trùng lắp ngành hàng.</p>
      <div class="space-y-2 mb-8">
        <ul>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đại diện làm thủ tục trọn gói miễn phí</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</li>
        </ul>
      </div>
    `,
    icon: BadgeCheck,
    colorClass: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'danh-sach-xac-thuc-3-lop',
    contentSlug: 'danh-sach-xac-thuc-3-lop-content',
    title: 'Danh Sách Xác Thực 3 Lớp',
    summaryHtml: '<p>Kiểm tra chủ sở hữu gốc và phân loại nhóm Nice chuẩn quốc tế.</p>',
    contentHtml: `
      <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">Danh Sách Xác Thực 3 Lớp</h3>
      <p class="text-gray-300 text-sm leading-relaxed mb-6">Đội ngũ luật sư sở hữu trí tuệ của chúng tôi trực tiếp kiểm định hồ sơ, đối chiếu dữ liệu gốc của Cục SHTT Việt Nam và tổ chức SHTT Thế giới (WIPO). Đảm bảo nhãn hiệu không bị tranh chấp, không thế chấp, không nằm trong danh sách thi hành án và được phân nhóm danh mục sản phẩm/dịch vụ theo Thỏa ước Nice chính xác 100%.</p>
      <div class="space-y-2 mb-8">
        <ul>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đại diện làm thủ tục trọn gói miễn phí</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</li>
        </ul>
      </div>
    `,
    icon: FileCheck,
    colorClass: 'from-purple-600 to-violet-700'
  },
  {
    id: 'ky-quy-chuyen-giao-an-toan',
    contentSlug: 'ky-quy-chuyen-giao-an-toan-content',
    title: 'Ký Quỹ Chuyển Giao An Toàn',
    summaryHtml: '<p>Bảo vệ dòng tiền qua tài khoản trung gian của Ngân hàng liên kết.</p>',
    contentHtml: `
      <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">Ký Quỹ Chuyển Giao An Toàn</h3>
      <p class="text-gray-300 text-sm leading-relaxed mb-6">An toàn tài chính tối đa với hệ thống thanh toán ký quỹ (Escrow). Người mua chuyển tiền vào tài khoản phong tỏa của Ngân hàng đối tác. Brandix và các bên tiến hành nộp hồ sơ chuyển nhượng văn bằng bảo hộ lên Cục SHTT. Dòng tiền chỉ được giải ngân cho người bán sau khi hồ sơ nhận đơn hợp lệ được ghi nhận chính thức, đảm bảo quyền lợi tuyệt đối cho đôi bên.</p>
      <div class="space-y-2 mb-8">
        <ul>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đại diện làm thủ tục trọn gói miễn phí</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</li>
          <li class="flex items-center gap-2.5 text-xs text-gray-300">Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</li>
        </ul>
      </div>
    `,
    icon: CheckCircle2,
    colorClass: 'from-rose-600 to-pink-700'
  }
];

const COLOR_PALETTES = [
  'from-orange-500 to-amber-600',
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-purple-600 to-violet-700',
  'from-rose-600 to-pink-700'
];

interface WhyUsProps {
  pageData?: ApiPageResponse | null;
  slug?: string;
  language?: 'vi' | 'en';
}

export default function WhyUs({ 
  pageData: propPageData,
  slug = 'brandix-about', 
  language = 'vi' 
}: WhyUsProps) {
  const [activeTab, setActiveTab] = useState<string>('bao-ve-phap-ly-tuyet-doi');
  const [internalPageData, setInternalPageData] = useState<ApiPageResponse | null>(null);
  const [benefits, setBenefits] = useState<BenefitTab[]>(DEFAULT_BENEFITS);

  // Active data source: passed from parent or internally fetched
  const pageData = propPageData !== undefined ? propPageData : internalPageData;

  // Process data whenever pageData changes
  useEffect(() => {
    if (!pageData || !Array.isArray(pageData.values) || pageData.values.length === 0) {
      return;
    }

    const contentMap = new Map<string, string>();
    pageData.values.forEach(v => {
      contentMap.set(v.slug, v.value);
    });

    // Strictly filter ONLY the 5 target slugs requested by user
    const parsedTabs: BenefitTab[] = TARGET_WHYUS_SLUGS.map((targetSlug, index) => {
      const contentSlug = `${targetSlug}-content`;
      const summaryHtml = contentMap.get(targetSlug) || DEFAULT_BENEFITS[index]?.summaryHtml || '';
      const contentHtml = contentMap.get(contentSlug) || DEFAULT_BENEFITS[index]?.contentHtml || '';

      // Extract title from <h3> tag or fallback
      const headingMatch = contentHtml.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
      let cleanTitle = '';
      if (headingMatch && headingMatch[1]) {
        cleanTitle = decodeHtmlEntities(headingMatch[1].replace(/<[^>]*>?/gm, '').trim());
      } else {
        cleanTitle = DEFAULT_BENEFITS[index]?.title || targetSlug
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      let IconComp = Sparkles;
      if (targetSlug.includes('phap-ly')) IconComp = Shield;
      else if (targetSlug.includes('ngay-lap-tuc')) IconComp = Clock;
      else if (targetSlug.includes('phe-duyet')) IconComp = BadgeCheck;
      else if (targetSlug.includes('xac-thuc')) IconComp = FileCheck;
      else if (targetSlug.includes('ky-quy')) IconComp = CheckCircle2;

      return {
        id: targetSlug,
        contentSlug,
        title: cleanTitle,
        summaryHtml,
        contentHtml,
        icon: IconComp,
        colorClass: COLOR_PALETTES[index % COLOR_PALETTES.length]
      };
    });

    setBenefits(parsedTabs);
  }, [pageData]);

  // Only fetch internally if propPageData was NOT passed
  useEffect(() => {
    if (propPageData !== undefined) return; // Managed by parent, skip internal fetch!

    let isMounted = true;
    fetchPageBySlug(slug, language)
      .then((data) => {
        if (!isMounted) return;
        setInternalPageData(data);
      })
      .catch((err) => {
        console.warn('Using default benefits data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [propPageData, slug, language]);

  const activeBenefit = benefits.find(b => b.id === activeTab) || benefits[0] || DEFAULT_BENEFITS[0];
  const ActiveIcon = activeBenefit.icon;

  // Body HTML for introduction
  const cleanBodyHtml = pageData?.body || '';

  return (
    <section className="py-20 bg-slate-50 relative" id="why-brandix">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3.5 py-1 rounded-full border border-orange-500/20">
              {pageData?.name ? decodeHtmlEntities(pageData.name) : 'Giá Trị Cốt Lõi'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-950 tracking-tight mb-4">
            {pageData?.title ? decodeHtmlEntities(pageData.title) : 'Tại Sao Nên Sở Hữu Thương Hiệu Từ Brandix?'}
          </h2>

          {cleanBodyHtml ? (
            <div 
              className="wysiwyg-intro text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto [&_p]:leading-relaxed [&_p]:mb-2 [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: cleanBodyHtml }}
            />
          ) : (
            <p className="text-slate-600 text-sm sm:text-base">
              Tiết kiệm thời gian, loại bỏ rủi ro pháp lý và tạo dựng lợi thế cạnh tranh áp đảo ngay từ ngày đầu tiên thành lập doanh nghiệp của bạn.
            </p>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Navigation Tabs List (5 strict tabs) */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              const isActive = benefit.id === activeTab;
              return (
                <button
                  key={benefit.id}
                  id={`whyus-tab-${benefit.id}`}
                  onClick={() => setActiveTab(benefit.id)}
                  className={`w-full text-left p-4.5 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-md border-l-4 border-orange-500 translate-x-2 ring-1 ring-orange-500/10'
                      : 'bg-transparent hover:bg-white/60 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    isActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold block transition-colors ${
                      isActive ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {benefit.title}
                    </h3>
                    {/* WYSIWYG Summary from primary slug */}
                    <div 
                      className={`wysiwyg-summary text-xs mt-1 leading-relaxed line-clamp-2 transition-colors ${
                        isActive ? 'text-slate-600 font-medium' : 'text-slate-500'
                      } [&_p]:m-0 [&_p]:leading-relaxed`}
                      dangerouslySetInnerHTML={{ __html: benefit.summaryHtml }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Highlight Card - WYSIWYG Content Output */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl h-full flex flex-col justify-between relative overflow-hidden border border-slate-800">
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${activeBenefit.colorClass} opacity-10 rounded-full blur-3xl pointer-events-none`} />
              
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${activeBenefit.colorClass} text-white shadow-lg`}>
                    <ActiveIcon className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 border border-slate-800 rounded-full px-3 py-1 bg-slate-950/40">
                    BẢO HỘ PHÁP LÝ CHÍNH THỨC
                  </span>
                </div>

                {/* Card Detailed HTML Content rendered from API WYSIWYG Editor */}
                <div 
                  className="wysiwyg-content text-slate-200 text-sm leading-relaxed
                    [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-white [&_h1]:mb-4
                    [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mb-3
                    [&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-extrabold [&_h3]:text-white [&_h3]:tracking-tight [&_h3]:mb-4 [&_h3]:leading-tight
                    [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-white [&_h4]:mb-2
                    [&_p]:text-gray-300 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-6
                    [&_ul]:space-y-3 [&_ul]:mb-8
                    [&_ol]:space-y-3 [&_ol]:mb-8 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_li]:text-xs [&_li]:text-gray-300 [&_li]:leading-normal
                    [&_li.flex]:flex [&_li.flex]:items-center [&_li.flex]:gap-2.5
                    [&_li]:before:content-['✓'] [&_li]:before:text-orange-400 [&_li]:before:font-bold [&_li]:before:text-xs [&_li]:before:shrink-0
                    [&_strong]:text-white [&_strong]:font-bold
                    [&_b]:text-white [&_b]:font-bold
                    [&_a]:text-orange-400 [&_a]:underline hover:[&_a]:text-orange-300
                    [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
                    [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4
                    [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-700 [&_th]:p-2.5 [&_td]:border [&_td]:border-slate-800 [&_td]:p-2.5"
                  dangerouslySetInnerHTML={{ __html: activeBenefit.contentHtml }}
                />
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 mt-8">
                <span className="text-xs text-slate-400">
                  Phù hợp cho cả: <strong className="text-white">Cá nhân & Doanh nghiệp</strong>
                </span>
                <a
                  href="#/catalog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer group"
                >
                  Khám phá danh sách nhãn hiệu ngay
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
