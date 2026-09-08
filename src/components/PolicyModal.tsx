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
  order: number;
  id: string;
  title: string;
  filename: string;
  icon: React.ElementType;
  description: string;
  lastUpdated: string;
}

export const POLICY_DOCUMENTS: PolicyDoc[] = [
  {
    order: 1,
    id: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    filename: 'chinh-sach-bao-mat.docx',
    icon: ShieldCheck,
    description: 'Chính sách bảo mật thông tin mua bán, dữ liệu cá nhân và bí mật kinh doanh của khách hàng trên hệ thống.',
    lastUpdated: '15/01/2026'
  },
  {
    order: 2,
    id: 'phuong-thuc-tiep-nhan-va-giai-quyet-phan-anh-yeu-cau-khieu-nai',
    title: 'Phương thức tiếp nhận và giải quyết phản ánh yêu cầu khiếu nại',
    filename: 'phuong-thuc-tiep-nhan-va-giai-quyet-phan-anh-yeu-cau-khieu-nai.docx',
    icon: AlertTriangle,
    description: 'Quy trình và phương thức tiếp nhận, thẩm tra, giải quyết khiếu nại và phản ánh của khách hàng minh bạch.',
    lastUpdated: '15/01/2026'
  },
  {
    order: 3,
    id: 'chinh-sach-gia',
    title: 'Chính sách giá',
    filename: 'chinh-sach-gia.docx',
    icon: DollarSign,
    description: 'Quy định rõ nguyên tắc định giá, niêm yết giá chuyển nhượng và cơ chế đàm phán nhãn hiệu.',
    lastUpdated: '01/02/2026'
  },
  {
    order: 4,
    id: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    filename: 'chinh-sach-thanh-toan.docx',
    icon: CreditCard,
    description: 'Cơ chế thanh toán bảo chứng an toàn, tài khoản trung gian của HDS Law và các phương thức thanh toán hợp pháp.',
    lastUpdated: '10/01/2026'
  },
  {
    order: 5,
    id: 'cac-dieu-kien-hoac-han-che-trong-viec-cung-cap-dich-vu',
    title: 'Các điều kiện hoặc hạn chế trong việc cung cấp dịch vụ',
    filename: 'cac-dieu-kien-hoac-han-che-trong-viec-cung-cap-dich-vu.docx',
    icon: ShieldCheck,
    description: 'Điều kiện pháp lý, giới hạn thẩm định và phạm vi cung cấp dịch vụ nhãn hiệu theo pháp luật Việt Nam.',
    lastUpdated: '01/02/2026'
  },
  {
    order: 6,
    id: 'phuong-thuc-cung-cap-dich-vu',
    title: 'Phương thức cung cấp dịch vụ brandix.vn',
    filename: 'phuong-thuc-cung-cap-dich-vu.docx',
    icon: FileText,
    description: 'Quy trình cung cấp dịch vụ, thời hạn thực hiện, thủ tục chấm dứt dịch vụ và chính sách hoàn tiền chi tiết.',
    lastUpdated: '01/02/2026'
  },
  {
    order: 7,
    id: 'hinh-thuc-ho-tro-truc-tuyen',
    title: 'Hình thức hỗ trợ trực tuyến',
    filename: 'hinh-thuc-ho-tro-truc-tuyen.docx',
    icon: HelpCircle,
    description: 'Các kênh hỗ trợ khách hàng 24/7 bao gồm Hotline, Zalo Luật sư và tiếp nhận yêu cầu trực tuyến.',
    lastUpdated: '20/01/2026'
  },
  {
    order: 8,
    id: 'quyen-va-nghia-vu-cac-ben',
    title: 'Quyền và nghĩa vụ các bên',
    filename: 'quyen-va-nghia-vu-cac-ben.docx',
    icon: Building2,
    description: 'Quyền và nghĩa vụ pháp lý của bên mua, bên bán và đơn vị vận hành sàn giao dịch nhãn hiệu Brandix.',
    lastUpdated: '01/02/2026'
  }
];

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocId?: string;
}

export default function PolicyModal({ isOpen, onClose, initialDocId = 'chinh-sach-bao-mat' }: PolicyModalProps) {
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
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                    <h3>{activeDoc.order}. {activeDoc.title}</h3>
                    <p>{activeDoc.description}</p>
                    <p>Quý khách có thể tải trực tiếp văn bản Word chính thức bằng cách nhấp vào nút &quot;Tải về&quot; phía trên.</p>
                  </div>
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
