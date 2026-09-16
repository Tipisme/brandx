import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Heart, Share2, Award, Calendar, ShieldCheck, User, MapPin, Layers, Sparkles, CheckCircle2, Tag, Clock, XCircle } from 'lucide-react';
import { Language } from '../localization';
import { isExpiredOrRefusedStatus, checkIsExpiringSoon, getTrademarkStatusDisplay, extractFilingDate } from '../utils/trademarkStatus';

interface TrademarkDetailPageProps {
  slug: string;
  language: Language;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  onRequestRegistration?: () => void;
  user?: { name: string; email: string; token?: string } | null;
  onOpenNegotiation?: (slug: string, trademarkName?: string, price?: number | string) => void;
}

export default function TrademarkDetailPage({
  slug,
  language,
  onBack,
  onToggleFavorite,
  favorites,
  onRequestRegistration,
  user,
  onOpenNegotiation
}: TrademarkDetailPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSuccessRequested, setIsSuccessRequested] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'owner'>('history');
  const [ownerTrademarks, setOwnerTrademarks] = useState<any[]>([]);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://admin.hdslaw.vn/vi/api/products/${slug}`);
        if (!response.ok) {
          throw new Error(language === 'vi' ? 'Không thể tải chi tiết nhãn hiệu.' : 'Failed to fetch trademark details.');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchDetail();
    }
  }, [slug, language]);

  useEffect(() => {
    if (activeTab !== 'owner' || !slug) return;

    const fetchOwnerTrademarks = async () => {
      setIsOwnerLoading(true);
      try {
        const response = await fetch(`https://admin.hdslaw.vn/vi/api/related-trademarks/${encodeURIComponent(slug)}`);
        if (response.ok) {
          const json = await response.json();
          if (json) {
            const dataArray = Array.isArray(json) ? json : (json.data || []);
            const filtered = dataArray;

            const getAttrValHelper = (item: any, attrSlug: string): string => {
              const attr = item.attributes?.find((a: any) => a.slug === attrSlug);
              if (!attr || !attr.values || attr.values.length === 0) return '';
              return attr.values.map((v: any) => v.name).join(', ');
            };

            const getClassesHelper = (item: any): number[] => {
              const attr = item.attributes?.find((a: any) => a.slug === 'nhom-san-pham-code');
              if (!attr || !attr.values) return [];
              return attr.values
                .map((v: any) => {
                  if (v.position !== undefined && v.position !== null) return Number(v.position);
                  if (v.id_attr !== undefined && v.id_attr !== null) return Number(v.id_attr);
                  if (v.slug) {
                    const match = v.slug.match(/\d+/);
                    if (match) return Number(match[0]);
                  }
                  return null;
                })
                .filter((v: any): v is number => v !== null && !isNaN(v));
            };

            const mapped = filtered.map((p: any) => {
              const pClasses = getClassesHelper(p);
              const itemAppNo = getAttrValHelper(p, 'so-don') || 'VN4' + p.id;
              const rawItemFilingDate = getAttrValHelper(p, 'ngay-nop-don');
              const itemFilingDate = extractFilingDate(p.progresses, rawItemFilingDate);
              const itemStatusStr = getAttrValHelper(p, 'trang-thai') || p.status_name || p.status || '';
              const itemGoodsDesc = getAttrValHelper(p, 'nhom-san-pham-dich-vu') || p.short_description || '';
              const itemOwner = getAttrValHelper(p, 'chu-don-chu-bang') || 'Doanh nghiệp Việt Nam';

              const gradientOptions = [
                "from-blue-600 to-indigo-800",
                "from-teal-600 to-cyan-800",
                "from-emerald-600 to-teal-800",
                "from-slate-700 to-slate-900",
                "from-red-600 to-rose-800",
                "from-purple-600 to-indigo-800"
              ];
              const gradient = gradientOptions[p.id % gradientOptions.length];

              return {
                id: p.id.toString(),
                name: p.name,
                logoText: p.name?.substring(0, 2).toUpperCase(),
                logoBg: gradient,
                status: itemStatusStr.toLowerCase().includes('từ chối') ? 'sold' : 'available',
                statusText: itemStatusStr,
                progresses: p.progresses || [],
                classes: pClasses,
                goodsDescription: itemGoodsDesc,
                applicationNo: itemAppNo,
                filingDate: itemFilingDate,
                price: p.price || 0,
                isFeatured: p.is_active,
                description: p.description || '',
                ownerType: itemOwner,
                slug: p.slug,
                imagePath: p.image?.path
              };
            });

            setOwnerTrademarks(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching owner trademarks:', err);
      } finally {
        setIsOwnerLoading(false);
      }
    };

    fetchOwnerTrademarks();
  }, [language, slug, activeTab]);

  const getAttrVal = (attributes: any[], attrSlug: string): string => {
    const attr = attributes?.find(a => a.slug === attrSlug);
    if (!attr || !attr.values || attr.values.length === 0) return '';
    return attr.values.map((v: any) => v.name).join(', ');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">
          {language === 'vi' ? 'Đang truy xuất thông tin dữ liệu nhãn hiệu...' : 'Querying trademark database...'}
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 space-y-4">
          <p className="text-red-600 font-bold text-sm">{error || 'Nhãn hiệu không tồn tại'}</p>
          <button
            onClick={onBack}
            className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
          >
            {language === 'vi' ? 'Quay lại danh sách' : 'Back to marketplace'}
          </button>
        </div>
      </div>
    );
  }

  const { name, attributes = [], image } = product;
  const isFav = favorites.includes(product.id?.toString() || slug);

  // Parse attributes
  const typeStr = getAttrVal(attributes, 'loai-don') || (language === 'vi' ? 'Nhãn hiệu liên kết' : 'Associated Trademark');
  const statusStr = getAttrVal(attributes, 'trang-thai') || (language === 'vi' ? 'Đã công bố' : 'Published');
  const appNo = getAttrVal(attributes, 'so-don') || 'N/A';
  const rawFilingDate = getAttrVal(attributes, 'ngay-nop-don');
  const filingDate = extractFilingDate(product.progresses, rawFilingDate);
  const pubInfo = getAttrVal(attributes, 'so-cong-bo-va-ngay-cong-bo') || 'N/A';
  const colors = getAttrVal(attributes, 'mau-sac-nhan-hieu') || (language === 'vi' ? 'Đen trắng / Màu sắc tự do' : 'Black & White / Free color');
  const owner = getAttrVal(attributes, 'chu-don-chu-bang') || (language === 'vi' ? 'Đang cập nhật' : 'To be updated');
  const address = getAttrVal(attributes, 'address') || (language === 'vi' ? 'Việt Nam' : 'Vietnam');
  const templateType = getAttrVal(attributes, 'kieu-cua-mau-nhan-hinh-chu-ket-hop') || (language === 'vi' ? 'Chữ & Hình kết hợp' : 'Combined device');
  const exclusion = getAttrVal(attributes, 'yeu-to-loai-tru') || (language === 'vi' ? 'Không loại trừ' : 'None');
  const goodsStr = getAttrVal(attributes, 'nhom-san-pham-dich-vu') || 'N/A';

  // Extract classes
  const groupAttr = attributes.find((a: any) => a.slug === 'nhom-san-pham-code');
  const classesList = groupAttr?.values?.map((v: any) => v.position || v.id_attr).filter(Boolean) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200" id="trademark-detail-page">
      {/* Back Button & Share */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'vi' ? 'Quay lại Sàn nhãn hiệu' : 'Back to Marketplace'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onToggleFavorite(product.id?.toString() || slug)}
            className={`p-2 rounded-full border transition-all ${
              isFav 
                ? 'bg-red-50 border-red-200 text-red-500' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 transition-colors relative"
            title="Chia sẻ nhãn hiệu"
          >
            <Share2 className="w-4 h-4" />
            {copied && (
              <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap">
                {language === 'vi' ? 'Đã sao chép!' : 'Copied!'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Image / Logo and Nice Classes */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 flex items-center justify-center min-h-[340px] shadow-sm relative overflow-hidden group">
            {image?.path ? (
              <img
                src={image.path}
                alt={name}
                referrerPolicy="no-referrer"
                className="max-h-[280px] object-contain rounded-2xl drop-shadow-md group-hover:scale-102 transition-transform duration-300"
              />
            ) : (
              <div className="w-36 h-36 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-md">
                {name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            
            {(() => {
              const statusDisp = getTrademarkStatusDisplay(statusStr, product.progresses, language, filingDate);
              return (
                <div className={`absolute top-4 left-4 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase ${statusDisp.badgeBg}`}>
                  {statusDisp.text}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Side: Detail Metadata Table & Call-to-actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">
                {typeStr}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${
                isExpiredOrRefusedStatus(statusStr)
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {isExpiredOrRefusedStatus(statusStr) ? (
                  <XCircle className="w-3 h-3 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                )}
                {statusStr}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-slate-900 uppercase">
              {name}
            </h1>
            <div className="text-slate-400 text-xs font-mono">
              ID: {product.trademark_id || appNo}
            </div>
          </div>

          {/* Pricing or Registration Box */}
          {isExpiredOrRefusedStatus(statusStr) ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200/90 rounded-3xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    {language === 'vi' ? 'Tự do đăng ký' : 'Free Registration'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                    {language === 'vi' ? 'Quyền sở hữu SHTT' : 'IP Right Status'}
                  </span>
                </div>
                <strong className="text-xl sm:text-2xl font-sans font-black text-blue-950 block">
                  {language === 'vi' ? 'Được phép nộp đơn đăng ký mới' : 'Eligible for New Registration'}
                </strong>
                <p className="text-slate-600 text-xs mt-1 max-w-lg leading-relaxed font-medium">
                  {language === 'vi'
                    ? 'Nhãn hiệu này bị từ chối/hết hạn nên bên sở hữu không còn quyền độc quyền. Do đó không có thỏa thuận chuyển nhượng và bạn có quyền đăng ký mới.'
                    : 'This trademark is expired or refused, meaning the previous owner has no exclusive right. You are free to register it.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSuccessRequested(true);
                  if (onRequestRegistration) {
                    onRequestRegistration();
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase px-7 py-4 rounded-xl cursor-pointer transition-all shrink-0 text-center shadow-md shadow-blue-600/20 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                {language === 'vi' ? 'Đăng ký nhãn hiệu ngay' : 'Register Trademark Now'}
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  {language === 'vi' ? 'Trạng thái pháp lý nhãn hiệu' : 'Trademark Legal Status'}
                </span>
                {(() => {
                  const statusDisp = getTrademarkStatusDisplay(statusStr, product.progresses, language, filingDate);
                  return (
                    <strong className={`text-xl sm:text-2xl font-sans font-black block uppercase ${
                      statusDisp.isExpiringSoon ? 'text-amber-700' : 'text-emerald-800'
                    }`}>
                      {statusDisp.text}
                    </strong>
                  );
                })()}
              </div>
              <button
                onClick={() => {
                  if (onOpenNegotiation) {
                    onOpenNegotiation(slug, name, product?.price || 0);
                  } else {
                    setIsSuccessRequested(true);
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase px-6 py-3.5 rounded-xl cursor-pointer transition-colors shrink-0 text-center shadow-md shadow-orange-500/10"
              >
                {language === 'vi' ? 'Đàm phán mua lại nhãn hiệu' : 'Negotiate Trademark Purchase'}
              </button>
            </div>
          )}

          {isSuccessRequested && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-medium space-y-1 animate-in slide-in-from-top-2 duration-200">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isExpiredOrRefusedStatus(statusStr)
                  ? (language === 'vi' ? 'Tiếp nhận yêu cầu đăng ký thành công!' : 'Registration Request Received Successfully!')
                  : (language === 'vi' ? 'Gửi yêu cầu đàm phán thành công!' : 'Negotiation Request Sent Successfully!')}
              </p>
              <p className="text-emerald-700">
                {isExpiredOrRefusedStatus(statusStr)
                  ? (language === 'vi'
                      ? 'Chuyên viên sở hữu trí tuệ của Brandix sẽ liên hệ để tư vấn quy trình và hoàn thiện hồ sơ đăng ký nhãn hiệu độc quyền tốc hành cho bạn.'
                      : 'Our IP attorney will contact you shortly to guide the registration process and prepare fast-track application files.')
                  : (language === 'vi' 
                      ? 'Đại diện sở hữu trí tuệ của chúng tôi sẽ liên hệ lại với bạn trong vòng 2 giờ làm việc để hoàn tất thỏa thuận bảo mật SHTT.'
                      : 'Our IP attorneys will contact you within 2 business hours to complete the secure IP transfer agreement.')}
              </p>
            </div>
          )}


          {/* Classes & Goods Specification */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>{language === 'vi' ? 'Phân nhóm hàng hóa & dịch vụ' : 'Nice Classification & Goods'}</span>
              <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                {language === 'vi' ? `Nhóm ${classesList.join(', ')}` : `Class ${classesList.join(', ')}`}
              </span>
            </h3>

            <div className="text-xs space-y-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <strong className="text-slate-800 block mb-1 font-bold">
                  {language === 'vi' ? 'Danh mục dịch vụ/sản phẩm được bảo hộ độc quyền:' : 'Protected Goods & Services list:'}
                </strong>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {goodsStr}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Tabs: Lịch sử & Cùng chủ đơn */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 mt-8">
        {/* Tabs Headers */}
        <div className="flex border-b border-slate-100 gap-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold tracking-tight cursor-pointer transition-all border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'vi' ? 'Lịch sử' : 'Transaction History'}
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`pb-3 text-sm font-bold tracking-tight cursor-pointer transition-all border-b-2 ${
              activeTab === 'owner'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'vi' ? 'Cùng chủ đơn' : 'Same Applicant'}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="text-xs text-slate-500 font-medium">
              {language === 'vi' ? 'Tổng số giao dịch:' : 'Total transactions:'} <span className="font-bold text-slate-800">{product.progresses?.length || 0}</span>
            </div>

            {(!product.progresses || product.progresses.length === 0) ? (
              <p className="text-slate-400 text-xs italic">
                {language === 'vi' ? 'Chưa có thông tin lịch sử tiến trình đơn.' : 'No application history available.'}
              </p>
            ) : (
              <div className="relative pl-4 space-y-6">
                {/* Vertical timeline connector line */}
                <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-blue-100" />

                {product.progresses.map((prog: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4 group">
                    {/* Circle Dot with ring structure matching the design */}
                    <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    </div>

                    {/* Progress Detail */}
                    <div className="pt-1.5 space-y-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {prog.name}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                        {prog.slug}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'owner' && (
          <div className="space-y-4">
            {isOwnerLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-slate-400 text-xs">{language === 'vi' ? 'Đang tải dữ liệu...' : 'Loading...'}</p>
              </div>
            ) : ownerTrademarks.length === 0 ? (
              <p className="text-slate-400 text-xs italic">
                {language === 'vi' ? 'Không tìm thấy nhãn hiệu khác từ cùng chủ đơn này.' : 'No other trademarks found from this applicant.'}
              </p>
            ) : (
              <>
                {/* Header matching image */}
                <div className="text-sm font-semibold text-slate-500 mb-2">
                  {language === 'vi' 
                    ? `Tìm thấy ${ownerTrademarks.length} nhãn hiệu cùng chủ đơn`
                    : `Found ${ownerTrademarks.length} trademarks from the same applicant`}
                </div>

                <div className="space-y-4">
                  {ownerTrademarks.map((item: any) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          window.location.hash = `#/catalog/${item.slug}`;
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                        id={`trademark-card-${item.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Left brand image or gradient letter icon */}
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            {item.imagePath ? (
                              <img
                                src={item.imagePath}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${item.logoBg} flex items-center justify-center`}>
                                <span className="font-sans font-black text-lg tracking-wider text-white select-none">
                                  {item.logoText}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Brand Info */}
                          <div className="space-y-1">
                            <h4 className="font-sans font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wide group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono font-medium">
                              {item.applicationNo}
                            </p>
                            
                            {/* Class tag with Tag icon matching the image */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {item.classes && item.classes.map((cls: number) => (
                                <span
                                  key={cls}
                                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md"
                                >
                                  <Tag className="w-2.5 h-2.5 text-blue-500" />
                                  {cls}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right calendar and status */}
                        <div className="flex sm:flex-row items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.filingDate}</span>
                          </div>
                          
                          {/* Highly polished dynamic status badge */}
                          {item.statusText && (
                            <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full border ${
                              item.statusText.toLowerCase().includes('từ chối')
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : item.statusText.toLowerCase().includes('cấp bằng')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {item.statusText.toLowerCase().includes('từ chối') ? (
                                <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                              ) : item.statusText.toLowerCase().includes('cấp bằng') ? (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                              )}
                              {item.statusText}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
