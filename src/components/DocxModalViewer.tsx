import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { renderAsync } from 'docx-preview';
import mammoth from 'mammoth';
import { POLICY_DOCUMENTS } from '../policyData';

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
  const targetId = initialDocId || docType || 'chinh-sach-bao-mat';
  const [activeDocId, setActiveDocId] = useState<string>(targetId);
  const [loading, setLoading] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeDoc = POLICY_DOCUMENTS.find(d => d.id === activeDocId) || POLICY_DOCUMENTS[0];

  // Synchronize incoming targetId
  useEffect(() => {
    if (targetId) {
      setActiveDocId(targetId);
    }
  }, [targetId]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Render .docx file directly using docx-preview with mammoth fallback
  useEffect(() => {
    if (!isOpen || !activeDoc) return;

    let isMounted = true;
    setLoading(true);
    setRenderError(null);

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const fileUrl = `/documents/${activeDoc.filename}`;

    fetch(fileUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Không thể tải tệp tin (HTTP ${res.status})`);
        }
        return await res.arrayBuffer();
      })
      .then(async (arrayBuffer) => {
        if (!isMounted || !containerRef.current) return;
        containerRef.current.innerHTML = '';

        try {
          // 1. Primary engine: docx-preview (preserves exact Word margins, fonts, tables)
          await renderAsync(arrayBuffer, containerRef.current, undefined, {
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            className: 'docx-rendered-paper'
          });
        } catch (docxErr) {
          console.warn('docx-preview notice, using mammoth fallback engine:', docxErr);
          // 2. Fallback engine: mammoth (converts docx to clean semantic HTML)
          const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
          if (containerRef.current) {
            containerRef.current.innerHTML = mammothResult.value;
          }
        }

        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi đọc file Word:', err);
        if (isMounted) {
          setRenderError(err.message || 'Không thể hiển thị tệp Word. Quý khách có thể tải trực tiếp file về máy.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeDocId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
      id="docx-modal-viewer"
    >
      {/* Modal Dialog Box */}
      <div 
        className="bg-[#0f172a] rounded-2xl w-full max-w-5xl h-[94vh] max-h-[900px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header with Brandix Branding */}
        <div className="bg-[#182035] border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  Brandix
                </span>
                <span className="text-slate-400 text-xs font-medium hidden sm:inline">• Chính sách & Quy định</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                {activeDoc.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer"
              title="In văn bản này"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In</span>
            </button>

            <a
              href={`/documents/${activeDoc.filename}`}
              download={activeDoc.filename}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Tải về tệp .docx gốc"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Word</span>
            </a>

            <button
              id="close-docx-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng cửa sổ (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Directly displays the selected document */}
        <div className="flex-1 p-3 sm:p-6 overflow-hidden flex justify-center items-center relative bg-[#0e1424]">
          
          {loading && (
            <div className="absolute inset-0 bg-[#0e1424]/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-300 font-medium">
                Đang tải văn bản {activeDoc.title}...
              </p>
            </div>
          )}

          {renderError ? (
            <div className="max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">Không thể hiển thị xem trước tệp Word</h4>
                <p className="text-xs text-slate-400 mt-1">{renderError}</p>
              </div>
              <a
                href={`/documents/${activeDoc.filename}`}
                download={activeDoc.filename}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải về máy để xem (.docx)</span>
              </a>
            </div>
          ) : (
            /* Paper Sheet Container with internal scrolling */
            <div className="w-full h-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-12 border border-slate-200 overflow-y-auto no-scrollbar">
              
              {/* Document Sheet Header */}
              <div className="border-b border-slate-200 pb-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-slate-700 tracking-wide uppercase text-[11px]">Hệ thống Nhãn hiệu Brandix (brandix.vn)</span>
                </div>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {activeDoc.filename}
                </span>
              </div>

              {/* Rendered docx element */}
              <div 
                ref={containerRef} 
                className="docx-rendered-container prose max-w-none text-slate-900 text-xs sm:text-sm leading-relaxed" 
              />

              {/* Document Footer */}
              <div className="border-t border-slate-200 pt-6 mt-12 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© Brandix.vn - Nền tảng Giao dịch & Bảo hộ Nhãn hiệu Trực tuyến</span>
                <span className="font-medium">Hotline: 0901727373</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-[#182035] border-t border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 truncate max-w-md hidden sm:block">
            Tệp tin: <span className="text-slate-200 font-mono">{activeDoc.filename}</span>
          </p>

          <div className="flex items-center gap-2.5 ml-auto">
            <a
              href={`/documents/${activeDoc.filename}`}
              download={activeDoc.filename}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống file Word</span>
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
