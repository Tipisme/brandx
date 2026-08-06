import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  ChevronRight, 
  Search, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  CreditCard, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import mammoth from 'mammoth';

export interface PolicyDoc {
  id: string;
  title: string;
  filename: string;
  icon: React.ElementType;
  description: string;
  lastUpdated: string;
  content: string;
}

export const POLICY_DOCUMENTS: PolicyDoc[] = [
  {
    id: 'dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    filename: 'dieu-khoan-su-dung.docx',
    icon: ShieldCheck,
    description: 'Quy định và điều khoản chung khi truy cập và sử dụng dịch vụ Brandix - HDS Law.',
    lastUpdated: '15/01/2026',
    content: `
      <h2>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN SỬ DỤNG DỊCH VỤ</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS (HDS LAW FIRM)</strong></p>
      <p><em>MST: 0108553521 | Giấy ĐKHĐ: Số 01021497/TP/ĐKHĐ | Đại diện SHTT: Mã HNi-006 (475)</em></p>
      <hr/>
      <h3>1. QUY ĐỊNH CHUNG</h3>
      <p>Chào mừng Quý khách hàng đến với Nền tảng Giao dịch & Đăng ký Nhãn hiệu Trực tuyến Brandix, được vận hành chính thức bởi Công ty Luật HDS. Khi truy cập và thực hiện bất kỳ giao dịch nào trên nền tảng, Quý khách được coi là đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dịch vụ này.</p>

      <h3>2. PHẠM VI DỊCH VỤ DỰ ÁN BRANDIX</h3>
      <ul>
        <li><strong>Tra cứu & Đánh giá khả năng bảo hộ nhãn hiệu:</strong> Cung cấp kết quả tra cứu sơ bộ và tra cứu chuyên sâu từ cơ sở dữ liệu quốc gia Cục Sở hữu Trí tuệ.</li>
        <li><strong>Đăng ký nhãn hiệu trực tuyến:</strong> Tiếp nhận hồ sơ, soạn thảo văn bản pháp lý và đại diện nộp đơn tại Cục SHTT.</li>
        <li><strong>Sàn giao dịch & Chuyển nhượng nhãn hiệu:</strong> Kết nối bên bán và bên mua nhãn hiệu đã được cấp bằng độc quyền hoặc đang trong quá trình nộp đơn.</li>
      </ul>

      <h3>3. QUYỀN VÀ TRÁCH NHIỆM CỦA KHÁCH HÀNG</h3>
      <p>- Cung cấp thông tin nhãn hiệu, giấy tờ pháp lý (ĐKKD, CCCD) chính xác và trung thực.</p>
      <p>- Thực hiện nghĩa vụ thanh toán chi phí nộp đơn và phí dịch vụ theo đúng hạn cam kết.</p>
      <p>- Không sử dụng nền tảng cho các mục đích gian lận, vi phạm quyền sở hữu trí tuệ của bên thứ ba.</p>

      <h3>4. CAM KẾT VÀ NGHĨA VỤ CỦA HDS LAW</h3>
      <p>- Bảo mật tuyệt đối mọi thông tin đề xuất nhãn hiệu và dữ liệu cá nhân của khách hàng.</p>
      <p>- Đảm bảo toàn bộ quy trình chuyên môn được thực hiện trực tiếp bởi các Luật sư và Chuyên gia đại diện SHTT được cấp phép.</p>
      <p>- Hoàn tiền hoặc hỗ trợ nộp lại theo chính sách cam kết chất lượng của HDS Law.</p>

      <h3>5. GIẢI QUYẾT TRANH CHẤP</h3>
      <p>Mọi tranh chấp phát sinh từ việc sử dụng dịch vụ trước hết sẽ được giải quyết thông qua thương lượng, hòa giải. Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại Hà Nội để giải quyết theo quy định pháp luật Việt Nam.</p>
    `
  },
  {
    id: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    filename: 'chinh-sach-bao-mat.docx',
    icon: ShieldCheck,
    description: 'Cam kết bảo mật thông tin cá nhân và tài sản dữ liệu nhãn hiệu của khách hàng.',
    lastUpdated: '15/01/2026',
    content: `
      <h2>CHÍNH SÁCH BẢO MẬT THÔNG TIN VÀ DỮ LIỆU KHÁCH HÀNG</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. MỤC ĐÍCH THU THẬP THÔNG TIN</h3>
      <p>HDS Law thu thập thông tin khách hàng nhằm các mục đích sau:</p>
      <ul>
        <li>Xác minh danh tính chủ sở hữu nhãn hiệu và đại diện pháp luật.</li>
        <li>Lập hồ sơ đăng ký nhãn hiệu chính thức gửi Cục Sở hữu Trí tuệ.</li>
        <li>Cung cấp mã tra cứu đơn hàng và trạng thái cấp bằng trực tuyến.</li>
        <li>Gửi thông báo gia hạn, nhắc nhở thời hạn duy trì hiệu lực bằng độc quyền.</li>
      </ul>

      <h3>2. PHẠM VI THU THẬP DỮ LIỆU</h3>
      <p>- Thông tin cá nhân/tổ chức: Tên chủ đơn, Mã số thuế/CCCD, Địa chỉ, Số điện thoại, Email.</p>
      <p>- Thông tin nhãn hiệu: Tên nhãn hiệu đề xuất, tệp ảnh mẫu thiết kế, danh mục nhóm sản phẩm/dịch vụ (Nice classification).</p>

      <h3>3. CAM KẾT AN TOÀN VÀ BẢO MẬT</h3>
      <p>Chúng tôi cam kết sử dụng các biện pháp mã hóa cao nhất để bảo vệ dữ liệu. HDS Law <strong>KHÔNG</strong> bán, chia sẻ hoặc tiết lộ thông tin nhãn hiệu đề xuất của khách hàng cho bất kỳ bên thứ ba nào khi chưa nộp đơn chính thức tại Cục SHTT.</p>

      <h3>4. QUẢN LÝ THÔNG TIN CÁ NHÂN</h3>
      <p>Khách hàng có quyền đăng nhập vào tài khoản trên hệ thống Brandix để kiểm tra, cập nhật hoặc yêu cầu xóa bỏ thông tin cá nhân bất kỳ lúc nào.</p>
    `
  },
  {
    id: 'chinh-sach-gia',
    title: 'Chính sách giá',
    filename: 'chinh-sach-gia.docx',
    icon: DollarSign,
    description: 'Bảng giá dịch vụ tra cứu, đăng ký và chuyển nhượng nhãn hiệu minh bạch.',
    lastUpdated: '01/02/2026',
    content: `
      <h2>CHÍNH SÁCH GIÁ VÀ CHI PHÍ ĐĂNG KÝ NHÃN HIỆU</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. NGUYÊN TẮC TÍNH PHÍ DỊCH VỤ</h3>
      <p>Biểu phí đăng ký nhãn hiệu tại HDS Law được xây dựng minh bạch, công khai, bao gồm cả lệ phí nhà nước (Cục Sở hữu Trí tuệ) và phí đại diện sở hữu công nghiệp.</p>

      <h3>2. BIỂU PHÍ THAM KHẢO</h3>
      <table style="width:100%; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 13px;">
        <thead style="background-color: #f8fafc;">
          <tr>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Hạng mục dịch vụ</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Đơn giá (VND)</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Đăng ký nhãn hiệu (Nhóm 1)</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #ea580c;">1.500.000 ₫</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Bao gồm phí nộp đơn & tra cứu sơ bộ</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Nhóm sản phẩm/dịch vụ thứ 2 trở đi</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #ea580c;">1.000.000 ₫ / nhóm</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Ưu đãi giảm giá cho nhóm bổ sung</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Tra cứu chuyên sâu Luật sư</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #16a34a;">Miễn phí</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Áp dụng khi nộp đơn qua HDS Law</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 15px;">3. CAM KẾT KHÔNG PHÁT SINH PHÍ ẨN</h3>
      <p>HDS Law cam kết báo giá trọn gói 100%. Khách hàng không phải trả thêm bất kỳ khoản phụ phí nào trong suốt quá trình thẩm định hình thức và nội dung đơn.</p>
    `
  },
  {
    id: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    filename: 'chinh-sach-thanh-toan.docx',
    icon: CreditCard,
    description: 'Các hình thức thanh toán trực tuyến, chuyển khoản ngân hàng và xuất hóa đơn VAT.',
    lastUpdated: '10/01/2026',
    content: `
      <h2>CHÍNH SÁCH VÀ HƯỚNG DẪN THANH TOÁN</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. PHƯƠNG THỨC THANH TOÁN</h3>
      <p>Khách hàng có thể lựa chọn thanh toán qua các kênh chính thức sau:</p>
      <ul>
        <li><strong>Chuyển khoản Ngân hàng (VietQR):</strong> Nhanh chóng, tự động xác nhận đơn hàng 24/7.</li>
        <li><strong>Thanh toán trực tiếp:</strong> Tại văn phòng HDS Law - Phòng 401, tầng 4, số 169 Nguyễn Ngọc Vũ, Yên Hòa, Hà Nội.</li>
      </ul>

      <h3>2. THÔNG TIN TÀI KHOẢN NGÂN HÀNG THỤ HƯỞNG</h3>
      <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 12px; border-radius: 12px; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Tên Tài Khoản:</strong> CÔNG TY LUẬT HDS</p>
        <p style="margin: 4px 0;"><strong>Số Tài Khoản:</strong> <span style="color: #ea580c; font-weight: bold;">0388299999</span></p>
        <p style="margin: 4px 0;"><strong>Ngân Hàng:</strong> Ngân hàng TMCP Quân Đội (MBBank)</p>
        <p style="margin: 4px 0;"><strong>Cú pháp chuyển khoản:</strong> [Mã đơn hàng / Số điện thoại]</p>
      </div>

      <h3 style="margin-top: 15px;">3. XUẤT HÓA ĐƠN TÀI CHÍNH (VAT)</h3>
      <p>HDS Law cung cấp hóa đơn điện tử hợp pháp cho doanh nghiệp và cá nhân ngay sau khi hoàn tất giao dịch thanh toán.</p>
    `
  },
  {
    id: 'chinh-sach-van-chuyen-giao-hang',
    title: 'Chính sách vận chuyển & giao nhận',
    filename: 'chinh-sach-van-chuyen-giao-hang.docx',
    icon: Truck,
    description: 'Quy trình bàn giao Tờ khai nộp đơn gốc và Bằng bảo hộ độc quyền tận tay khách hàng.',
    lastUpdated: '05/01/2026',
    content: `
      <h2>CHÍNH SÁCH BÀN GIAO TÀI LIỆU VÀ BẰNG ĐỘC QUYỀN</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. PHƯƠNG THỨC GIAO NHẬN TÀI LIỆU</h3>
      <p>Tất cả văn bản pháp lý chính thức từ Cục Sở hữu Trí tuệ (Tờ khai có dấu nhận đơn, Quyết định chấp nhận đơn hợp lệ, Giấy chứng nhận đăng ký nhãn hiệu gốc) sẽ được HDS Law bàn giao như sau:</p>
      <ul>
        <li><strong>File điện tử (PDF/Scan):</strong> Gửi trực tiếp qua Email & Zalo của khách hàng ngay trong ngày làm việc.</li>
        <li><strong>Văn bản gốc bằng giấy:</strong> Chuyển phát nhanh đảm bảo tận nhà/văn phòng khách hàng trên toàn quốc.</li>
      </ul>

      <h3>2. CHI PHÍ VẬN CHUYỂN</h3>
      <p>- <strong>Miễn phí 100%:</strong> Giao nhận tài liệu trên toàn quốc đối với tất cả đơn hàng nộp qua nền tảng Brandix.</p>
      <p>- Thời gian vận chuyển: 1 - 2 ngày làm việc (Nội thành Hà Nội & TP.HCM), 2 - 4 ngày làm việc (các tỉnh thành khác).</p>
    `
  },
  {
    id: 'hinh-thuc-ho-tro-truc-tuyen',
    title: 'Hình thức hỗ trợ trực tuyến',
    filename: 'hinh-thuc-ho-tro-truc-tuyen.docx',
    icon: HelpCircle,
    description: 'Các kênh tư vấn pháp lý SHTT trực tuyến 24/7 từ đội ngũ Luật sư HDS Law.',
    lastUpdated: '20/01/2026',
    content: `
      <h2>KÊNH TƯ VẤN VÀ HỖ TRỢ TRỰC TUYẾN 24/7</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. CÁC KÊNH TƯ VẤN CHÍNH THỨC</h3>
      <ul>
        <li><strong>Hotline / Zalo tư vấn Luật sư:</strong> <a href="tel:0901727373">0901727373</a></li>
        <li><strong>Email tiếp nhận yêu cầu:</strong> <a href="mailto:hdslaw.vn@gmail.com">hdslaw.vn@gmail.com</a></li>
        <li><strong>Trực tiếp tại văn phòng:</strong> Phòng 401, tầng 4, số 169 Nguyễn Ngọc Vũ, Yên Hòa, Hà Nội (Giờ hành chính từ Thứ 2 đến Thứ 6).</li>
      </ul>

      <h3>2. THỜI GIAN PHẢN HỒI</h3>
      <p>- Kênh Hotline / Zalo: Phản hồi tức thì (8:00 - 21:00 hàng ngày).</p>
      <p>- Yêu cầu qua Email / Form tra cứu: Luật sư phản hồi kết quả chuyên sâu trong vòng 2 - 4 giờ làm việc.</p>
    `
  },
  {
    id: 'quy-trinh-giai-quyet-khieu-nai',
    title: 'Quy trình giải quyết khiếu nại',
    filename: 'quy-trinh-giai-quyet-khieu-nai.docx',
    icon: AlertTriangle,
    description: 'Quy trình tiếp nhận, xử lý và hỗ trợ giải quyết phản ánh của khách hàng.',
    lastUpdated: '12/01/2026',
    content: `
      <h2>QUY TRÌNH TIẾP NHẬN VÀ GIẢI QUYẾT KHIẾU NẠI</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <h3>1. NGUYÊN TẮC GIẢI QUYẾT</h3>
      <p>HDS Law luôn coi trọng sự hài lòng của khách hàng. Mọi khiếu nại, phản ánh về chất lượng tư vấn hay tiến độ xử lý đơn đều được tiếp nhận công bằng, minh bạch và giải quyết thỏa đáng.</p>

      <h3>2. CÁC BƯỚC XỬ LÝ KHIẾU NẠI</h3>
      <ol>
        <li><strong>Bước 1 - Tiếp nhận thông tin:</strong> Khách hàng gửi phản ánh qua email hdslaw.vn@gmail.com hoặc hotline 0901727373.</li>
        <li><strong>Bước 2 - Xác minh & Thẩm tra:</strong> Trưởng bộ phận SHTT thẩm tra hồ sơ và trao đổi trực tiếp với Luật sư phụ trách trong vòng 24h.</li>
        <li><strong>Bước 3 - Phản hồi phương án:</strong> Đưa ra giải pháp khắc phục, đền bù hoặc hỗ trợ miễn phí dịch vụ phát sinh cho khách hàng.</li>
      </ol>
    `
  },
  {
    id: 'huong_dan_tai_file',
    title: 'Hướng dẫn tải file & tra cứu',
    filename: 'huong_dan_tai_file.txt',
    icon: FileText,
    description: 'Hướng dẫn chi tiết cách tải về và mở các tài liệu pháp lý định dạng .docx / .txt.',
    lastUpdated: '01/02/2026',
    content: `
      <h2>HƯỚNG DẪN TẢI VÀ TRA CỨU TÀI LIỆU PHÁP LÝ HDS LAW</h2>
      <p><strong>CÔNG TY LUẬT TNHH HDS</strong></p>
      <hr/>
      <p><strong>1. Quyền truy cập:</strong> Tất cả tài liệu chính sách, điều khoản và quy trình của HDS Law được công khai minh bạch.</p>
      <p><strong>2. Tải về:</strong> Nhấp vào nút "Tải về (.docx / .txt)" ở thanh công cụ phía trên của trình xem trước để lưu file về máy tính hoặc điện thoại.</p>
      <p><strong>3. Đọc file:</strong> Quý khách có thể xem trực tiếp nội dung trên trình duyệt hoặc mở bằng Microsoft Word, Google Docs hay ứng dụng đọc văn bản bất kỳ.</p>
      <p><strong>4. Hỗ trợ kỹ thuật:</strong> Liên hệ Tổng đài 0901727373 nếu gặp trục trặc khi tải văn bản.</p>
    `
  }
];

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocId?: string;
}

export default function PolicyModal({ isOpen, onClose, initialDocId = 'dieu-khoan-su-dung' }: PolicyModalProps) {
  const [activeDocId, setActiveDocId] = useState<string>(initialDocId);
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  const activeDoc = POLICY_DOCUMENTS.find(d => d.id === activeDocId) || POLICY_DOCUMENTS[0];

  useEffect(() => {
    if (initialDocId) {
      setActiveDocId(initialDocId);
    }
  }, [initialDocId]);

  // Attempt to fetch docx / text file from public/documents/ if available
  useEffect(() => {
    if (!isOpen || !activeDoc) return;

    let isMounted = true;
    setLoadingFile(true);
    setFetchedHtml(null);

    const fileUrl = `/documents/${activeDoc.filename}`;

    fetch(fileUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error('File not found');
        if (activeDoc.filename.endsWith('.txt')) {
          const text = await res.text();
          return `<pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>`;
        } else {
          const arrayBuffer = await res.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
          return result.value;
        }
      })
      .then((html) => {
        if (isMounted && html && html.trim().length > 0) {
          setFetchedHtml(html);
        }
      })
      .catch((err) => {
        // Fall back to built-in clean formatted policy HTML
        console.log('Using built-in policy HTML fallback for', activeDoc.filename);
      })
      .finally(() => {
        if (isMounted) setLoadingFile(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeDocId]);

  if (!isOpen) return null;

  const filteredDocs = POLICY_DOCUMENTS.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200" id="policy-modal">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                  Trung tâm Chính sách & Pháp lý
                </span>
                <span className="text-slate-400 text-xs font-mono">• HDS LAW FIRM</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                Văn bản & Điều khoản chính thức
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2.5 rounded-full cursor-pointer transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout Body: Left Navigation Sidebar + Right Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Sidebar List */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
            {/* Search filter input */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Document Tabs List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredDocs.map((doc) => {
                const IconComponent = doc.icon;
                const isActive = doc.id === activeDocId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start gap-3 cursor-pointer group ${
                      isActive 
                        ? 'bg-orange-50 border border-orange-200 text-orange-950 font-bold shadow-xs' 
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold truncate block text-slate-900">{doc.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                        {doc.filename}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Document Preview Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Action Bar Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                  {React.createElement(activeDoc.icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">{activeDoc.title}</h2>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                    <span>File: <strong className="text-slate-700">{activeDoc.filename}</strong></span>
                    <span>•</span>
                    <span>Cập nhật: {activeDoc.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="In tài liệu"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>In văn bản</span>
                </button>

                <a
                  href={`/documents/${activeDoc.filename}`}
                  download={activeDoc.filename}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Tải về tệp tin"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải về ({activeDoc.filename.endsWith('.txt') ? '.txt' : '.docx'})</span>
                </a>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* File Header Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Văn bản pháp lý chính thức ban hành bởi <strong>Công ty Luật HDS</strong></span>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-bold">
                    OFFICIAL DOC
                  </span>
                </div>

                {/* Main Rendered Content */}
                {loadingFile ? (
                  <div className="py-20 text-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs">Đang tải và xem trước file {activeDoc.filename}...</p>
                  </div>
                ) : fetchedHtml ? (
                  <div 
                    className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: fetchedHtml }}
                  />
                ) : (
                  <div 
                    className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                  />
                )}

                {/* Document Footer Notice */}
                <div className="border-t border-slate-200 pt-6 mt-10 text-[11px] text-slate-400 space-y-2">
                  <p><strong>CÔNG TY LUẬT TNHH HDS</strong> — Đại diện sở hữu công nghiệp Mã HNi-006 (475)</p>
                  <p>Địa chỉ: Phòng 401, tầng 4, số 169 Nguyễn Ngọc Vũ, Yên Hòa, Hà Nội | Hotline: 0901727373</p>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
