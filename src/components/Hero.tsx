import { ArrowRight, ShieldCheck, Zap, Handshake } from 'lucide-react';

interface HeroProps {
  onScrollToCatalog: () => void;
  onOpenSellRequest: () => void;
}

export default function Hero({ onScrollToCatalog, onOpenSellRequest }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-red-950 via-amber-950 to-stone-900 text-white overflow-hidden" id="home">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 relative z-10">
        <div className="max-w-4xl">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Giải Pháp Thương Hiệu Độc Quyền Tốc Hành
          </div>

          {/* Heading */}
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight mb-6">
            TẠI SAO PHẢI CHỜ ĐỢI<br />
            KHI BẠN CÓ THỂ <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">SỞ HỮU NGAY</span>?
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed mb-8 max-w-3xl">
            Sở hữu nhãn hiệu & Bảo hộ sở hữu trí tuệ trực tuyến hàng đầu Việt Nam.
            Kết nối trực tiếp chủ thương hiệu – Giao dịch an toàn tuyệt đối – Thủ tục tinh gọn trong 72 giờ.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button
              onClick={onScrollToCatalog}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              MUA NGAY
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSellRequest}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              BÁN NGAY (KÝ GỬI)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics/Stats Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/[0.06] transition-colors duration-200">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">Nhãn hiệu sẵn có</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">1,204</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+15% tuần này</span>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/[0.06] transition-colors duration-200">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">Giao dịch thành công</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">88</span>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+5% tháng này</span>
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/[0.06] transition-colors duration-200">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold mb-1">Cộng đồng thành viên</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-white">4,500+</span>
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">User Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
