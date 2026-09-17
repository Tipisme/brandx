import React, { useState, useEffect, useCallback } from 'react';
import { 
  Coins, 
  Copy, 
  Check, 
  Users, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock4,
  XCircle
} from 'lucide-react';
import { Language } from '../localization';

export interface ReferralDashboardData {
  referral_code?: string;
  total_successful_referrals?: number | string;
  total_commission?: number | string;
  pending_commission?: number | string;
  paid_commission?: number | string;
  [key: string]: any;
}

export interface CommissionItem {
  id?: string | number;
  order_id?: string | number;
  product?: {
    id?: string | number;
    name?: string;
    [key: string]: any;
  } | string;
  product_name?: string;
  base_amount?: number | string;
  commission_type?: string;
  commission_value?: number | string;
  commission_amount?: number | string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: any;
}

interface CommissionsTabProps {
  user: { name: string; email: string; token?: string; [key: string]: any } | null;
  language: Language;
}

export default function CommissionsTab({ user, language }: CommissionsTabProps) {
  // State for Referral Dashboard metrics
  const [dashboardData, setDashboardData] = useState<ReferralDashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // State for Commissions History
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isCommissionsLoading, setIsCommissionsLoading] = useState<boolean>(true);
  const [commissionsError, setCommissionsError] = useState<string | null>(null);

  // UI helpers
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Formatting helpers
  const formatCurrency = (val?: number | string | null): string => {
    if (val === undefined || val === null || val === '') return '0 ₫';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat('vi-VN').format(num) + ' ₫';
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getProductName = (item: CommissionItem): string => {
    if (typeof item.product === 'object' && item.product?.name) {
      return item.product.name;
    }
    if (typeof item.product === 'string' && item.product.trim()) {
      return item.product;
    }
    if (item.product_name) {
      return item.product_name;
    }
    return language === 'vi' ? 'Sản phẩm / Dịch vụ sở hữu trí tuệ' : 'IP Product / Service';
  };

  const getCommissionTypeLabel = (type?: string, val?: number | string): string => {
    if (!type && !val) return '—';
    const cleanType = String(type || '').toLowerCase();
    if (cleanType.includes('percent') || cleanType === 'percentage' || cleanType === '%') {
      return `${val || ''}%`;
    }
    if (cleanType.includes('fixed') || cleanType === 'amount') {
      return formatCurrency(val);
    }
    if (val !== undefined && val !== null) {
      if (typeof val === 'number' && val <= 100) return `${val}%`;
      if (String(val).includes('%')) return String(val);
      return formatCurrency(val);
    }
    return String(type);
  };

  const getStatusBadge = (status?: string) => {
    const s = String(status || '').toLowerCase().trim();
    if (['approved', 'paid', 'completed', 'success', 'da_thanh_toan', 'thanh_cong', 'da_duyet'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {language === 'vi' ? 'Đã thanh toán' : 'Paid / Approved'}
        </span>
      );
    }
    if (['pending', 'processing', 'waiting', 'cho_duyet', 'dang_xu_ly'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock4 className="w-3 h-3 text-amber-600" />
          {language === 'vi' ? 'Chờ xử lý' : 'Pending'}
        </span>
      );
    }
    if (['rejected', 'cancelled', 'canceled', 'tu_choi', 'da_huy'].includes(s)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          {language === 'vi' ? 'Đã huỷ' : 'Cancelled'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
        {status || (language === 'vi' ? 'Không xác định' : 'Unknown')}
      </span>
    );
  };

  // 1. Fetch Referral Dashboard Data (GET /api/referrals/dashboard)
  const fetchDashboard = useCallback(async () => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      setDashboardError(language === 'vi' ? 'Vui lòng đăng nhập để xem thông tin hoa hồng.' : 'Please log in to view commissions.');
      setIsDashboardLoading(false);
      return;
    }

    setIsDashboardLoading(true);
    setDashboardError(null);

    const endpoints = [
      'https://admin.hdslaw.vn/vi/api/referrals/dashboard',
      'https://admin.hdslaw.vn/api/referrals/dashboard',
    ];

    let success = false;
    let lastErrMsg = '';

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          const data = json?.data || json;
          setDashboardData(data);
          success = true;
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrMsg = errData?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastErrMsg = err?.message || 'Network request failed';
      }
    }

    if (!success) {
      console.warn('Referrals dashboard API returned:', lastErrMsg);
      setDashboardError(
        language === 'vi' 
          ? 'Không thể tải dữ liệu tổng quan hoa hồng từ máy chủ.' 
          : 'Failed to fetch referral dashboard data.'
      );
    }
    setIsDashboardLoading(false);
  }, [user?.token, language]);

  // 2. Fetch Commissions History (GET /api/referrals/commissions?page=X&per_page=Y)
  const fetchCommissions = useCallback(async (targetPage = 1) => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      setCommissionsError(language === 'vi' ? 'Vui lòng đăng nhập để xem lịch sử.' : 'Please log in to view history.');
      setIsCommissionsLoading(false);
      return;
    }

    setIsCommissionsLoading(true);
    setCommissionsError(null);

    const endpoints = [
      `https://admin.hdslaw.vn/vi/api/referrals/commissions?page=${targetPage}&per_page=${perPage}`,
      `https://admin.hdslaw.vn/api/referrals/commissions?page=${targetPage}&per_page=${perPage}`,
    ];

    let success = false;
    let lastErrMsg = '';

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (res.ok) {
          const json = await res.json();
          
          let list: CommissionItem[] = [];
          let total = 0;

          if (Array.isArray(json)) {
            list = json;
            total = json.length;
          } else if (Array.isArray(json?.data)) {
            list = json.data;
            total = json?.total ?? json?.meta?.total ?? json.data.length;
          } else if (Array.isArray(json?.data?.data)) {
            list = json.data.data;
            total = json.data.total ?? json.data.data.length;
          } else if (json?.commissions && Array.isArray(json.commissions)) {
            list = json.commissions;
            total = json?.total ?? json.commissions.length;
          }

          setCommissions(list);
          setTotalItems(total);
          setPage(targetPage);
          success = true;
          break;
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrMsg = errData?.message || `HTTP ${res.status}`;
        }
      } catch (err: any) {
        lastErrMsg = err?.message || 'Network request failed';
      }
    }

    if (!success) {
      console.warn('Commissions history API returned:', lastErrMsg);
      setCommissionsError(
        language === 'vi'
          ? 'Không thể tải danh sách lịch sử hoa hồng.'
          : 'Failed to fetch commissions list.'
      );
    }
    setIsCommissionsLoading(false);
  }, [user?.token, perPage, language]);

  // Load all on mount or token change
  useEffect(() => {
    fetchDashboard();
    fetchCommissions(1);
  }, [fetchDashboard, fetchCommissions]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboard(), fetchCommissions(page)]);
    setIsRefreshing(false);
  };

  // Referral code & copy handler
  const referralCode = dashboardData?.referral_code || '';

  const handleCopyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Client-side search and status filter on current page items
  const filteredCommissions = commissions.filter(item => {
    const matchesSearch = searchTerm === '' || 
      String(item.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(item).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      String(item.status || '').toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="commissions-tab-panel">
      
      {/* Header Row with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-sans font-extrabold text-slate-900">
              {language === 'vi' ? 'Hoa hồng của tôi' : 'My Commissions'}
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {language === 'vi' 
              ? 'Theo dõi số lượt giới thiệu thành công, quản lý mã giới thiệu và lịch sử hoa hồng nhận được.' 
              : 'Track successful referrals, manage your referral code, and inspect received commission payouts.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isDashboardLoading || isCommissionsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-500' : ''}`} />
          <span>{language === 'vi' ? 'Làm mới dữ liệu' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KPI 1: Tổng hoa hồng */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {language === 'vi' ? 'Tổng hoa hồng nhận được' : 'Total Commission Earned'}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-sans font-black text-emerald-600">
              {isDashboardLoading ? (
                <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md"></div>
              ) : (
                formatCurrency(dashboardData?.total_commission)
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'vi' ? 'Tích luỹ từ tất cả các đơn hàng thành công' : 'Accumulated from all successful deals'}
            </p>
          </div>
        </div>

        {/* KPI 2: Đơn / Lượt giới thiệu thành công */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {language === 'vi' ? 'Lượt giới thiệu thành công' : 'Successful Referrals'}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-sans font-black text-slate-900">
              {isDashboardLoading ? (
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md"></div>
              ) : (
                dashboardData?.total_successful_referrals ?? 0
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'vi' ? 'Khách hàng / đối tác đã hoàn tất giao dịch' : 'Customers with completed orders'}
            </p>
          </div>
        </div>

        {/* KPI 3: Mã giới thiệu */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {language === 'vi' ? 'Mã giới thiệu của bạn' : 'Your Referral Code'}
            </span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xl font-mono font-black text-orange-600 truncate">
                {isDashboardLoading ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md"></div>
                ) : (
                  referralCode || '—'
                )}
              </div>
              {referralCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title={language === 'vi' ? 'Sao chép mã' : 'Copy code'}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Chép' : 'Copy')}</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'vi' ? 'Mã định danh tự động theo tài khoản' : 'Account-linked unique referral code'}
            </p>
          </div>
        </div>

      </div>

      {/* Commission History Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        
        {/* Section title & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              {language === 'vi' ? 'Lịch sử nhận hoa hồng' : 'Commission History'}
            </h4>
            <p className="text-slate-500 text-xs">
              {language === 'vi' 
                ? `Hiển thị danh sách các đơn hàng phát sinh hoa hồng (${totalItems} mục)` 
                : `List of commission payouts and linked orders (${totalItems} total)`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'vi' ? 'Tìm mã đơn, tên sản phẩm...' : 'Search order, product...'}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="all">{language === 'vi' ? 'Tất cả trạng thái' : 'All Statuses'}</option>
              <option value="paid">{language === 'vi' ? 'Đã thanh toán / Duyệt' : 'Paid / Approved'}</option>
              <option value="pending">{language === 'vi' ? 'Chờ xử lý' : 'Pending'}</option>
              <option value="rejected">{language === 'vi' ? 'Đã huỷ' : 'Cancelled'}</option>
            </select>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{language === 'vi' ? 'Mã đơn hàng' : 'Order ID'}</th>
                <th className="py-3 px-4">{language === 'vi' ? 'Sản phẩm / Dịch vụ' : 'Product / Service'}</th>
                <th className="py-3 px-4 text-right">{language === 'vi' ? 'Giá trị đơn' : 'Base Amount'}</th>
                <th className="py-3 px-4 text-center">{language === 'vi' ? 'Tỷ lệ / Mức' : 'Rate'}</th>
                <th className="py-3 px-4 text-right">{language === 'vi' ? 'Tiền hoa hồng' : 'Commission'}</th>
                <th className="py-3 px-4 text-center">{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'vi' ? 'Thời gian' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isCommissionsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                      <span className="text-xs">{language === 'vi' ? 'Đang tải dữ liệu hoa hồng...' : 'Loading commission records...'}</span>
                    </div>
                  </td>
                </tr>
              ) : commissionsError ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <AlertCircle className="w-6 h-6 text-rose-500" />
                      <p className="text-xs text-rose-600 font-medium">{commissionsError}</p>
                      <button
                        onClick={() => fetchCommissions(page)}
                        className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        {language === 'vi' ? 'Thử lại' : 'Retry'}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <div className="p-3 bg-orange-50 text-orange-500 rounded-full">
                        <Coins className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">
                        {searchTerm || statusFilter !== 'all' 
                          ? (language === 'vi' ? 'Không tìm thấy giao dịch hoa hồng phù hợp' : 'No matching commissions found')
                          : (language === 'vi' ? 'Chưa có lịch sử hoa hồng' : 'No commission history yet')}
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs text-center">
                        {searchTerm || statusFilter !== 'all'
                          ? (language === 'vi' ? 'Vui lòng thay đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái.' : 'Please adjust your search keyword or filters.')
                          : (language === 'vi' ? 'Hãy chia sẻ mã hoặc liên kết giới thiệu để bắt đầu nhận hoa hồng từ các đơn hàng mới.' : 'Share your referral link with clients to start receiving commissions.')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((item, idx) => {
                  const orderId = item.order_id || item.id || `ORD-${idx + 1}`;
                  const productName = getProductName(item);
                  const commissionRate = getCommissionTypeLabel(item.commission_type, item.commission_value);
                  const commissionAmount = formatCurrency(item.commission_amount);
                  const baseAmount = formatCurrency(item.base_amount);
                  const createdAt = formatDate(item.created_at || item.createdAt);

                  return (
                    <tr key={item.id || item.order_id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        #{orderId}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-800 truncate" title={productName}>
                          {productName}
                        </div>
                        {item.commission_type && (
                          <div className="text-[10px] text-slate-400 capitalize">
                            {item.commission_type}
                          </div>
                        )}
                      </td>

                      {/* Base Amount */}
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {baseAmount}
                      </td>

                      {/* Commission Rate */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-semibold text-[11px]">
                          {commissionRate}
                        </span>
                      </td>

                      {/* Commission Amount */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 text-xs">
                        +{commissionAmount}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                        {createdAt}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalItems > perPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              {language === 'vi' 
                ? `Hiển thị trang ${page} / ${totalPages} (${totalItems} kết quả)` 
                : `Page ${page} of ${totalPages} (${totalItems} records)`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchCommissions(page - 1)}
                disabled={page <= 1 || isCommissionsLoading}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={language === 'vi' ? 'Trang trước' : 'Previous page'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => fetchCommissions(p)}
                        disabled={isCommissionsLoading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          p === page 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => fetchCommissions(page + 1)}
                disabled={page >= totalPages || isCommissionsLoading}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title={language === 'vi' ? 'Trang sau' : 'Next page'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
