import React, { useState } from 'react';
import { Search, FileSignature, Landmark, MailCheck, ChevronRight, HelpCircle } from 'lucide-react';

interface Step {
  num: number;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  milestones: string[];
  duration: string;
  documentRequired: string;
}

export default function Workflow() {
  const [activeStep, setActiveStep] = useState(1);

  const steps: Step[] = [
    {
      num: 1,
      title: "Tìm Kiếm & Lựa Chọn",
      desc: "Tra cứu cơ sở dữ liệu hàng ngàn nhãn hiệu đã bảo hộ sẵn trên BrandHub theo nhu cầu ngành nghề.",
      icon: Search,
      milestones: [
        "Tra cứu nhãn hiệu theo từ khóa mong muốn",
        "Lọc theo Nhóm Nice liên quan đến mặt hàng kinh doanh",
        "Xem chi tiết pháp lý, số đơn, ngày cấp và tình trạng bằng gốc",
        "Yêu cầu chuyên viên tư vấn gửi bảng đánh giá khả năng tương thích"
      ],
      duration: "Ngay lập tức",
      documentRequired: "Không yêu cầu (Miễn phí hoàn toàn)"
    },
    {
      num: 2,
      title: "Đàm Phán & Đăng Ký",
      desc: "Thương lượng giá trực tiếp với chủ nhãn hiệu và lựa chọn hình thức chuyển nhượng trọn gói.",
      icon: FileSignature,
      milestones: [
        "Đề xuất giá mua trực tiếp qua nút 'Thương lượng giá'",
        "Hệ thống tự động liên kết kết nối hai đầu chủ văn bằng",
        "Chốt phương án giá chuyển nhượng cuối cùng",
        "Xác nhận thỏa thuận chuyển nhượng 3 bên cùng BrandHub"
      ],
      duration: "1 - 2 ngày làm việc",
      documentRequired: "CCCD (Cá nhân) hoặc Đăng ký kinh doanh (Doanh nghiệp)"
    },
    {
      num: 3,
      title: "Hợp Đồng & Ký Quỹ",
      desc: "Ký kết hợp đồng chuyển nhượng chính thức tại VP Công chứng và nộp tiền ký quỹ an toàn.",
      icon: Landmark,
      milestones: [
        "BrandHub soạn thảo bộ hợp đồng chuyển nhượng nhãn hiệu chuẩn Cục SHTT",
        "Ký kết hợp đồng công chứng chuyển nhượng tại VP Công chứng",
        "Nộp tiền thanh toán vào tài khoản ký quỹ phong tỏa của Ngân hàng liên kết",
        "Cục SHTT tiếp nhận hồ sơ và đóng dấu biên nhận chuyển nhượng"
      ],
      duration: "2 - 3 ngày làm việc",
      documentRequired: "Hợp đồng chuyển nhượng có chữ ký và công chứng"
    },
    {
      num: 4,
      title: "Nhận Bằng & Hoàn Tất",
      desc: "Cục SHTT ghi nhận chủ sở hữu mới trên Văn bằng bảo hộ. Bàn giao Giấy chứng nhận gốc.",
      icon: MailCheck,
      milestones: [
        "BrandHub theo dõi tiến trình xử lý hồ sơ tại Cục SHTT",
        "Khai thác quyền thương mại ngay khi có Biên nhận nộp hồ sơ hợp lệ",
        "Cục SHTT ban hành Quyết định ghi nhận chuyển nhượng nhãn hiệu",
        "Nhận Giấy chứng nhận gốc và cấp phôi tên chủ sở hữu mới"
      ],
      duration: "3 - 5 tháng (Cục SHTT) - Quyền kinh doanh có hiệu lực ngay khi ký",
      documentRequired: "Quyết định ghi nhận chuyển nhượng của Cục SHTT"
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="workflow">
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-2">Quy Trình Chuẩn Hóa</span>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight mb-4 text-white">
            Giao Dịch Đơn Giản & Bảo Mật Tuyệt Đối
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Quy trình chuyển nhượng quyền sở hữu nhãn hiệu chuyên nghiệp được giám sát trực tiếp bởi các luật sư Sở hữu Trí tuệ.
          </p>
        </div>

        {/* 4 Steps timeline cards top */}
        <div className="relative mb-14">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-slate-800 -translate-y-1/2 hidden lg:block z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.num === activeStep;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
                    isActive
                      ? 'bg-slate-800 border-orange-500 shadow-xl shadow-orange-500/5 scale-[1.03] text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                  }`}
                >
                  <div>
                    {/* Circle Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.num}
                      </div>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                    </div>

                    <h3 className="text-sm font-bold block text-white mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                    <span>Xem chi tiết bước này</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Step Detailed Dashboard */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Milestones */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-md">
                  Chi Tiết Bước {activeStep}
                </span>
                <h4 className="text-lg font-bold text-white">Các dấu mốc quan trọng</h4>
              </div>

              <div className="space-y-4">
                {steps[activeStep - 1].milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-slate-300">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Quick Stats / Requirements */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                Thông tin bổ sung giai đoạn {activeStep}
              </h4>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1 uppercase font-semibold">Thời gian ước tính:</span>
                  <span className="text-white font-bold text-sm block">{steps[activeStep - 1].duration}</span>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-slate-500 block mb-1 uppercase font-semibold">Giấy tờ hai bên cần chuẩn bị:</span>
                  <span className="text-white font-bold text-sm block">{steps[activeStep - 1].documentRequired}</span>
                </div>

                <div className="border-t border-slate-800 pt-3 bg-orange-500/5 rounded-xl p-3 border border-orange-500/10">
                  <p className="text-[11px] text-orange-300 leading-relaxed">
                    💡 <strong>Lưu ý của BrandHub:</strong> Khách hàng mua lại nhãn hiệu luôn được ký kết điều khoản bồi hoàn 100% chi phí chuyển nhượng trong trường hợp có bất kỳ lỗi hành chính nào từ phía chủ văn bằng gốc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
