import { useState } from 'react';
import { MOCK_FAQS } from '../data';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<'buy' | 'sell' | 'register'>('buy');
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const categories = [
    { value: 'buy', label: "Dành cho Người mua" },
    { value: 'sell', label: "Dành cho Người bán (Ký gửi)" },
    { value: 'register', label: "Vấn đề Đăng ký mới" }
  ];

  const filteredFaqs = MOCK_FAQS.filter(faq => faq.category === activeCategory);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section className="py-20 bg-slate-50 border-t border-b border-slate-100" id="faq">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">Hỏi Đáp Pháp Lý</span>
          <h2 className="text-3xl font-sans font-extrabold text-slate-900 tracking-tight mb-4">
            Giải Đáp Thắc Mắc Thường Gặp
          </h2>
          <p className="text-slate-500 text-sm">
            Mọi thắc mắc về sở hữu trí tuệ, quyền tác giả, chuyển nhượng văn bằng bảo hộ và cách thức thanh toán ký quỹ.
          </p>
        </div>

        {/* Tab Categories Filters */}
        <div className="flex justify-center bg-slate-200/50 p-1.5 rounded-2xl mb-8 max-w-lg mx-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value as any);
                const firstFaq = MOCK_FAQS.find(f => f.category === cat.value);
                setExpandedId(firstFaq ? firstFaq.id : null);
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeCategory === cat.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordions List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-start gap-3.5 text-sm sm:text-base font-bold text-slate-800">
                    <HelpCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-50 leading-relaxed bg-slate-50/40 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer help desk notice */}
        <div className="text-center mt-10">
          <p className="text-xs text-slate-400">
            Bạn vẫn chưa tìm được câu trả lời mong muốn?{' '}
            <a href="tel:19008899" className="text-orange-500 hover:underline font-bold">
              Gọi trực tiếp cho Luật sư SHTT 1900 8899 (Miễn phí)
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
