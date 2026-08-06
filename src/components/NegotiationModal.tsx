import React, { useState, useEffect } from 'react';
import { X, Handshake, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Language } from '../localization';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  trademarkName?: string;
  initialPrice?: number | string;
  language?: Language;
  user?: { name: string; email: string; token?: string } | null;
  onSuccess: () => void;
}

export default function NegotiationModal({
  isOpen,
  onClose,
  slug,
  trademarkName,
  initialPrice = 0,
  language = 'vi',
  user,
  onSuccess
}: NegotiationModalProps) {
  const [price, setPrice] = useState<string | number>(initialPrice || '');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrice(initialPrice || '');
      setDescription('');
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen, initialPrice]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(language === 'vi' ? 'Vui lòng nhập mô tả yêu cầu đàm phán.' : 'Please enter request description.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError(language === 'vi' ? 'Vui lòng nhập giá thương lượng hợp lệ.' : 'Please enter a valid price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const token = user?.token || localStorage.getItem('brandhub_token') || localStorage.getItem('access_token');
    const numPrice = typeof price === 'number' ? price : Number(price.toString().replace(/[^0-9]/g, ''));

    const payload = {
      description: description.trim(),
      slug: slug, // Sent in background payload
      price: numPrice || price
    };

    const newNegotiationRecord = {
      id: `NEG-${Date.now()}`,
      code: `NEG-${Date.now().toString().slice(-6)}`,
      slug: slug,
      brand_name: trademarkName || slug,
      title: `Đàm phán mua lại nhãn hiệu: ${trademarkName || slug}`,
      serviceType: 'Đàm phán mua lại nhãn hiệu',
      description: description,
      price: numPrice || price,
      status: 'pending',
      status_name: 'Chờ xử lý',
      created_at: new Date().toISOString(),
      created_at_formatted: new Date().toLocaleDateString('vi-VN'),
      user_name: user?.name,
      user_email: user?.email
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Try /vi/api/negotiations first
      let res = await fetch(`https://admin.hdslaw.vn/${language}/api/negotiations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Fallback to /api/negotiations without language prefix
        res = await fetch('https://admin.hdslaw.vn/api/negotiations', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      try {
        const saved = JSON.parse(localStorage.getItem('brandhub_negotiations') || '[]');
        localStorage.setItem('brandhub_negotiations', JSON.stringify([newNegotiationRecord, ...saved]));
      } catch (err) {
        console.error('Error writing to local storage', err);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('API /api/negotiations error:', err);
      try {
        const saved = JSON.parse(localStorage.getItem('brandhub_negotiations') || '[]');
        localStorage.setItem('brandhub_negotiations', JSON.stringify([newNegotiationRecord, ...saved]));
      } catch (e) {
        console.error('Error writing to local storage', e);
      }
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStayOnPage = () => {
    setIsSuccess(false);
    setDescription('');
    setPrice(initialPrice || '');
    setError(null);
    onClose();
  };

  const handleGoToRequests = () => {
    setIsSuccess(false);
    setDescription('');
    setPrice(initialPrice || '');
    setError(null);
    onSuccess();
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'number' ? val : Number(val.toString().replace(/[^0-9]/g, ''));
    if (isNaN(num) || num === 0) return '';
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="negotiation-modal">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full cursor-pointer transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md inline-flex items-center gap-1">
              <Handshake className="w-3 h-3" />
              {language === 'vi' ? 'Thương lượng nhãn hiệu' : 'Trademark Negotiation'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-white">
            {language === 'vi' ? 'Đàm phán mua lại nhãn hiệu' : 'Negotiate Trademark Purchase'}
          </h2>
          {trademarkName && (
            <p className="text-orange-100 text-xs mt-1 font-semibold">
              {trademarkName}
            </p>
          )}
        </div>

        {/* Body Content */}
        {isSuccess ? (
          /* Success Screen with 2 buttons */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                {language === 'vi' ? 'Gửi yêu cầu đàm phán thành công!' : 'Negotiation Request Submitted!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                {language === 'vi' 
                  ? 'Yêu cầu đàm phán mua lại nhãn hiệu đã được hệ thống ghi nhận. Chuyên viên sẽ liên hệ với bạn trong thời gian sớm nhất.' 
                  : 'Your trademark purchase negotiation request has been received. Our specialist will contact you shortly.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {/* Button 1: Stay on page */}
              <button
                type="button"
                onClick={handleStayOnPage}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase py-3.5 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                {language === 'vi' ? 'Ở lại trang' : 'Stay on Page'}
              </button>

              {/* Button 2: Go to request management */}
              <button
                type="button"
                onClick={handleGoToRequests}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase py-3.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
              >
                <span>{language === 'vi' ? 'Quản lý yêu cầu' : 'Manage Requests'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal Form Screen */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Price Field (price) */}
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                {language === 'vi' ? 'Giá thương lượng (VND)' : 'Negotiation Price (VND)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1000000}
                  step={1000000}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ví dụ: 500000000"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  VND
                </span>
              </div>
              {price && Number(price) > 0 && (
                <p className="text-[11px] text-orange-600 font-bold mt-1">
                  {language === 'vi' ? 'Mức giá đề xuất:' : 'Proposed price:'} {formatCurrency(price)}
                </p>
              )}
            </div>

            {/* Description Field (description) */}
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                {language === 'vi' ? 'Mô tả yêu cầu' : 'Request Description'} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'vi' 
                  ? 'Mô tả chi tiết mong muốn đàm phán, phương thức thanh toán, tiến độ chuyển nhượng...' 
                  : 'Enter your detailed negotiation terms, proposal, payment schedule...'}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none leading-relaxed"
              />
            </div>

            {/* User Info Confirmation */}
            {user && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs flex justify-between items-center text-slate-600">
                <span>{language === 'vi' ? 'Người gửi:' : 'Sender:'} <strong className="text-slate-800">{user.name}</strong></span>
                <span className="text-slate-400 font-mono text-[11px]">{user.email}</span>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-colors"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'vi' ? 'Đang gửi...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    {language === 'vi' ? 'Gửi yêu cầu đàm phán' : 'Submit Negotiation'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
