import React, { useState, useEffect, useMemo } from 'react';
import { Trademark } from '../types';
import { TRADEMARK_CLASSES } from '../data';
import { 
  Heart, Share2, ArrowRight, ArrowUpDown, Search, AlertCircle, CheckCircle2, 
  ChevronDown, ChevronUp, Tag, User, Calendar, SlidersHorizontal, Layers, Check, X
} from 'lucide-react';
import { Language, translations } from '../localization';
import { isExpiredOrRefusedStatus, getTrademarkStatusDisplay, extractFilingDate } from '../utils/trademarkStatus';

interface TrademarkListProps {
  onSelectTrademark: (tm: any) => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
  selectedClass: number | null;
  onClassSelect: (cls: number | null) => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  language: Language;
  niceClasses?: Record<number, { name: string; desc: string }>;
  onRequestRegistration?: () => void;
}

export default function TrademarkList({
  onSelectTrademark,
  onToggleFavorite,
  favorites,
  selectedClass,
  onClassSelect,
  searchKeyword,
  onSearchChange,
  language,
  niceClasses,
  onRequestRegistration
}: TrademarkListProps) {
  const t = translations[language];
  const classes = niceClasses && Object.keys(niceClasses).length > 0 ? niceClasses : TRADEMARK_CLASSES;

  const sortedClassEntries = useMemo(() => {
    return Object.entries(classes)
      .map(([id, info]) => ({ id: parseInt(id), info }))
      .sort((a, b) => a.id - b.id);
  }, [classes]);

  // States for API pagination & loading
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search Mode & Standard Search State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isNicePanelOpen, setIsNicePanelOpen] = useState(false);
  const [stdSearchKeyword, setStdSearchKeyword] = useState(searchKeyword || "");

  // Advanced Search attributes
  const [advBrandName, setAdvBrandName] = useState(searchKeyword || "");
  const [advSoDon, setAdvSoDon] = useState("");
  
  // Multi-select for Product/Service Groups (from /api/attributes/nhom-san-pham-code)
  const [selectedAdvGroups, setSelectedAdvGroups] = useState<number[]>([]);
  const [groupFilterTerm, setGroupFilterTerm] = useState("");

  const [advChuDon, setAdvChuDon] = useState("");
  const [advDiaChi, setAdvDiaChi] = useState("");
  const [advNgayNopTu, setAdvNgayNopTu] = useState("");
  const [advNgayNopDen, setAdvNgayNopDen] = useState("");
  const [advStatuses, setAdvStatuses] = useState<string[]>([]);

  // Accordion section toggles inside Advanced Panel
  const [openDinhDanh, setOpenDinhDanh] = useState(true);
  const [openChuDon, setOpenChuDon] = useState(false);
  const [openKhoangThoiGian, setOpenKhoangThoiGian] = useState(false);
  const [openTrangThai, setOpenTrangThai] = useState(true);

  // Attribute Groups fetched dynamically from /api/attributes/nhom-san-pham-code
  const [attributeGroups, setAttributeGroups] = useState<Array<{ id: number; name: string; position: number }>>([]);

  // Active query payload string sent in POST body to backend (JSON format)
  const [searchParamsBody, setSearchParamsBody] = useState<string>(() => {
    const payload: any = {
      attributes: selectedClass ? [{ slug: "nhom-san-pham-code", values: [selectedClass] }] : []
    };
    if (searchKeyword?.trim()) {
      payload.search = searchKeyword.trim();
    }
    return JSON.stringify(payload);
  });

  // Load product group attributes from /api/attributes/nhom-san-pham-code
  useEffect(() => {
    let isMounted = true;
    const loadAttributeGroups = async () => {
      try {
        let url = `https://admin.hdslaw.vn/${language}/api/attributes/nhom-san-pham-code`;
        let res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          url = `https://admin.hdslaw.vn/api/attributes/nhom-san-pham-code`;
          res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        }
        if (res.ok) {
          const json = await res.json();
          const rawItems = Array.isArray(json) ? json : (json.data || json.results || []);
          if (rawItems && rawItems.length > 0) {
            const parsed = rawItems.map((it: any, index: number) => ({
              id: Number(it.position || it.id || index + 1),
              name: it.name || '',
              position: Number(it.position || it.id || index + 1)
            })).sort((a: any, b: any) => a.id - b.id);
            if (isMounted) {
              setAttributeGroups(parsed);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load /api/attributes/nhom-san-pham-code', e);
      }
    };
    loadAttributeGroups();
    return () => { isMounted = false; };
  }, [language]);

  // Sync quick search from top header
  useEffect(() => {
    if (searchKeyword !== undefined) {
      setStdSearchKeyword(searchKeyword);
      setAdvBrandName(searchKeyword);
      setCurrentPage(1);
      const groups = selectedAdvGroups.length > 0 ? selectedAdvGroups : (selectedClass ? [selectedClass] : []);
      const attrs: any[] = [];
      if (groups.length > 0) {
        attrs.push({ slug: "nhom-san-pham-code", values: groups });
      }
      const payload: any = { attributes: attrs };
      if (searchKeyword.trim()) {
        payload.search = searchKeyword.trim();
      }
      setSearchParamsBody(JSON.stringify(payload));
    }
  }, [searchKeyword]);

  // Sync quick category chip selections with multi-select state
  useEffect(() => {
    if (selectedClass !== null) {
      setSelectedAdvGroups([selectedClass]);
      setCurrentPage(1);
      const payload: any = {
        attributes: [{ slug: "nhom-san-pham-code", values: [selectedClass] }]
      };
      if (stdSearchKeyword.trim()) {
        payload.search = stdSearchKeyword.trim();
      }
      setSearchParamsBody(JSON.stringify(payload));
    } else {
      setSelectedAdvGroups([]);
    }
  }, [selectedClass]);

  // Main Effect to fetch from the LIVE NOIP Cục SHTT Vietnam API
  useEffect(() => {
    const fetchTrademarks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `https://admin.hdslaw.vn/${language}/api/products?page=${currentPage}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: searchParamsBody
        });

        if (!response.ok) {
          throw new Error(language === 'vi' ? 'Lỗi máy chủ kết nối CSDL.' : 'Failed to query database.');
        }

        const json = await response.json();
        if (json && json.data) {
          setApiProducts(json.data);
          setMeta(json.meta);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrademarks();
  }, [language, currentPage, searchParamsBody]);

  // Parse attributes helper for mapping
  const getAttrVal = (item: any, slug: string): string => {
    const attr = item.attributes?.find((a: any) => a.slug === slug);
    if (!attr || !attr.values || attr.values.length === 0) return '';
    return attr.values.map((v: any) => v.name).join(', ');
  };

  // Extract Nice Class numbers
  const getClasses = (item: any): number[] => {
    const attr = item.attributes?.find((a: any) => a.slug === 'nhom-san-pham-code');
    if (!attr || !attr.values) return [35]; // Default fallback category
    return attr.values.map((v: any) => v.position || v.id_attr).filter(Boolean);
  };

  // Map API product records to our Trademark UI representation
  const mappedTrademarks: any[] = useMemo(() => {
    return apiProducts.map((p) => {
      const pClasses = getClasses(p);
      const appNo = getAttrVal(p, 'so-don') || 'VN4' + p.id;
      const rawFilingDate = getAttrVal(p, 'ngay-nop-don');
      const filingDate = extractFilingDate(p.progresses, rawFilingDate);
      const statusStr = getAttrVal(p, 'trang-thai') || p.status_name || p.status || '';
      const goodsDesc = getAttrVal(p, 'nhom-san-pham-dich-vu') || p.short_description || '';
      const owner = getAttrVal(p, 'chu-don-chu-bang') || 'Doanh nghiệp Việt Nam';

      const gradientOptions = [
        "from-blue-600 to-indigo-800",
        "from-teal-600 to-cyan-800",
        "from-emerald-600 to-teal-800",
        "from-slate-700 to-slate-900",
        "from-red-600 to-rose-800",
        "from-purple-600 to-indigo-800"
      ];
      const gradient = gradientOptions[p.id % gradientOptions.length];

      return {
        id: p.id.toString(),
        name: p.name,
        logoText: p.name?.substring(0, 2).toUpperCase(),
        logoBg: gradient,
        status: statusStr.toLowerCase().includes('từ chối') ? 'sold' : 'available',
        statusText: statusStr,
        progresses: p.progresses || [],
        classes: pClasses,
        goodsDescription: goodsDesc,
        applicationNo: appNo,
        filingDate: filingDate,
        price: p.price || 0,
        isFeatured: p.is_active,
        description: p.description || '',
        ownerType: owner,
        views: Math.floor(100 + (p.id * 13) % 900),
        likes: Math.floor(20 + (p.id * 7) % 200),
        slug: p.slug,
        imagePath: p.image?.path
      };
    });
  }, [apiProducts]);

  const toggleAdvGroup = (id: number) => {
    setSelectedAdvGroups(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllAdvGroups = () => {
    const allItems = attributeGroups.length > 0 ? attributeGroups : Array.from({ length: 45 }, (_, i) => ({ id: i + 1 }));
    setSelectedAdvGroups(allItems.map(g => g.id));
  };

  const clearAllAdvGroups = () => {
    setSelectedAdvGroups([]);
  };

  const displayGroups = useMemo(() => {
    const items = attributeGroups.length > 0 
      ? attributeGroups 
      : sortedClassEntries.map(e => ({ id: e.id, name: e.info.name, position: e.id }));
      
    if (!groupFilterTerm.trim()) return items;
    const term = groupFilterTerm.toLowerCase().trim();
    return items.filter(g => 
      g.id.toString().includes(term) || 
      (g.name && g.name.toLowerCase().includes(term))
    );
  }, [attributeGroups, sortedClassEntries, groupFilterTerm]);

  const buildPayloadString = (fromAdv: boolean) => {
    const primaryKeyword = fromAdv ? (advBrandName || stdSearchKeyword) : stdSearchKeyword;
    const trimmedKeyword = primaryKeyword.trim();

    const attributes: any[] = [];

    // Group filter (nhom-san-pham-code)
    const groupsToUse = selectedAdvGroups.length > 0
      ? selectedAdvGroups
      : (selectedClass ? [selectedClass] : []);

    if (groupsToUse.length > 0) {
      attributes.push({
        slug: "nhom-san-pham-code",
        values: groupsToUse
      });
    }

    if (fromAdv) {
      // so-don
      if (advSoDon.trim()) {
        attributes.push({
          slug: "so-don",
          search: advSoDon.trim()
        });
      }

      // chu-don-chu-bang
      if (advChuDon.trim()) {
        attributes.push({
          slug: "chu-don-chu-bang",
          search: advChuDon.trim()
        });
      }

      // address (dia chi)
      if (advDiaChi.trim()) {
        attributes.push({
          slug: "address",
          search: advDiaChi.trim()
        });
      }

      // trang-thai
      if (advStatuses.length > 0) {
        const statusMap: Record<string, string> = {
          'cap_bang': 'Cấp bằng',
          'dang_giai_quyet': 'Đang giải quyết',
          'tu_choi': 'Từ chối',
          'rut_don': 'Rút đơn'
        };
        const statusLabels = advStatuses.map(s => statusMap[s] || s).join(', ');
        attributes.push({
          slug: "trang-thai",
          search: statusLabels
        });
      }
    }

    const payload: any = {
      attributes: attributes
    };

    if (trimmedKeyword) {
      payload.search = trimmedKeyword;
    }

    return JSON.stringify(payload);
  };

  const handleStdSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchParamsBody(buildPayloadString(false));
    onSearchChange(stdSearchKeyword);
  };

  const handleAdvSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    setSearchParamsBody(buildPayloadString(true));
    onSearchChange(advBrandName || stdSearchKeyword);
  };

  const handleClearAll = () => {
    setStdSearchKeyword("");
    setAdvBrandName("");
    setAdvSoDon("");
    setSelectedAdvGroups([]);
    setGroupFilterTerm("");
    setAdvChuDon("");
    setAdvDiaChi("");
    setAdvNgayNopTu("");
    setAdvNgayNopDen("");
    setAdvStatuses([]);
    setIsNicePanelOpen(false);

    setCurrentPage(1);
    setSearchParamsBody(JSON.stringify({ attributes: [] }));
    onSearchChange("");
    onClassSelect(null);
  };

  const toggleStatusCheckbox = (id: string) => {
    setAdvStatuses(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getFullGroupLabel = (id: number, rawDesc?: string) => {
    let desc = rawDesc;
    if (!desc) {
      const foundInProps = sortedClassEntries.find(c => c.id === id)?.info?.name;
      if (foundInProps) desc = foundInProps;
    }
    if (!desc) return `Nhóm ${id}`;
    let full = desc.trim();
    full = full.replace(/^nhóm\s*\d+\s*[-:]?\s*/i, '');
    return `Nhóm ${id}: ${full}`;
  };

  const formatGroupPillLabel = (id: number, rawDesc?: string) => {
    let desc = rawDesc;
    if (!desc) {
      const foundInProps = sortedClassEntries.find(c => c.id === id)?.info?.name;
      if (foundInProps) desc = foundInProps;
    }
    if (!desc) return `Nhóm ${id}`;
    let short = desc.trim();
    short = short.replace(/^nhóm\s*\d+\s*[-:]?\s*/i, '');
    if (short.length > 32) {
      short = short.substring(0, 29).trim() + '...';
    }
    return `Nhóm ${id} (${short})`;
  };

  const handleShareClick = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/catalog/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 sm:py-20 bg-white" id="catalog">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">
              {language === 'vi' ? 'SÀN GIAO DỊCH NHÃN HIỆU CHÍNH THỨC' : 'OFFICIAL TRADEMARK MARKETPLACE'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight uppercase">
              {language === 'vi' ? 'Sàn nhãn hiệu có phân trang' : 'Bilingual Trademark Catalog'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              {language === 'vi' 
                ? 'Tìm kiếm và giao dịch văn bằng nhãn hiệu độc quyền liên kết cơ sở dữ liệu thời gian thực từ Cục Sở hữu Trí tuệ Việt Nam.' 
                : 'Search and acquire registered exclusive trademarks linked directly with NOIP databases.'}
            </p>
          </div>
        </div>

        {/* Standard Search Bar (Image 2) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
          <form onSubmit={handleStdSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Nhập tên nhãn hiệu, số đơn hoặc từ khóa...' : 'Enter trademark name, application no. or keyword...'}
                value={stdSearchKeyword}
                onChange={(e) => setStdSearchKeyword(e.target.value)}
                className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-600/15 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              {language === 'vi' ? 'Tìm kiếm' : 'Search'}
            </button>
          </form>

          {/* Quick Navigation Chips under Standard Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                {language === 'vi' ? 'Khám phá nhanh:' : 'Quick explore:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsNicePanelOpen(!isNicePanelOpen);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isNicePanelOpen 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isNicePanelOpen ? 'text-white' : 'text-blue-600'}`} />
                <span>{language === 'vi' ? 'Tra cứu theo Nhóm Nice' : 'By Nice Class'}</span>
                {selectedAdvGroups.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5 ${
                    isNicePanelOpen ? 'bg-white text-blue-700' : 'bg-orange-500 text-white'
                  }`}>
                    {selectedAdvGroups.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isAdvancedOpen 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold'
                }`}
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 ${isAdvancedOpen ? 'text-white' : 'text-blue-600'}`} />
                {language === 'vi' ? 'Tìm nâng cao' : 'Advanced Search'}
              </button>
            </div>

            {!isAdvancedOpen && (
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Tìm nâng cao' : 'Advanced Search'}
              </button>
            )}
          </div>
        </div>

        {/* Standalone Nice Class Multi-Select Panel */}
        {isNicePanelOpen && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{language === 'vi' ? 'Tra cứu theo Nhóm Nice (Chọn nhiều nhóm)' : 'Nice Class Search (Multi-select)'}</span>
                    {selectedAdvGroups.length > 0 && (
                      <span className="bg-orange-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                        {language === 'vi' ? `Đã chọn ${selectedAdvGroups.length} nhóm` : `${selectedAdvGroups.length} selected`}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'vi' 
                      ? 'Chọn một hoặc nhiều nhóm sản phẩm/dịch vụ từ danh mục 45 nhóm Nice' 
                      : 'Select one or multiple product/service groups from Nice classification'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNicePanelOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Search and Select All / Clear controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Lọc danh sách nhóm (ví dụ: 35, cà phê, dệt, y tế...)' : 'Filter groups by name or code...'}
                  value={groupFilterTerm}
                  onChange={(e) => setGroupFilterTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl pl-8 pr-8 py-2 text-xs text-slate-800 outline-none transition-all"
                />
                {groupFilterTerm && (
                  <button
                    type="button"
                    onClick={() => setGroupFilterTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={selectAllAdvGroups}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'vi' ? 'Chọn tất cả' : 'Select all'}
                </button>
                <button
                  type="button"
                  onClick={clearAllAdvGroups}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {language === 'vi' ? 'Bỏ chọn' : 'Clear'}
                </button>
              </div>
            </div>

            {/* Grid of selectable group buttons */}
            <div className="max-h-64 overflow-y-auto border border-slate-200/90 rounded-xl p-3 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 scrollbar-thin">
              {displayGroups.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium">
                  {language === 'vi' ? 'Không tìm thấy nhóm sản phẩm/dịch vụ phù hợp' : 'No matching groups found'}
                </div>
              ) : (
                displayGroups.map((grp) => {
                  const isChecked = selectedAdvGroups.includes(grp.id);
                  const fullText = getFullGroupLabel(grp.id, grp.name);
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      title={fullText}
                      onClick={() => toggleAdvGroup(grp.id)}
                      className={`group/btn relative flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition-all cursor-pointer text-left select-none ${
                        isChecked
                          ? 'bg-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 font-medium'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                        isChecked ? 'bg-white border-white text-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="leading-snug" title={fullText}>
                        {formatGroupPillLabel(grp.id, grp.name)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer search & clear controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-600 font-medium">
                {selectedAdvGroups.length === 0 
                  ? (language === 'vi' ? 'Chưa chọn nhóm nào (mặc định tìm tất cả)' : 'No group selected (searching all)') 
                  : (language === 'vi' ? `Đã chọn: Nhóm ${selectedAdvGroups.sort((a,b)=>a-b).join(', ')}` : `Selected: Group ${selectedAdvGroups.sort((a,b)=>a-b).join(', ')}`)}
              </div>
              
              <div className="flex items-center justify-end gap-3 shrink-0">
                {selectedAdvGroups.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllAdvGroups}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'vi' ? 'Bỏ chọn tất cả' : 'Clear all'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAdvSearchSubmit()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/15 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {language === 'vi' ? 'Tra cứu ngay' : 'Search Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Advanced Search Panel */}
        {isAdvancedOpen && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm space-y-6 animate-fadeIn">
            
            {/* 1. Main Search Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                {language === 'vi' ? 'Tìm kiếm' : 'Search'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Nhập tên nhãn hiệu...' : 'Enter trademark name...'}
                  value={advBrandName}
                  onChange={(e) => setAdvBrandName(e.target.value)}
                  className="w-full bg-slate-50/60 hover:bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Wildcard: V*NC, V?NC
              </p>
            </div>

            {/* 2. Accordion Sections */}
            <div className="border border-slate-200/90 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              
              {/* Group A: Định danh & Phân loại */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenDinhDanh(!openDinhDanh)}
                  className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>{language === 'vi' ? 'Định danh & Phân loại' : 'Identification & Classification'}</span>
                  </div>
                  {openDinhDanh ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {openDinhDanh && (
                  <div className="p-4 space-y-4 bg-white">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {language === 'vi' ? 'Số đơn' : 'Application No.'}
                      </label>
                      <input
                        type="text"
                        placeholder="4-2021-123456"
                        value={advSoDon}
                        onChange={(e) => setAdvSoDon(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>

                    {/* Multi-Select Product/Service Groups */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-800 block">
                            {language === 'vi' ? 'Nhóm sản phẩm / Dịch vụ (Chọn nhiều nhóm)' : 'Product / Service Groups (Multi-select)'}
                          </label>
                          {selectedAdvGroups.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                              {language === 'vi' ? `Đã chọn: ${selectedAdvGroups.length} nhóm` : `Selected: ${selectedAdvGroups.length}`}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={selectAllAdvGroups}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            {language === 'vi' ? 'Chọn tất cả' : 'Select all'}
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={clearAllAdvGroups}
                            className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold hover:underline cursor-pointer"
                          >
                            {language === 'vi' ? 'Bỏ chọn' : 'Clear'}
                          </button>
                        </div>
                      </div>

                      {/* Filter Search Input inside group selector */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder={language === 'vi' ? 'Lọc danh sách nhóm (ví dụ: 35, cà phê, dệt...)' : 'Filter groups...'}
                          value={groupFilterTerm}
                          onChange={(e) => setGroupFilterTerm(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 outline-none"
                        />
                        {groupFilterTerm && (
                          <button
                            type="button"
                            onClick={() => setGroupFilterTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Scrollable list of selectable group badges */}
                      <div className="max-h-48 overflow-y-auto border border-slate-200/90 rounded-xl p-2.5 bg-slate-50/40 flex flex-wrap gap-1.5 scrollbar-thin">
                        {displayGroups.length === 0 ? (
                          <p className="text-slate-400 text-xs py-2 px-1">
                            {language === 'vi' ? 'Không tìm thấy nhóm phù hợp' : 'No matching groups found'}
                          </p>
                        ) : (
                          displayGroups.map((grp) => {
                            const isChecked = selectedAdvGroups.includes(grp.id);
                            const fullText = getFullGroupLabel(grp.id, grp.name);
                            return (
                              <button
                                key={grp.id}
                                type="button"
                                title={fullText}
                                onClick={() => toggleAdvGroup(grp.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer select-none text-left ${
                                  isChecked
                                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 font-medium'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                                  isChecked ? 'bg-white border-white text-blue-600' : 'border-slate-300 bg-white'
                                }`}>
                                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </span>
                                <span title={fullText}>{formatGroupPillLabel(grp.id, grp.name)}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Group B: Chủ đơn */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenChuDon(!openChuDon)}
                  className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{language === 'vi' ? 'Chủ đơn' : 'Applicant'}</span>
                  </div>
                  {openChuDon ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {openChuDon && (
                  <div className="p-4 space-y-3 bg-white">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {language === 'vi' ? 'Tên chủ đơn / Chủ bằng' : 'Applicant Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'vi' ? 'Tên cá nhân hoặc tổ chức...' : 'Company or individual name...'}
                        value={advChuDon}
                        onChange={(e) => setAdvChuDon(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {language === 'vi' ? 'Địa chỉ chủ đơn' : 'Applicant Address'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'vi' ? 'Địa chỉ đăng ký...' : 'Registered address...'}
                        value={advDiaChi}
                        onChange={(e) => setAdvDiaChi(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Group C: Khoảng thời gian */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenKhoangThoiGian(!openKhoangThoiGian)}
                  className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{language === 'vi' ? 'Khoảng thời gian' : 'Time Range'}</span>
                  </div>
                  {openKhoangThoiGian ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {openKhoangThoiGian && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {language === 'vi' ? 'Ngày nộp đơn (từ ngày)' : 'Filing Date (From)'}
                        </label>
                        <input
                          type="date"
                          value={advNgayNopTu}
                          onChange={(e) => setAdvNgayNopTu(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {language === 'vi' ? 'Ngày nộp đơn (đến ngày)' : 'Filing Date (To)'}
                        </label>
                        <input
                          type="date"
                          value={advNgayNopDen}
                          onChange={(e) => setAdvNgayNopDen(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-800 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Group D: Trạng thái */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenTrangThai(!openTrangThai)}
                  className="w-full bg-slate-50/80 hover:bg-slate-100/80 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span>{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                  </div>
                  {openTrangThai ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {openTrangThai && (
                  <div className="p-4 bg-white">
                    {/* Status Checkboxes */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-2">
                        {language === 'vi' ? 'Trạng thái' : 'Status'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'cap_bang', label: language === 'vi' ? 'Cấp bằng' : 'Granted' },
                          { id: 'dang_giai_quyet', label: language === 'vi' ? 'Đang giải quyết' : 'Pending' },
                          { id: 'tu_choi', label: language === 'vi' ? 'Từ chối' : 'Rejected' },
                          { id: 'rut_don', label: language === 'vi' ? 'Rút đơn' : 'Withdrawn' }
                        ].map((st) => (
                          <label key={st.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900">
                            <input
                              type="checkbox"
                              checked={advStatuses.includes(st.id)}
                              onChange={() => toggleStatusCheckbox(st.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span>{st.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAdvSearchSubmit()}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-600/15 cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {language === 'vi' ? 'Tìm kiếm' : 'Search'}
              </button>

              <button
                type="button"
                onClick={() => setIsAdvancedOpen(false)}
                className="w-full sm:w-auto text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-5 py-3 rounded-xl transition-colors cursor-pointer text-center"
              >
                {language === 'vi' ? 'Thu gọn' : 'Collapse'}
              </button>
            </div>

          </div>
        )}

        {/* API Response Status / Loader */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-xs font-medium">
              {language === 'vi' ? 'Đang truy vấn thời gian thực từ CSDL Cục SHTT...' : 'Calling NOIP live databases...'}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 text-center text-xs font-medium">
            {error}
          </div>
        ) : mappedTrademarks.length === 0 ? (
          <div className="border border-slate-200 rounded-3xl p-12 text-center bg-slate-50 max-w-xl mx-auto my-12 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">
              {t.emptyStateTitle}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              {t.emptyStateDesc}
            </p>
            <button
              type="button"
              onClick={() => {
                if (onRequestRegistration) {
                  onRequestRegistration();
                } else {
                  window.location.hash = '#/workflow';
                }
              }}
              className="inline-flex bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-sm cursor-pointer transition-colors"
            >
              {t.emptyStateBtn}
            </button>
          </div>
        ) : (
          <>
            {/* Found results label */}
            <div className="flex justify-between items-center mb-6 text-xs text-slate-400 font-semibold uppercase tracking-widest">
              <span>
                {language === 'vi' 
                  ? `Tìm thấy ${meta?.total || mappedTrademarks.length} nhãn hiệu phù hợp` 
                  : `Found ${meta?.total || mappedTrademarks.length} matching trademarks`}
              </span>
              {(stdSearchKeyword || searchKeyword || selectedClass !== null || advBrandName || advChuDon || advSoDon || selectedAdvGroups.length > 0 || advStatuses.length > 0) && (
                <button
                  onClick={handleClearAll}
                  className="text-orange-500 hover:text-orange-600 cursor-pointer font-bold"
                >
                  {t.resetFilters}
                </button>
              )}
            </div>

            {/* Grid list container of mapped trademarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mappedTrademarks.map((tm) => {
                const isFavorite = favorites.includes(tm.id);
                return (
                  <div
                    key={tm.id}
                    onClick={() => onSelectTrademark(tm)}
                    className="bg-white border border-slate-200 hover:border-orange-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full relative cursor-pointer group hover:-translate-y-1"
                    id={`trademark-card-${tm.id}`}
                  >
                    <div>
                      {/* Brand Logo Plate */}
                      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 relative overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                        {tm.imagePath ? (
                          <img
                            src={tm.imagePath}
                            alt={tm.name}
                            referrerPolicy="no-referrer"
                            className="max-h-[96px] object-contain drop-shadow-sm group-hover:scale-102 transition-transform"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${tm.logoBg} rounded-xl flex items-center justify-center relative`}>
                            <span className="font-sans font-black text-2xl tracking-wider text-white select-none drop-shadow-md">
                              {tm.name}
                            </span>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        {(() => {
                          const statusDisp = getTrademarkStatusDisplay(tm.statusText, tm.progresses, language, tm.filingDate);
                          return (
                            <div className={`absolute top-3 left-3 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${statusDisp.badgeBg}`}>
                              {statusDisp.text}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Title row */}
                      <div className="flex justify-between items-start mt-4 mb-2">
                        <h3 className="font-sans font-black text-base uppercase text-slate-900 group-hover:text-orange-500 transition-colors line-clamp-1">
                          {tm.name}
                        </h3>
                        
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(tm.id); }}
                            className={`p-2 rounded-full hover:bg-slate-50 transition-colors cursor-pointer ${isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <Heart className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => handleShareClick(e, tm.slug)}
                            className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            {copiedId === tm.slug && (
                              <span className="absolute bottom-full right-0 mb-1 bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                                {language === 'vi' ? 'Đã sao chép!' : 'Copied!'}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Class tags list */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tm.classes.map((cls: number) => (
                          <span
                            key={cls}
                            className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md hover:bg-orange-100 hover:text-orange-600 transition-colors"
                          >
                            {language === 'vi' ? 'Nhóm' : 'Class'} {cls}
                          </span>
                        ))}
                      </div>

                      {/* Goods descriptions */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                        {tm.goodsDescription}
                      </p>
                    </div>

                    {/* Specifications footer */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                        <span>{language === 'vi' ? 'Số đơn:' : 'App No:'} {tm.applicationNo}</span>
                        <span>{language === 'vi' ? 'Ngày nộp:' : 'Filing:'} {tm.filingDate}</span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block leading-none">
                            {language === 'vi' ? 'Quyền sở hữu SHTT' : 'IP Ownership'}
                          </span>
                          {(() => {
                            const statusDisp = getTrademarkStatusDisplay(tm.statusText, tm.progresses, language, tm.filingDate);
                            return (
                              <span className={`text-xs font-black block mt-1 uppercase ${statusDisp.textColor}`}>
                                {statusDisp.text}
                              </span>
                            );
                          })()}
                        </div>

                        <button
                          onClick={() => onSelectTrademark(tm)}
                          className="bg-slate-900 hover:bg-orange-500 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors duration-150 cursor-pointer shrink-0"
                        >
                          <span className="hidden sm:inline">{language === 'vi' ? 'Chi tiết' : 'Details'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Standard Pagination Controls */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang trước"
                >
                  &larr;
                </button>

                {[...Array(meta.last_page)].map((_, i) => {
                  const pageNum = i + 1;
                  // Render a clean window of pages
                  if (pageNum === 1 || pageNum === meta.last_page || Math.abs(pageNum - currentPage) <= 1) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === 2 || pageNum === meta.last_page - 1) {
                    return <span key={pageNum} className="text-slate-300 px-1 text-xs">...</span>;
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === meta.last_page}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Trang sau"
                >
                  &rarr;
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
