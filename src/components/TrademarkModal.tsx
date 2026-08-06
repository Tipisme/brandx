import React, { useState } from 'react';
import { Trademark } from '../types';
import { TRADEMARK_CLASSES } from '../data';
import { X, Shield, Clock, FileText, Send, CheckCircle2, Coins, UserCheck, HelpCircle } from 'lucide-react';

interface TrademarkModalProps {
  trademark: Trademark | null;
  onClose: () => void;
  onAddToInterest: (id: string) => void;
  isInterested: boolean;
  niceClasses?: Record<number, { name: string; desc: string }>;
  language?: 'vi' | 'en';
}

import { isExpiredOrRefusedStatus, getTrademarkStatusDisplay } from '../utils/trademarkStatus';

export default function TrademarkModal({
  trademark,
  onClose,
  onAddToInterest,
  isInterested,
  niceClasses,
  language = 'vi'
}: TrademarkModalProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'negotiate'>('buy');
  
  const classes = niceClasses && Object.keys(niceClasses).length > 0 ? niceClasses : TRADEMARK_CLASSES;
  
  // Buy Form State
  const [buyName, setBuyName] = useState("");
  const [buyPhone, setBuyPhone] = useState("");
  const [buyEmail, setBuyEmail] = useState("");
  const [buyMessage, setBuyMessage] = useState("Tôi quan tâm đến nhãn hiệu này và muốn nhận thông tin chuyển nhượng chi tiết.");
  const [includeService, setIncludeService] = useState(true);
  const [buySubmitted, setBuySubmitted] = useState(false);

  // Negotiate Form State
  const [negName, setNegName] = useState("");
  const [negPhone, setNegPhone] = useState("");
  const [negPrice, setNegPrice] = useState<number>(0);
  const [negSubmitted, setNegSubmitted] = useState(false);

  if (!trademark) return null;

  // Format currency helper
  const formatVND = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ VND`;
    }
    return `${(price / 1000000).toLocaleString()} triệu VND`;
  };

  // Live price calculations
  const defaultPriceBillion = trademark.price / 1000000000;
  const initialNegPrice = negPrice || Math.round(trademark.price * 0.9);
  
  const estimatedTax = Math.round(initialNegPrice * 0.01); // 1% transfer tax
  const serviceFee = includeService ? 12000000 : 0; // 12 million fixed service fee
  const totalCost = initialNegPrice + estimatedTax + serviceFee;

  const handleBuySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyName || !buyPhone) return;
    setBuySubmitted(true);
  };

  const handleNegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!negName || !negPhone || !negPrice) return;
    setNegSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" id="trademark-modal">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full cursor-pointer transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header banner */}
        <div className={`w-full p-6 sm:p-8 bg-gradient-to-br ${trademark.logoBg} text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative shrink-0`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md">
                NHÃN HIỆU ĐỘC QUYỀN
              </span>
              {(() => {
                const statusDisp = getTrademarkStatusDisplay(trademark.statusText, trademark.progresses, language, trademark.filingDate);
                return (
                  <span className={`text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusDisp.badgeBg}`}>
                    {statusDisp.text}
                  </span>
                );
              })()}
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-black tracking-widest">{trademark.name}</h2>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] text-white/70 font-bold block uppercase tracking-wider leading-none">
              Giá Chuyển Nhượng Gốc
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block mt-1.5">
              {formatVND(trademark.price)}
            </span>
          </div>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Trademark Specs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Legal Summary Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                  Số Đơn SHTT
                </span>
                <span className="font-mono text-sm font-bold text-slate-800">
                  {trademark.applicationNo}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                  Ngày Nộp Đơn
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {trademark.filingDate}
                </span>
              </div>
            </div>

            {/* Trademark Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-orange-500" />
                Mô tả tài sản & Giá trị thương hiệu
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {trademark.description}
              </p>
            </div>

            {/* Goods Nice Classification Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-orange-500" />
                {language === 'vi' ? 'Danh mục Nhóm hàng Nice bảo hộ độc quyền' : 'Exclusive Nice Classification Goods List'}
              </h3>
              
              <div className="space-y-3">
                {trademark.classes.map((cls) => {
                  const info = classes[cls];
                  return (
                    <div key={cls} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-500 text-white font-bold px-2 py-0.5 rounded-md text-[10px]">
                          {language === 'vi' ? 'Nhóm' : 'Class'} {cls}
                        </span>
                        <strong className="text-slate-800 font-bold">{info?.name}</strong>
                      </div>
                      <p className="text-slate-500 leading-relaxed mt-1">
                        {info?.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
                <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block mb-1">
                  Chi tiết sản phẩm chỉ định cụ thể:
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {trademark.goodsDescription}
                </p>
              </div>
            </div>

            {/* Guarantees row */}
            <div className="border-t border-slate-100 pt-5 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-bold block mb-0.5">Sạch tranh chấp</strong>
                  <span className="text-slate-500">Đối chiếu 100% CSDL Cục SHTT.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 font-bold block mb-0.5">Ký hợp đồng ngay</strong>
                  <span className="text-slate-500">Hỗ trợ hồ sơ gốc từ chủ bằng gốc.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Form Panel */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab('buy')}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'buy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Liên hệ Đặt mua
                </button>
                <button
                  onClick={() => {
                    setActiveTab('negotiate');
                    if (negPrice === 0) {
                      setNegPrice(Math.round(trademark.price * 0.95)); // default proposal
                    }
                  }}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${activeTab === 'negotiate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Thương lượng giá
                </button>
              </div>

              {/* Tab 1: Standard Inquiry Buy Form */}
              {activeTab === 'buy' && (
                <div>
                  {buySubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans font-bold text-base text-slate-900">Yêu cầu đặt mua gửi thành công!</h4>
                      <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                        Chuyên viên sở hữu trí tuệ của BrandHub đã tiếp nhận yêu cầu cho nhãn hiệu <strong>{trademark.name}</strong>. Chúng tôi sẽ liên hệ trong vòng 2 giờ để tiến hành bàn giao hồ sơ pháp lý.
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200/50 rounded-lg p-2 max-w-[200px] mx-auto">
                        Mã giao dịch: BH-{(Math.random() * 100000).toFixed(0)}
                      </div>
                      <button
                        onClick={() => {
                          setBuySubmitted(false);
                          setBuyName("");
                          setBuyPhone("");
                          setBuyEmail("");
                        }}
                        className="text-xs text-orange-500 font-bold hover:underline cursor-pointer"
                      >
                        Gửi lại yêu cầu khác
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBuySubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Họ và tên của bạn <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={buyName}
                          onChange={(e) => setBuyName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Số điện thoại <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={buyPhone}
                            onChange={(e) => setBuyPhone(e.target.value)}
                            placeholder="Ví dụ: 090xxxxxxx"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                            Email (Nhận hợp đồng mẫu)
                          </label>
                          <input
                            type="email"
                            value={buyEmail}
                            onChange={(e) => setBuyEmail(e.target.value)}
                            placeholder="Ví dụ: name@company.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Lời nhắn gửi chuyên viên pháp lý
                        </label>
                        <textarea
                          rows={3}
                          value={buyMessage}
                          onChange={(e) => setBuyMessage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-500 resize-none"
                        />
                      </div>

                      {/* Fixed service addon checkbox */}
                      <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-start gap-3 text-xs">
                        <input
                          type="checkbox"
                          id="addon-service"
                          checked={includeService}
                          onChange={(e) => setIncludeService(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                        <label htmlFor="addon-service" className="cursor-pointer">
                          <strong className="text-slate-800 block">Dịch vụ Chuyển nhượng trọn gói (+12Tr VND)</strong>
                          <span className="text-slate-500 text-[11px] leading-normal block mt-0.5">
                            BrandHub sẽ thay mặt soạn hồ sơ, đóng nộp lệ phí Cục SHTT, bàn giao văn bằng gốc tại nhà.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-orange-500/10"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Gửi yêu cầu đặt mua
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 2: Negotiation Price Counter Form */}
              {activeTab === 'negotiate' && (
                <div>
                  {negSubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                        <Coins className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans font-bold text-base text-slate-900">Bản đề xuất giá đã được gửi!</h4>
                      <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                        Đề xuất mức giá <strong>{formatVND(negPrice)}</strong> cho nhãn hiệu <strong>{trademark.name}</strong> đang được chuyển đến chủ sở hữu văn bằng. Chúng tôi sẽ thông báo lại phản hồi qua điện thoại trong 12 giờ.
                      </p>
                      <button
                        onClick={() => {
                          setNegSubmitted(false);
                          setNegPrice(Math.round(trademark.price * 0.95));
                          setNegName("");
                          setNegPhone("");
                        }}
                        className="text-xs text-orange-500 font-bold hover:underline cursor-pointer"
                      >
                        Thương lượng mức giá khác
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleNegSubmit} className="space-y-4">
                      <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 text-xs">
                        <span className="text-slate-500 block mb-1">Mức giá đề xuất thương lượng (VND):</span>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="number"
                            min={Math.round(trademark.price * 0.5)}
                            max={Math.round(trademark.price * 1.5)}
                            value={negPrice}
                            step={10000000}
                            onChange={(e) => setNegPrice(parseInt(e.target.value) || 0)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 w-full focus:outline-none focus:border-orange-500"
                          />
                          <span className="text-xs font-bold text-orange-600 shrink-0">
                            {formatVND(negPrice)}
                          </span>
                        </div>

                        {/* Interactive pricing slider */}
                        <input
                          type="range"
                          min={Math.round(trademark.price * 0.7)}
                          max={Math.round(trademark.price * 1.1)}
                          step={10000000}
                          value={negPrice}
                          onChange={(e) => setNegPrice(parseInt(e.target.value))}
                          className="w-full accent-orange-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                          <span>70% Giá trị</span>
                          <span>110% Giá trị gốc</span>
                        </div>
                      </div>

                      {/* Live Fee Calculations Ledger */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2 text-xs">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-2">Bảng tạm tính thuế phí chuyển nhượng:</span>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Giá đề xuất mua:</span>
                          <span className="text-slate-800 font-bold">{formatVND(negPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Thuế thu nhập chuyển nhượng (1%):</span>
                          <span className="text-slate-800 font-bold">{formatVND(estimatedTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dịch vụ trọn gói BrandHub:</span>
                          <span className="text-slate-800 font-bold">{includeService ? "12,000,000 VND" : "Miễn phí"}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-2 flex justify-between text-slate-900">
                          <strong className="font-sans font-bold">Tổng chi phí dự kiến:</strong>
                          <strong className="text-orange-500 font-bold">{formatVND(totalCost)}</strong>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Họ tên người đề xuất <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={negName}
                          onChange={(e) => setNegName(e.target.value)}
                          placeholder="Ví dụ: Trần Văn B"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Số điện thoại liên hệ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={negPhone}
                          onChange={(e) => setNegPhone(e.target.value)}
                          placeholder="Nhập số điện thoại để trao đổi trực tiếp"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Đề xuất thương thảo giá này
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Interest Wishlist Trigger */}
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] leading-normal max-w-[180px] block">
                Quan tâm nhãn hiệu? Lưu lại để tiện gửi hàng loạt.
              </span>
              <button
                type="button"
                onClick={() => onAddToInterest(trademark.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isInterested
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isInterested ? '★ Đã Lưu Quan Tâm' : '☆ Lưu vào ưa thích'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer (Legal Support notice) */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 font-semibold">
            🛡 Bảo hộ độc quyền nhãn hiệu được giám sát bởi Hội đồng luật sư SHTT Việt Nam.
          </span>
          <a href="#workflow" onClick={onClose} className="text-orange-500 hover:underline font-bold">
            Tìm hiểu Quy trình chuyển nhượng an toàn Escrow &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
