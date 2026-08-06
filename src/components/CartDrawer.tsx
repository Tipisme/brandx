import React, { useState } from 'react';
import { Trademark } from '../types';
import { X, Trash2, Send, CheckCircle2, Award, Heart } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrademarks: Trademark[];
  onRemoveTrademark: (id: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  savedTrademarks,
  onRemoveTrademark
}: CartDrawerProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  // Format currency helper
  const formatVND = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ VND`;
    }
    return `${(price / 1000000).toLocaleString()} triệu VND`;
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || savedTrademarks.length === 0) return;
    setSubmitted(true);
  };

  const totalPrice = savedTrademarks.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end" id="cart-drawer">
      {/* Backdrop overlay trigger for close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
        
        {/* Header Drawer */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-sans font-bold text-sm block tracking-wide uppercase">
              Nhãn Hiệu Đang Quan Tâm ({savedTrademarks.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-sans font-bold text-base text-slate-900">Đã tiếp nhận yêu cầu hàng loạt!</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Hệ thống đã gom nhóm và tiếp nhận yêu cầu chuyển nhượng cho <strong>{savedTrademarks.length} nhãn hiệu</strong> của quý khách. Chuyên viên sẽ chuẩn bị hồ sơ pháp lý song song cho tất cả các nhãn hiệu này và gọi tư vấn gộp.
              </p>
              <div className="text-[10px] text-slate-400 font-mono bg-slate-50 rounded-lg p-2 border border-slate-200">
                Bộ mã hồ sơ: BHC-{(Math.random()*10000).toFixed(0)}
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setPhone("");
                  onClose();
                }}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Trở lại Sàn Giao Dịch
              </button>
            </div>
          ) : savedTrademarks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-slate-800 font-bold text-sm">Chưa có nhãn hiệu lưu quan tâm</h4>
              <p className="text-slate-500 text-xs max-w-xs mx-auto leading-normal">
                Hãy dạo quanh sàn giao dịch và bấm biểu tượng trái tim để lưu lại các thương hiệu tiềm năng mà bạn thích.
              </p>
              <button
                onClick={onClose}
                className="text-xs text-orange-500 font-bold hover:underline cursor-pointer"
              >
                Dạo xem nhãn hiệu ngay &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Danh sách tuyển chọn của bạn:</span>
              
              {savedTrademarks.map((tm) => (
                <div key={tm.id} className="border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Small visual card */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tm.logoBg} flex items-center justify-center text-white shrink-0`}>
                      <span className="text-[10px] font-black tracking-wide truncate max-w-[34px] uppercase">{tm.name}</span>
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">{tm.name}</strong>
                      <span className="text-[10px] text-slate-500 block">Số đơn: {tm.applicationNo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-orange-500 font-mono">
                      {formatVND(tm.price)}
                    </span>
                    <button
                      onClick={() => onRemoveTrademark(tm.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consolidated Inquiry Form at Bottom */}
        {savedTrademarks.length > 0 && !submitted && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Số lượng nhãn hiệu:</span>
                <span>{savedTrademarks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <strong className="font-bold text-slate-800">Tổng giá trị đề xuất:</strong>
                <strong className="text-orange-500 font-extrabold">{formatVND(totalPrice)}</strong>
              </div>
            </div>

            {/* Inquire All Form */}
            <form onSubmit={handleBulkSubmit} className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-t border-slate-200/50 pt-3">
                Nhận hồ sơ pháp lý gộp trọn gói:
              </span>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên của bạn..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  placeholder="Nhập số điện thoại liên hệ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Yêu cầu tư vấn tất cả {savedTrademarks.length} nhãn hiệu
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
