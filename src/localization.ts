export type Language = 'vi' | 'en';

export interface TranslationDict {
  // Navigation
  home: string;
  catalog: string;
  workflow: string;
  whyUs: string;
  faq: string;
  news: string;
  knowledge: string;
  hotline: string;
  connectedDB: string;
  connectedStatus: string;
  registerNew: string;
  loginRegister: string;
  logout: string;
  welcome: string;

  // Search Banner
  searchPlaceholder: string;
  searchBtn: string;
  chooseClass: string;
  allClasses: string;

  // Advanced Filters (as requested from image)
  filterTitle: string;
  trademarkName: string;
  trademarkNamePl: string;
  searchStrategy: string;
  strategyContains: string;
  strategyStartsWith: string;
  strategyExact: string;
  strategySimilar: string;
  ownerName: string;
  ownerNamePl: string;
  docNo: string;
  docNoPl: string;
  niceClass: string;
  niceClassPl: string;
  goodsService: string;
  goodsServicePl: string;
  clearAll: string;
  searchSubmit: string;
  foundTrademarks: string;
  resetFilters: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  emptyStateBtn: string;

  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStat1: string;
  heroStat1Sub: string;
  heroStat2: string;
  heroStat2Sub: string;
  heroStat3: string;
  heroStat3Sub: string;

  // Why Us
  whyBadge: string;
  whyTitle: string;
  whySubtitle: string;

  // Workflow
  workBadge: string;
  workTitle: string;
  workSubtitle: string;

  // FAQ
  faqBadge: string;
  faqTitle: string;
  faqSubtitle: string;

  // Footer
  footerDesc: string;
  footerContact: string;
  footerLinks: string;
  footerRights: string;
  footerOffice: string;
  footerSecured: string;
}

export const translations: Record<Language, TranslationDict> = {
  vi: {
    home: "Trang chủ",
    catalog: "Sàn nhãn hiệu",
    workflow: "Quy trình",
    whyUs: "Về chúng tôi",
    faq: "Hỏi đáp",
    news: "Tin tức",
    knowledge: "Kiến thức",
    hotline: "Hotline",
    connectedDB: "Kết nối CSDL Cục SHTT Việt Nam",
    connectedStatus: "Đã liên kết",
    registerNew: "Nộp Đơn Đăng Ký Mới",
    loginRegister: "Đăng Nhập / Đăng Ký",
    logout: "Đăng xuất",
    welcome: "Chào mừng",

    searchPlaceholder: "Tìm nhãn hiệu (Ví dụ: Vinamilk, Tech...)",
    searchBtn: "Tra Cứu",
    chooseClass: "Chọn Nhóm hàng...",
    allClasses: "Tất cả danh mục",

    filterTitle: "Bộ lọc tìm kiếm nâng cao",
    trademarkName: "Tên nhãn hiệu",
    trademarkNamePl: "Ví dụ: Vinamilk, THTrueMilk",
    searchStrategy: "Chiến lược tìm kiếm",
    strategyContains: "Có chứa (kết quả từ khóa)",
    strategyStartsWith: "Bắt đầu bằng",
    strategyExact: "Bằng chính xác",
    strategySimilar: "Tương tự",
    ownerName: "Tên chủ sở hữu",
    ownerNamePl: "Ví dụ: Nguyễn Văn Nam",
    docNo: "Số đơn / Số bằng",
    docNoPl: "Ví dụ: 1234567890",
    niceClass: "Nhóm ngành",
    niceClassPl: "Ví dụ: 11,33,44,66,77",
    goodsService: "Hàng hóa dịch vụ",
    goodsServicePl: "Ví dụ: Sữa, mỹ phẩm, thực phẩm",
    clearAll: "Xóa hết",
    searchSubmit: "Tìm kiếm",
    foundTrademarks: "Tìm thấy {count} nhãn hiệu phù hợp",
    resetFilters: "Đặt lại bộ lọc",
    emptyStateTitle: "Không tìm thấy nhãn hiệu phù hợp",
    emptyStateDesc: "Chúng tôi chưa có nhãn hiệu sẵn ứng với các điều kiện lọc này. Hãy để lại yêu cầu đặt mua, chuyên gia SHTT sẽ lục tìm trong cơ sở dữ liệu ngầm cho bạn.",
    emptyStateBtn: "Yêu cầu Tìm kiếm & Đặt mua riêng",

    heroBadge: "SÀN CHUYỂN NHƯỢNG NHÃN HIỆU SỐ 1 VIỆT NAM",
    heroTitle: "Sở hữu Nhãn hiệu Độc quyền nhanh chóng & an toàn pháp lý",
    heroSubtitle: "Tra cứu, định giá và mua bán nhãn hiệu đã được bảo hộ chỉ trong 24h. Tiết kiệm 2 năm chờ đợi thẩm định hồ sơ đăng ký mới.",
    heroStat1: "3,500+",
    heroStat1Sub: "Nhãn hiệu sạch pháp lý",
    heroStat2: "24 Giờ",
    heroStat2Sub: "Hoàn tất chuyển quyền",
    heroStat3: "100%",
    heroStat3Sub: "Bảo hộ bởi Cục SHTT",

    whyBadge: "TẠI SAO CHỌN BRANDHUB",
    whyTitle: "Giải pháp chuyển nhượng nhãn hiệu thông minh nhất",
    whySubtitle: "Chúng tôi số hóa quy trình mua bán nhãn hiệu, mang lại trải nghiệm minh bạch, nhanh gọn và tối ưu chi phí cho doanh nghiệp.",

    workBadge: "QUY TRÌNH GIAO DỊCH CHUẨN",
    workTitle: "Chuyển nhượng Nhãn hiệu chỉ với 3 bước",
    workSubtitle: "Quy trình khép kín, an toàn tuyệt đối, được giám sát bởi các chuyên gia luật sở hữu trí tuệ giàu kinh nghiệm.",

    faqBadge: "HỎI ĐÁP SHTT",
    faqTitle: "Giải đáp thắc mắc thường gặp",
    faqSubtitle: "Tất cả những gì bạn cần biết về quy trình mua bán, ký gửi nhãn hiệu độc quyền và thủ tục pháp lý liên quan.",

    footerDesc: "BrandHub là nền tảng số hóa chuyển nhượng nhãn hiệu đầu tiên và uy tín nhất tại Việt Nam. Giúp doanh nghiệp sở hữu thương hiệu nhanh chóng, an toàn và đúng pháp luật.",
    footerContact: "Liên hệ hỗ trợ",
    footerLinks: "Liên kết nhanh",
    footerRights: "Đã đăng ký bản quyền. Vận hành bởi IP BrandHub Việt Nam.",
    footerOffice: "Trụ sở chính: Tầng 12, Tòa nhà Geleximco, 36 Hoàng Cầu, Đống Đa, Hà Nội.",
    footerSecured: "Hệ thống bảo mật giao dịch được chứng nhận an toàn bởi Viện Sở hữu Trí tuệ."
  },
  en: {
    home: "Home",
    catalog: "Trademark Marketplace",
    workflow: "Process",
    whyUs: "About Us",
    faq: "FAQ",
    news: "News",
    knowledge: "Knowledge",
    hotline: "Hotline",
    connectedDB: "NOIP Vietnam Database Connected",
    connectedStatus: "Linked",
    registerNew: "File New Application",
    loginRegister: "Login / Register",
    logout: "Log out",
    welcome: "Welcome",

    searchPlaceholder: "Search trademarks (e.g. Vinamilk, Tech...)",
    searchBtn: "Search",
    chooseClass: "Select Class...",
    allClasses: "All Categories",

    filterTitle: "Advanced Search Filters",
    trademarkName: "Trademark name",
    trademarkNamePl: "e.g. Vinamilk, THTrueMilk",
    searchStrategy: "Search strategy",
    strategyContains: "Contains (keyword result)",
    strategyStartsWith: "Starts with",
    strategyExact: "Matches exactly",
    strategySimilar: "Similar",
    ownerName: "Owner name",
    ownerNamePl: "e.g. Nguyen Van Nam",
    docNo: "App / Reg No.",
    docNoPl: "e.g. 1234567890",
    niceClass: "Nice class",
    niceClassPl: "e.g. 11,33,44,66,77",
    goodsService: "Goods & Services",
    goodsServicePl: "e.g. Milk, cosmetics, foods",
    clearAll: "Clear all",
    searchSubmit: "Search",
    foundTrademarks: "Found {count} matching trademarks",
    resetFilters: "Reset filters",
    emptyStateTitle: "No matching trademarks found",
    emptyStateDesc: "We do not have trademarks matching these filter criteria yet. Leave a purchase request and an IP expert will search in our off-market database for you.",
    emptyStateBtn: "Request Custom Search & Purchase",

    heroBadge: "VIETNAM'S #1 TRADEMARK TRANSFER PLATFORM",
    heroTitle: "Own an Exclusive Trademark Quickly & Legally Secure",
    heroSubtitle: "Search, appraise, and buy registered trademarks in just 24 hours. Save 2 years of waiting for new application examinations.",
    heroStat1: "3,500+",
    heroStat1Sub: "Clean legal trademarks",
    heroStat2: "24 Hours",
    heroStat2Sub: "Transfer complete",
    heroStat3: "100%",
    heroStat3Sub: "Protected by NOIP",

    whyBadge: "WHY CHOOSE BRANDHUB",
    whyTitle: "The Smartest Trademark Transfer Solution",
    whySubtitle: "We digitalize the trademark trading process, providing transparent, quick, and cost-effective experiences for businesses.",

    workBadge: "STANDARD TRADING PROCESS",
    workTitle: "Transfer Trademark in Just 3 Steps",
    workSubtitle: "Closed-loop, absolutely safe, supervised by highly experienced intellectual property law experts.",

    faqBadge: "IP Q&A",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about purchasing, depositing registered trademarks, and relevant legal procedures.",

    footerDesc: "BrandHub is the first and most prestigious digitalized trademark transfer platform in Vietnam. Helping businesses own brands quickly, safely, and legally.",
    footerContact: "Contact Support",
    footerLinks: "Quick Links",
    footerRights: "All rights reserved. Operated by IP BrandHub Vietnam.",
    footerOffice: "Headquarters: 12th Floor, Geleximco Building, 36 Hoang Cau, Dong Da, Hanoi.",
    footerSecured: "Transaction security system certified safe by the Institute of Intellectual Property."
  }
};
