import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Info
} from 'lucide-react';
import { renderAsync } from 'docx-preview';

export interface PolicyDoc {
  id: string;
  title: string;
  filename: string;
}

export const POLICY_DOCUMENTS: PolicyDoc[] = [
  { id: 'dieu-khoan-su-dung', title: 'Điều khoản sử dụng', filename: 'dieu-khoan-su-dung.docx' },
  { id: 'chinh-sach-bao-mat', title: 'Chính sách bảo mật', filename: 'chinh-sach-bao-mat.docx' },
  { id: 'chinh-sach-gia', title: 'Chính sách giá', filename: 'chinh-sach-gia.docx' },
  { id: 'chinh-sach-thanh-toan', title: 'Chính sách thanh toán', filename: 'chinh-sach-thanh-toan.docx' },
  { id: 'chinh-sach-van-chuyen-giao-hang', title: 'Chính sách vận chuyển & giao nhận', filename: 'chinh-sach-van-chuyen-giao-hang.docx' },
  { id: 'hinh-thuc-ho-tro-truc-tuyen', title: 'Hình thức hỗ trợ trực tuyến', filename: 'hinh-thuc-ho-tro-truc-tuyen.docx' },
  { id: 'quy-trinh-giai-quyet-khieu-nai', title: 'Quy trình giải quyết khiếu nại', filename: 'quy-trinh-giai-quyet-khieu-nai.docx' },
  { id: 'huong_dan_tai_file', title: 'Hướng dẫn tải file', filename: 'huong_dan_tai_file.txt' }
];

export interface DocxModalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocId?: string;
  docType?: string;
}

export default function DocxModalViewer({ 
  isOpen, 
  onClose, 
  initialDocId,
  docType 
}: DocxModalViewerProps) {
  const targetId = initialDocId || docType || 'dieu-khoan-su-dung';
  const [activeDocId, setActiveDocId] = useState<string>(targetId);
  const [loading, setLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeDoc = POLICY_DOCUMENTS.find(d => d.id === activeDocId) || POLICY_DOCUMENTS[0];

  useEffect(() => {
    if (targetId) {
      setActiveDocId(targetId);
    }
  }, [targetId]);

  // Render .docx directly using docx-preview
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const fileUrl = `/documents/${activeDoc.filename}`;

    fetch(fileUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.arrayBuffer();
      })
      .then(async (arrayBuffer) => {
        if (!isMounted || !containerRef.current) return;
        containerRef.current.innerHTML = '';
        await renderAsync(arrayBuffer, containerRef.current, undefined, {
          inWrapper: false,
          ignoreWidth: false,
          ignoreHeight: false,
          className: 'docx-rendered-paper'
        });
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.warn('Docx render fallback:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeDocId]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
      id="docx-modal-viewer"
    >
      {/* Modal Dialog Box */}
      <div 
        className="bg-[#121829] rounded-2xl w-full max-w-5xl h-[90vh] max-h-[850px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Modal Header */}
        <div className="bg-[#182035] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {activeDoc.title}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Văn bản Word (.docx): {activeDoc.filename}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Content Area: Paper container scrolls internally */}
        <div className="flex-1 p-3 sm:p-6 bg-[#181f33] flex justify-center items-center overflow-hidden relative">
          
          {loading && (
            <div className="absolute inset-0 bg-[#181f33]/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-300 font-medium">Đang kết xuất văn bản Word (.docx)...</p>
            </div>
          )}

          {/* Paper Sheet Container with hidden scrollbar (mouse scroll enabled) */}
          <div className="w-full h-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-12 border border-slate-200 overflow-y-auto no-scrollbar">
            <div 
              ref={containerRef} 
              className="docx-rendered-container prose max-w-none text-slate-900 text-xs sm:text-sm leading-relaxed" 
            />
          </div>

        </div>

        {/* 3. Modal Footer Bar */}
        <div className="bg-[#182035] border-t border-slate-800 px-5 py-3 flex items-center justify-end shrink-0">
          <div className="flex items-center gap-2.5">
            <a
              href={`/documents/${activeDoc.filename}`}
              download={activeDoc.filename}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống (.docx)</span>
            </a>

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

