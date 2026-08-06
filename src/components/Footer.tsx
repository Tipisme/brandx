import React, { useState } from 'react';
import { Award, Mail, Phone, MapPin, Send, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import BrandixLogo from './BrandixLogo';

interface FooterProps {
  onOpenPolicy?: (docId: string) => void;
}

export default function Footer({ onOpenPolicy }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  const handleDocClick = (e: React.MouseEvent, docId: string) => {
    e.preventDefault();
    if (onOpenPolicy) {
      onOpenPolicy(docId);
    }
  };

  return (
    <footer className="bg-slate-950 text-gray-400 text-xs py-16 px-4 border-t border-slate-900" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Logo and Description */}
        <div className="md:col-span-4 space-y-4">
          <BrandixLogo theme="dark" size="md" variant="horizontal" showTagline={true} />

          <p className="text-gray-400 leading-relaxed text-[11px] max-w-sm">
            Nền tảng giao dịch, ký gửi và quản lý tài sản sở hữu trí tuệ số 1 tại Việt Nam. Được vận hành bởi đội ngũ luật sư đại diện sở hữu công nghiệp uy tín, bảo đảm 100% giao dịch an toàn và tối ưu thời gian.
          </p>

          <div className="space-y-2.5 text-gray-400 text-[11px] leading-relaxed">
            <div className="flex items-start gap-2 hover:text-white transition-colors">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span>Địa chỉ: Phòng 401, tầng 4, số 169 Nguyễn Ngọc Vũ, Yên Hòa, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Điện thoại: <a href="tel:0901727373" className="text-white font-bold hover:text-orange-400">0901727373</a></span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Email: <a href="mailto:hdslaw.vn@gmail.com" className="text-white hover:text-orange-400">hdslaw.vn@gmail.com</a></span>
            </div>

            <div className="pt-2 border-t border-slate-900/80 space-y-1 text-[10px] text-gray-400">
              <p><strong className="text-gray-300">Giám đốc:</strong> ĐOÀN MINH ĐỨC</p>
              <p><strong className="text-gray-300">MST:</strong> 0108553521</p>
              <p><strong className="text-gray-300">Giấy ĐKHĐ:</strong> Số 01021497/TP/ĐKHĐ cấp ngày 13/12/2018 tại Sở Tư pháp</p>
              <p><strong className="text-gray-300">Đại diện SHTT:</strong> Mã HNi-006 (475) cấp ngày 19/11/2025 tại Sở KH&CN</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs border-l-2 border-orange-500 pl-2">
            Giải pháp
          </h4>
          <ul className="space-y-2.5 text-[11px]">
            <li><a href="#catalog" className="hover:text-white transition-colors">Mua nhãn hiệu</a></li>
            <li><a href="#home" className="hover:text-white transition-colors">Ký gửi bán</a></li>
            <li><a href="#workflow" className="hover:text-white transition-colors">Đăng ký mới</a></li>
            <li><a href="#workflow" className="hover:text-white transition-colors">Gia hạn bằng</a></li>
            <li><a href="#why-brandhub" className="hover:text-white transition-colors">Tra cứu bảo hộ</a></li>
          </ul>
        </div>

        {/* Policies Section */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs border-l-2 border-orange-500 pl-2">
            Chính sách
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <button onClick={(e) => handleDocClick(e, 'dieu-khoan-su-dung')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Điều khoản sử dụng</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'chinh-sach-bao-mat')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Chính sách bảo mật</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'chinh-sach-gia')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Chính sách giá</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'chinh-sach-thanh-toan')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Chính sách thanh toán</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'chinh-sach-van-chuyen-giao-hang')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Chính sách vận chuyển & giao hàng</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'hinh-thuc-ho-tro-truc-tuyen')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Hình thức hỗ trợ trực tuyến</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'quy-trinh-giai-quyet-khieu-nai')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Quy trình giải quyết khiếu nại</span>
              </button>
            </li>
            <li>
              <button onClick={(e) => handleDocClick(e, 'huong_dan_tai_file')} className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Hướng dẫn tải file</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs border-l-2 border-orange-500 pl-2">
            Nhận bản tin SHTT
          </h4>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            Đăng ký để nhận các thông tin cảnh báo nhãn hiệu bị xâm phạm và thay đổi luật SHTT mới nhất.
          </p>

          {subscribed ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Đã đăng ký bản tin thành công.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 items-center focus-within:border-orange-500 transition-colors">
              <input
                type="email"
                required
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent flex-1 outline-none text-xs text-white px-3 placeholder:text-gray-500"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg font-bold cursor-pointer transition-colors"
                title="Đăng ký"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="text-[10px] text-gray-500 leading-normal">
            Bảo mật thông tin tuyệt đối. Bằng việc đăng ký, bạn đồng ý với các chính sách của HDS Law.
          </div>
        </div>
      </div>

      {/* Centered Copyright Line */}
      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-12 pt-8 text-center text-gray-500 text-[11px]">
        <p>© 2026 Brandix Việt Nam. All rights reserved. Vận hành bởi Công ty Luật HDS.</p>
      </div>
    </footer>
  );
}

