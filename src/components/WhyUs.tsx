import React, { useState } from 'react';
import { Shield, Clock, BadgeCheck, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface Benefit {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<any>;
  details: string;
  colorClass: string;
}

export default function WhyUs() {
  const [activeTab, setActiveTab] = useState('legal');

  const benefits: Benefit[] = [
    {
      id: 'legal',
      title: 'Bảo Vệ Pháp Lý Tuyệt Đối',
      shortDesc: 'Tránh hoàn toàn rủi ro tranh chấp xâm phạm thương quyền.',
      icon: Shield,
      details: 'Sở hữu ngay sự bảo hộ pháp lý tức thời với các nhãn hiệu đã được Cục Sở Hữu Trí Tuệ cấp Văn bằng bảo hộ độc quyền độc lập. Bảo vệ hoạt động kinh doanh của bạn khỏi các hành vi làm giả, làm nhái và các vấn đề pháp lý phức tạp khác. Bắt đầu kinh doanh một cách yên tâm khi biết rằng tài sản sở hữu trí tuệ của bạn được an toàn tuyệt đối dưới sự bảo trợ của Luật SHTT Việt Nam.',
      colorClass: 'from-orange-500 to-amber-600'
    },
    {
      id: 'instant',
      title: 'Sở Hữu Ngay Lập Tức',
      shortDesc: 'Bắt đầu bán hàng và nhượng quyền kinh doanh trong 3 ngày.',
      icon: Clock,
      details: 'Thay vì chờ đợi từ 18 đến 24 tháng đối với một đơn đăng ký nhãn hiệu thông thường với tỷ lệ rủi ro bị từ chối cực kỳ cao, việc mua lại nhãn hiệu đã bảo hộ sẵn cho phép bạn ký hợp đồng khai thác thương mại và sở hữu ngay trong vòng vài ngày. Giúp doanh nghiệp của bạn chớp lấy cơ hội vàng trên thị trường nhanh gấp 200 lần.',
      colorClass: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'approved',
      title: 'Nhãn Hiệu Đã Phê Duyệt',
      shortDesc: '100% nhãn hiệu đã có văn bằng bảo hộ độc quyền từ Cục SHTT.',
      icon: BadgeCheck,
      details: 'Tất cả các nhãn hiệu nằm trong danh mục giao dịch chính của BrandHub đều đã được cấp Văn bằng bảo hộ (Giấy chứng nhận đăng ký nhãn hiệu) có giá trị pháp lý hiện hữu, còn nguyên thời hạn sử dụng. Bạn loại bỏ hoàn toàn khả năng bị bên thứ ba phản đối đơn hoặc bị thẩm định viên từ chối cấp bằng do trùng lắp ngành hàng.',
      colorClass: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'verified',
      title: 'Danh Sách Xác Thực 3 Lớp',
      shortDesc: 'Kiểm tra chủ sở hữu gốc và phân loại nhóm Nice chuẩn quốc tế.',
      icon: FileCheck,
      details: 'Đội ngũ luật sư sở hữu trí tuệ của chúng tôi trực tiếp kiểm định hồ sơ, đối chiếu dữ liệu gốc của Cục SHTT Việt Nam và tổ chức SHTT Thế giới (WIPO). Đảm bảo nhãn hiệu không bị tranh chấp, không thế chấp, không nằm trong danh sách thi hành án và được phân nhóm danh mục sản phẩm/dịch vụ theo Thỏa ước Nice chính xác 100%.',
      colorClass: 'from-purple-600 to-violet-700'
    },
    {
      id: 'secure',
      title: 'Ký Quỹ Chuyển Giao An Toàn',
      shortDesc: 'Bảo vệ dòng tiền qua tài khoản trung gian của Ngân hàng liên kết.',
      icon: CheckCircle2,
      details: 'An toàn tài chính tối đa với hệ thống thanh toán ký quỹ (Escrow). Người mua chuyển tiền vào tài khoản phong tỏa của Ngân hàng đối tác. BrandHub và các bên tiến hành nộp hồ sơ chuyển nhượng văn bằng bảo hộ lên Cục SHTT. Dòng tiền chỉ được giải ngân cho người bán sau khi hồ sơ nhận đơn hợp lệ được ghi nhận chính thức, đảm bảo quyền lợi tuyệt đối cho đôi bên.',
      colorClass: 'from-rose-600 to-pink-700'
    }
  ];

  const activeBenefit = benefits.find(b => b.id === activeTab) || benefits[0];
  const ActiveIcon = activeBenefit.icon;

  return (
    <section className="py-20 bg-slate-50" id="why-brandhub">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">Giá Trị Cốt Lõi</span>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-slate-950 tracking-tight mb-4">
            Tại Sao Nên Sở Hữu Thương Hiệu Từ BrandHub?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Tiết kiệm thời gian, loại bỏ rủi ro pháp lý và tạo dựng lợi thế cạnh tranh áp đảo ngay từ ngày đầu tiên thành lập doanh nghiệp của bạn.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Navigation Buttons List */}
          <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              const isActive = benefit.id === activeTab;
              return (
                <button
                  key={benefit.id}
                  onClick={() => setActiveTab(benefit.id)}
                  className={`w-full text-left p-4.5 rounded-2xl flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-md border-l-4 border-orange-500 translate-x-2'
                      : 'bg-transparent hover:bg-white/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isActive ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold block ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {benefit.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Highlight Card */}
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
                  <span className="text-[11px] font-bold text-slate-400 border border-slate-800 rounded-full px-3 py-1 bg-slate-950/40">
                    BẢO HỘ PHÁP LÝ CHÍNH THỨC
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                  {activeBenefit.title}
                </h3>

                {/* Card Detailed Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {activeBenefit.details}
                </p>

                {/* Key feature list bullet */}
                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>Đại diện làm thủ tục trọn gói miễn phí</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>Đền bù 100% nếu phát sinh lỗi chuyển nhượng chủ thể</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    <span>Hợp đồng được công chứng tại Văn phòng Công chứng nhà nước</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs text-slate-400">
                  Phù hợp cho cả: <strong className="text-white">Cá nhân & Tổ chức</strong>
                </span>
                <a
                  href="#catalog"
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
