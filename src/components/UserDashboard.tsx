import React, { useState, useEffect } from 'react';
import { extractFilingDate } from '../utils/trademarkStatus';
import { 
  User, 
  Folder, 
  FileText, 
  Award, 
  Calendar, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Search, 
  Star, 
  Upload, 
  FolderPlus, 
  ChevronLeft,
  ChevronRight, 
  ChevronDown, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  MoreVertical,
  Briefcase,
  X,
  Send,
  FilePlus,
  MessageSquare,
  Link,
  ExternalLink,
  RefreshCw,
  Code,
  Copy,
  Check,
  Clock,
  FileJson,
  Eye,
  Coins
} from 'lucide-react';
import { Language, translations } from '../localization';
import { Trademark } from '../types';
import { AdminTab, ADMIN_TAB_SLUGS, getAdminTabPath } from '../utils/routes';
import { getAdminApiUrl } from '../services/pageService';
import CommissionsTab from './CommissionsTab';

interface UserDashboardProps {
  user: { name: string; email: string; token?: string; first_name?: string; last_name?: string; [key: string]: any } | null;
  language: Language;
  onLogout: () => void;
  onCloseDashboard: () => void;
  onUserUpdate?: (updatedUser: any) => void;
  initialTab?: AdminTab;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

// Interface for User Personal & Organization Info
interface ProfileInfo {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  companyName: string;
  address: string;
  taxCode: string;
  licenseNo: string;
  citizenId?: string;
  businessType?: string;
  uploadedFiles?: { name: string; size: string; url?: string }[];
}

// Interface for mock client-side files
interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  url?: string;
}

// Interface for links in a folder
interface DocumentLink {
  id: string;
  name: string;
  path: string; // URL
  folder_id: string;
  created_at?: string;
}

// Interface for directories
interface DirectoryFolder {
  id: string;
  name: string;
  updatedAt: string;
  files: DocumentFile[];
  parent_id?: string;
  links?: DocumentLink[];
}

// Interface for user cases/matters
interface CaseItem {
  id: string;
  clientName: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  date: string;
  category: 'purchase' | 'sell' | 'negotiate' | 'other';
  messages: { sender: 'user' | 'expert'; text: string; time: string }[];
}

// Interface for API Requests from /api/requests
export interface ApiRequestItem {
  id: string | number;
  code?: string;
  title?: string;
  name?: string;
  subject?: string;
  description?: string;
  content?: string;
  note?: string;
  status: 'pending' | 'doing' | 'rejected' | 'approved' | string;
  type?: string;
  category?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  user_name?: string;
  user_email?: string;
  phone?: string;
  price?: number | string;
  amount?: number | string;
  [key: string]: any;
}

export default function UserDashboard({
  user,
  language,
  onLogout,
  onCloseDashboard,
  onUserUpdate,
  initialTab = 'profile',
  activeTab: propActiveTab,
  onTabChange
}: UserDashboardProps) {
  const t = translations[language];

  // Current active sidebar menu option
  const [activeTab, setActiveTab] = useState<AdminTab>(propActiveTab || initialTab);

  // Partner status verification - default is false unless is_partner is true
  const isPartner = Boolean(
    user?.is_partner === true ||
    (user as any)?.is_partner === 1 ||
    (user as any)?.is_partner === '1' ||
    (user as any)?.is_partner === 'true'
  );

  useEffect(() => {
    if (propActiveTab) {
      if (propActiveTab === 'commissions' && !isPartner) {
        setActiveTab('profile');
      } else {
        setActiveTab(propActiveTab);
      }
    } else if (initialTab) {
      if (initialTab === 'commissions' && !isPartner) {
        setActiveTab('profile');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [propActiveTab, initialTab, isPartner]);

  useEffect(() => {
    if (!isPartner && activeTab === 'commissions') {
      setActiveTab('profile');
      onTabChange?.('profile');
    }
  }, [isPartner, activeTab, onTabChange]);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setSelectedCase(null);
    onTabChange?.(tab);
  };

  // Helper to parse files from login payload (company.files)
  const parseCompanyFiles = (u: any) => {
    const companyFiles = u?.company?.files || u?.files || [];
    if (!Array.isArray(companyFiles)) return [];
    return companyFiles.map((file: any) => {
      if (typeof file === 'string') {
        return { 
          name: file.split('/').pop() || file, 
          size: 'Unknown',
          url: file.startsWith('http') ? file : `https://admin.hdslaw.vn${file.startsWith('/') ? '' : '/'}${file}`
        };
      } else if (file && typeof file === 'object') {
        const name = file.name || file.original_name || file.filename || file.title || 'unnamed_file';
        let size = 'Unknown';
        if (file.size) {
          size = typeof file.size === 'number' ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : String(file.size);
        } else if (file.file_size) {
          size = typeof file.file_size === 'number' ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : String(file.file_size);
        }
        const fileUrl = file.url || file.path || file.file_path;
        const url = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : `https://admin.hdslaw.vn${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`) : undefined;
        return { name, size, url };
      }
      return { name: 'unnamed_file', size: 'Unknown' };
    });
  };

  // --- Profile state ---
  const [profile, setProfile] = useState<ProfileInfo>(() => {
    const u = user as any;
    const computedName = (u?.first_name || u?.last_name) 
      ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
      : (u?.name || 'Mạnh Nguyễn');
    
    return {
      fullName: computedName,
      email: u?.email || 'ndmanh1305@gmail.com',
      phone: u?.phone || u?.company?.phone || '030500455',
      role: 'Quản trị viên / Chủ sở hữu',
      companyName: u?.companyName || u?.company?.name || u?.company || '',
      address: u?.address || u?.company?.address || '',
      taxCode: u?.taxCode || u?.company?.tax_code || u?.company?.taxCode || '',
      licenseNo: u?.licenseNo || u?.company?.license_no || u?.company?.licenseNo || '',
      citizenId: u?.citizenId || u?.company?.citizen_id || u?.company?.citizenId || '',
      businessType: u?.businessType || u?.company?.type || u?.company?.businessType || 'Công ty cổ phần',
      uploadedFiles: u ? parseCompanyFiles(u) : []
    };
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileProgress, setProfileProgress] = useState(20);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // --- Detailed Update Info Modal States ---
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);
  const [updateInfoBusinessType, setUpdateInfoBusinessType] = useState('Công ty cổ phần');
  const [updateInfoTaxCode, setUpdateInfoTaxCode] = useState('');
  const [updateInfoCitizenId, setUpdateInfoCitizenId] = useState('');
  const [updateInfoCompanyName, setUpdateInfoCompanyName] = useState('');
  const [updateInfoAddress, setUpdateInfoAddress] = useState('');
  const [updateInfoFiles, setUpdateInfoFiles] = useState<File[]>([]);
  const [isSubmittingUpdateInfo, setIsSubmittingUpdateInfo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isProfileComplete = !!(profile.taxCode && profile.citizenId);

  const openUpdateInfoModal = () => {
    setUpdateInfoBusinessType(profile.businessType || 'Công ty cổ phần');
    setUpdateInfoTaxCode(profile.taxCode || '');
    setUpdateInfoCitizenId(profile.citizenId || '');
    setUpdateInfoCompanyName(profile.companyName || '');
    setUpdateInfoAddress(profile.address || '');
    setUpdateInfoFiles([]);
    setUpdateStatus(null);
    setIsUpdateInfoModalOpen(true);
  };

  const handleUpdateInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUpdateInfo(true);
    setUpdateStatus(null);

    const token = user?.token || localStorage.getItem('brandhub_token');
    
    // Create FormData
    const formData = new FormData();
    formData.append('tax_code', updateInfoTaxCode);
    formData.append('citizen_id', updateInfoCitizenId);
    formData.append('type', updateInfoBusinessType);
    formData.append('name', updateInfoCompanyName);
    formData.append('address', updateInfoAddress);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone);

    // Append filesUpload[] multiple times
    updateInfoFiles.forEach((file) => {
      formData.append('filesUpload[]', file);
    });

    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/update-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        console.log('Successfully updated enterprise info via api/update-info.');
        const resData = await response.json().catch(() => null);
        console.log('Update response data:', resData);

        // Update local state dynamically from response data if available
        const updatedUser = resData?.user || resData?.data || resData;
        const companyData = updatedUser?.company || resData?.company || updatedUser;
        
        const returnedCompanyName = companyData?.name || companyData?.companyName || updateInfoCompanyName;
        const returnedAddress = companyData?.address || updateInfoAddress;
        const returnedTaxCode = companyData?.tax_code || companyData?.taxCode || updateInfoTaxCode;
        const returnedCitizenId = companyData?.citizen_id || companyData?.citizenId || updateInfoCitizenId;
        const returnedBusinessType = companyData?.type || companyData?.businessType || updateInfoBusinessType;
        const returnedFiles = companyData?.files || updatedUser?.files || [];

        let parsedFiles = parseCompanyFiles({ company: { files: returnedFiles } });
        if (parsedFiles.length === 0) {
          parsedFiles = updateInfoFiles.map(f => ({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(2)} MB` }));
        }

        setProfile(prev => ({
          ...prev,
          companyName: returnedCompanyName,
          address: returnedAddress,
          taxCode: returnedTaxCode,
          citizenId: returnedCitizenId,
          businessType: returnedBusinessType,
          uploadedFiles: parsedFiles.length > 0 ? parsedFiles : prev.uploadedFiles
        }));

        // Propagate the updated user info back to App.tsx
        if (onUserUpdate && user) {
          const newUserObj = {
            ...user,
            ...updatedUser,
            companyName: returnedCompanyName,
            address: returnedAddress,
            company: {
              ...(user.company || {}),
              ...(companyData || {}),
              name: returnedCompanyName,
              address: returnedAddress,
              tax_code: returnedTaxCode,
              citizen_id: returnedCitizenId,
              type: returnedBusinessType,
              files: returnedFiles.length > 0 ? returnedFiles : (user.company?.files || [])
            }
          };
          onUserUpdate(newUserObj);
        }

        setUpdateStatus({
          type: 'success',
          text: 'Cập nhật hồ sơ doanh nghiệp thành công!'
        });

        setTimeout(() => {
          setIsUpdateInfoModalOpen(false);
        }, 1500);
      } else {
        const errorJson = await response.json().catch(() => ({}));
        console.error('Failed to update info via API:', errorJson);
        const errorMsg = errorJson?.message || errorJson?.error || ('Cập nhật không thành công từ máy chủ.');
        setUpdateStatus({
          type: 'error',
          text: errorMsg
        });
      }
    } catch (err) {
      console.error('Failed to update info via API:', err);
      // Fallback local update
      setProfile(prev => ({
        ...prev,
        companyName: updateInfoCompanyName,
        address: updateInfoAddress,
        taxCode: updateInfoTaxCode,
        citizenId: updateInfoCitizenId,
        businessType: updateInfoBusinessType,
        uploadedFiles: updateInfoFiles.map(f => ({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(2)} MB` }))
      }));
      setUpdateStatus({
        type: 'success',
        text: 'Lưu thành công (chế độ offline/máy chủ bận).'
      });
      setTimeout(() => {
        setIsUpdateInfoModalOpen(false);
      }, 1500);
    } finally {
      setIsSubmittingUpdateInfo(false);
    }
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(false);
  };

  // --- User Trademarks state ---
  const [myTrademarks, setMyTrademarks] = useState<Trademark[]>([
    {
      id: 'my-tm-1',
      name: 'HDS',
      logoText: 'HDS',
      logoBg: 'from-amber-500 to-orange-600',
      classes: [29, 30],
      goodsDescription: 'Thực phẩm khô, trà, cà phê, các loại sữa dinh dưỡng.',
      price: 250000000,
      status: 'available',
      applicationNo: '4-2026-4512',
      registrationNo: '4512',
      filingDate: '28.04.2026',
      ownerType: 'Tổ chức',
      views: 124,
      likes: 12,
      isFeatured: false,
      description: 'Nhãn hiệu HDS đã được cấp văn bằng bảo hộ hoàn chỉnh.'
    }
  ]);

  const [trademarksLoading, setTrademarksLoading] = useState(false);

  useEffect(() => {
    // Simply use the default mock trademarks for now as the trademark management is not yet integrated
    console.log("Trademark API fetch disabled as requested by the user.");
  }, [user?.token]);

  // Sync user changes to profile state
  useEffect(() => {
    if (user) {
      setProfile(prev => {
        const u = user as any;
        const computedName = (u.first_name || u.last_name)
          ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
          : (u.name || prev.fullName);
        const parsedFiles = parseCompanyFiles(u);
        return {
          ...prev,
          fullName: computedName,
          email: user.email || prev.email,
          phone: u.phone || u.company?.phone || prev.phone || '030500455',
          companyName: u.companyName || u.company?.name || u.company || prev.companyName || '',
          address: u.address || u.company?.address || prev.address || '',
          taxCode: u.taxCode || u.company?.tax_code || u.company?.taxCode || prev.taxCode || '',
          licenseNo: u.licenseNo || u.company?.license_no || u.company?.licenseNo || prev.licenseNo || '',
          citizenId: u.citizenId || u.company?.citizen_id || u.company?.citizenId || prev.citizenId || '',
          businessType: u.businessType || u.company?.type || u.company?.businessType || prev.businessType || 'Công ty cổ phần',
          uploadedFiles: parsedFiles.length > 0 ? parsedFiles : prev.uploadedFiles
        };
      });
    }
  }, [user]);

  const [classOptions, setClassOptions] = useState<any[]>(() => {
    return [
      { position: 1, code: "01", name: "Hóa chất dùng trong công nghiệp, khoa học..." },
      { position: 2, code: "02", name: "Sơn, vecni, chất chống rỉ sét..." },
      { position: 3, code: "03", name: "Mỹ phẩm, chế phẩm làm sạch, nước hoa..." },
      { position: 5, code: "05", name: "Dược phẩm, chế phẩm y tế, thực phẩm chức năng..." },
      { position: 9, code: "09", name: "Thiết bị điện tử, phần mềm máy tính, điện thoại..." },
      { position: 16, code: "16", name: "Giấy, các ấn phẩm văn phòng phẩm..." },
      { position: 25, code: "25", name: "Quần áo, giày dép, mũ nón..." },
      { position: 29, code: "29", name: "Thịt, cá, gia cầm, rau quả đóng hộp, dầu ăn..." },
      { position: 30, code: "30", name: "Cà phê, trà, gạo, bánh kẹo, gia vị..." },
      { position: 32, code: "32", name: "Bia, nước khoáng, nước hoa quả, đồ uống không cồn..." },
      { position: 33, code: "33", name: "Đồ uống có cồn (trừ bia)..." },
      { position: 35, code: "35", name: "Dịch vụ quảng cáo, quản lý kinh doanh, bán lẻ..." },
      { position: 36, code: "36", name: "Dịch vụ tài chính, bảo hiểm, bất động sản..." },
      { position: 37, code: "37", name: "Dịch vụ xây dựng, lắp đặt, sửa chữa..." },
      { position: 38, code: "38", name: "Dịch vụ viễn thông, truyền thông..." },
      { position: 39, code: "39", name: "Dịch vụ vận tải, đóng gói, lưu trữ..." },
      { position: 41, code: "41", name: "Dịch vụ giáo dục, đào tạo, giải trí..." },
      { position: 42, code: "42", name: "Dịch vụ nghiên cứu khoa học, phát triển công nghệ..." },
      { position: 43, code: "43", name: "Dịch vụ cung cấp thức ăn, đồ uống, nhà hàng..." },
      { position: 44, code: "44", name: "Dịch vụ y tế, chăm sóc sắc đẹp, nông nghiệp..." },
      { position: 45, code: "45", name: "Dịch vụ pháp lý, bảo vệ an ninh..." }
    ];
  });

  const [isNewTrademarkModalOpen, setIsNewTrademarkModalOpen] = useState(false);
  const [newTmType, setNewTmType] = useState<'app' | 'cert'>('app');
  const [newTmName, setNewTmName] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['30']);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [newTmAppNo, setNewTmAppNo] = useState('');
  const [newTmFilingDate, setNewTmFilingDate] = useState(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  });
  const [newTmCertNo, setNewTmCertNo] = useState('');
  const [newTmCertDate, setNewTmCertDate] = useState('');
  const [newTmImageFile, setNewTmImageFile] = useState<File | null>(null);
  const [newTmImagePreview, setNewTmImagePreview] = useState<string | null>(null);
  const [newTmDocsFiles, setNewTmDocsFiles] = useState<File[]>([]);
  const [newTmPrice, setNewTmPrice] = useState('120000000');
  const [newTmDesc, setNewTmDesc] = useState('');

  // Fetch Class options from API
  const fetchClassOptions = async () => {
    try {
      const url = `https://admin.hdslaw.vn/vi/api/attributes/nhom-san-pham-code`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data || json.results || [];
        if (items.length > 0) {
          const parsed = items.map((item: any) => ({
            position: Number(item.position) || Number(item.id),
            code: item.code || String(item.id),
            name: item.name || item.description || ''
          })).filter(o => o.code);
          setClassOptions(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to fetch class options:', err);
    }
  };

  // Fetch My Trademarks list from API
  const fetchMyTrademarksList = async () => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) return;

    setTrademarksLoading(true);
    try {
      const url = `https://admin.hdslaw.vn/vi/api/products/created-by`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json.data || json.results || [];
        const parsed: Trademark[] = items.map((item: any) => {
          // Extract nice classes from attribute with slug "nhom-san-pham-code"
          const attr = item.attributes?.find((a: any) => a.slug === 'nhom-san-pham-code');
          let classes: number[] = [];
          if (attr && attr.values) {
            classes = attr.values.map((v: any) => Number(v.position || v.id_attr || v.code || v.name)).filter((n: any) => !isNaN(n) && n > 0);
          }
          if (classes.length === 0) {
            classes = Array.isArray(item.classes) ? item.classes : (item.class ? [Number(item.class)] : [30]);
          }

          // Extract attributes like so-don and ngay-nop-don if they are in attributes
          const getAttrVal = (p: any, slug: string): string => {
            const a = p.attributes?.find((at: any) => at.slug === slug);
            if (!a || !a.values || a.values.length === 0) return '';
            return a.values.map((v: any) => v.name).join(', ');
          };

          const applicationNo = getAttrVal(item, 'so-don') || item.applicationNo || 'VN4-2026-0000';
          const rawFilingDate = getAttrVal(item, 'ngay-nop-don') || item.filingDate;
          const filingDate = extractFilingDate(item.progresses, rawFilingDate);

          return {
            id: String(item.id || item.code || `my-tm-${Math.random()}`),
            name: item.name || 'Nhãn hiệu liên kết',
            logoText: item.name ? item.name.slice(0, 3).toUpperCase() : 'HDS',
            logoBg: item.logoBg || 'from-slate-700 to-slate-900',
            classes: classes,
            goodsDescription: item.goodsDescription || item.description || 'Sản phẩm liên kết từ hệ thống.',
            price: Number(item.price) || 120000000,
            status: item.status || 'available',
            applicationNo: applicationNo,
            registrationNo: item.registrationNo || '',
            filingDate: filingDate,
            ownerType: item.ownerType || 'Tổ chức',
            views: Number(item.views) || 0,
            likes: Number(item.likes) || 0,
            isFeatured: !!item.isFeatured,
            description: item.description || '',
            imagePath: item.image?.path
          };
        });
        setMyTrademarks(parsed);
      }
    } catch (err) {
      console.error('Failed to fetch user products list from API:', err);
    } finally {
      setTrademarksLoading(false);
    }
  };

  // Run calls when user clicks activeTab trademarks
  useEffect(() => {
    if (activeTab === 'trademarks') {
      fetchClassOptions();
      fetchMyTrademarksList();
    }
  }, [activeTab, language, user?.token]);

  const handleCreateTrademark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmName) return;

    const classNumbers = selectedClasses.map(c => parseInt(c)).filter(n => !isNaN(n));

    // Build the Trademark object to display immediately in local state
    const newTm: Trademark = {
      id: `my-tm-${Date.now()}`,
      name: newTmName,
      logoText: newTmName.slice(0, 3).toUpperCase(),
      logoBg: newTmType === 'cert' ? 'from-emerald-600 to-teal-700' : 'from-blue-500 to-indigo-600',
      classes: classNumbers.length > 0 ? classNumbers : [30],
      goodsDescription: newTmDesc || ('Dịch vụ và hàng hóa liên quan đến nhãn hiệu.'),
      price: parseInt(newTmPrice) || 120000000,
      status: 'available',
      applicationNo: newTmAppNo || `4-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      filingDate: newTmFilingDate ? new Date(newTmFilingDate).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      registrationNo: newTmType === 'cert' ? (newTmCertNo || `VB-${Math.floor(100000 + Math.random() * 900000)}`) : '',
      ownerType: profile.companyName ? 'Tổ chức' : 'Cá nhân',
      views: 1,
      likes: 0,
      isFeatured: false,
      description: newTmType === 'cert' ? `Bằng cấp ngày ${newTmCertDate ? new Date(newTmCertDate).toLocaleDateString('vi-VN') : 'gần đây'}` : '',
      imagePath: newTmImagePreview || undefined
    };

    // Robust Real API Post approach with FormData
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (token) {
      try {
        const formData = new FormData();
        formData.append('name', newTmName);
        
        if (newTmImageFile) {
          formData.append('base_image', newTmImageFile);
        }
        
        formData.append('so_don', newTmAppNo);
        formData.append('ngay_nop_don', newTmFilingDate);

        if (newTmType === 'cert') {
          formData.append('so_bang', newTmCertNo);
          formData.append('ngay_cap', newTmCertDate || newTmFilingDate);
        } else {
          formData.append('so_bang', '');
          formData.append('ngay_cap', '');
        }

        // nhom_san_pham[] append multiple times
        selectedClasses.forEach(cls => {
          formData.append('nhom_san_pham[]', cls);
        });

        // download_files[] append multiple times
        newTmDocsFiles.forEach(file => {
          formData.append('download_files[]', file);
        });

        // Add type and status as helper fields
        formData.append('type', newTmType);
        formData.append('status', 'available');
        formData.append('price', String(newTm.price));
        formData.append('description', newTmDesc || 'Sản phẩm đăng ký từ trang cá nhân.');

        const response = await fetch(`https://admin.hdslaw.vn/vi/api/products/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('Successfully posted new trademark as FormData to products/create.');
          // Refresh from API to ensure consistent synchronized states
          fetchMyTrademarksList();
        } else {
          console.warn('API products/create post did not return ok. Proceeding with instant local UI insertion.');
          setMyTrademarks([newTm, ...myTrademarks]);
        }
      } catch (err) {
        console.error('Failed to POST new trademark as FormData to server. Using local state insertion fallback:', err);
        setMyTrademarks([newTm, ...myTrademarks]);
      }
    } else {
      setMyTrademarks([newTm, ...myTrademarks]);
    }

    setIsNewTrademarkModalOpen(false);
    
    // Reset Form fields
    setNewTmName('');
    setSelectedClasses(['30']);
    setClassSearchQuery('');
    setNewTmAppNo('');
    setNewTmFilingDate(() => {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    });
    setNewTmCertNo('');
    setNewTmCertDate('');
    setNewTmImageFile(null);
    setNewTmImagePreview(null);
    setNewTmDocsFiles([]);
    setNewTmDesc('');
  };

  const handleDeleteTrademark = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhãn hiệu này?')) {
      setMyTrademarks(myTrademarks.filter(t => t.id !== id));
    }
  };

  const handleExportTrademarks = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "STT,Nhãn hiệu,Nhóm,Trạng thái,Ngày nộp,Số đơn,Giá\n"
      + myTrademarks.map((t, index) => `${index + 1},${t.name},"${t.classes.join(',')}",${t.status},${t.filingDate},${t.applicationNo},${t.price}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh_sach_nhan_hieu_${profile.fullName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- Case Management state ---
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 'case-1',
      clientName: 'Manh Nguyen',
      title: 'Đàm phán thương lượng mua nhãn hiệu HDS',
      description: 'Yêu cầu hỗ trợ thương lượng mua lại nhãn hiệu HDS Nhóm 29, 30 của chủ đơn khác với giá đề xuất 220 triệu VND.',
      status: 'PENDING',
      date: '20.04.2026',
      category: 'negotiate',
      messages: [
        { sender: 'user', text: 'Tôi muốn mua nhãn hiệu HDS với giá khoảng 220 triệu, nhờ chuyên viên kết nối với chủ sở hữu thương lượng giúp.', time: '09:12' },
        { sender: 'expert', text: 'Chào anh Mạnh, Brandix đã tiếp nhận yêu cầu đàm phán nhãn hiệu HDS. Chúng tôi đang kiểm tra thông tin liên hệ của chủ đơn gốc và sẽ cập nhật tiến độ cho anh sớm nhất.', time: '10:30' }
      ]
    },
    {
      id: 'case-2',
      clientName: 'Manh Nguyen',
      title: 'Ký gửi nhãn hiệu độc quyền HDS',
      description: 'Đăng ký bán nhãn hiệu HDS lên sàn giao dịch Brandix.',
      status: 'ACTIVE',
      date: '18.04.2026',
      category: 'sell',
      messages: [
        { sender: 'user', text: 'Tôi đã đăng nhãn hiệu HDS của công ty lên, hệ thống đã duyệt chưa?', time: '14:20' },
        { sender: 'expert', text: 'Dạ nhãn hiệu HDS của anh đã được duyệt hiển thị trên sàn và đang có 2 đối tác quan tâm hỏi giá ạ. Chuyên viên sẽ hỗ trợ anh ngay khi có đề xuất giá chính thức.', time: '15:10' }
      ]
    },
    {
      id: 'case-3',
      clientName: 'Manh Nguyen',
      title: 'Nộp đơn mới nhóm 30',
      description: 'Nộp hồ sơ bảo hộ nhãn hiệu phụ gia thực phẩm.',
      status: 'COMPLETED',
      date: '10.04.2026',
      category: 'purchase',
      messages: [
        { sender: 'expert', text: 'Hồ sơ đã được tiếp nhận và đóng dấu hợp lệ. Chúng tôi gửi anh file scan biên nhận đơn ở mục Quản lý file.', time: '16:00' }
      ]
    }
  ]);

  const [activeCaseFilter, setActiveCaseFilter] = useState<'all' | 'running' | 'completed'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newRequestEmail, setNewRequestEmail] = useState('');
  const [newRequestPhone, setNewRequestPhone] = useState('');
  const [newRequestDesc, setNewRequestDesc] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSubmitError, setRequestSubmitError] = useState<string | null>(null);

  const openNewRequestModal = () => {
    const defaultName = profile.fullName || user?.name || user?.fullName || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '';
    const defaultEmail = user?.email || profile.email || '';
    const defaultPhone = user?.phone || user?.phone_number || profile.phone || user?.company?.phone || '';
    
    setNewRequestName(defaultName);
    setNewRequestEmail(defaultEmail);
    setNewRequestPhone(defaultPhone);
    setNewRequestDesc('');
    setRequestSubmitError(null);
    setIsNewCaseModalOpen(true);
  };

  // --- Requests API state (/api/requests) ---
  const DEFAULT_REQUESTS: ApiRequestItem[] = [
    {
      id: 101,
      code: 'REQ-2026-001',
      title: 'Yêu cầu định giá & đăng ký nhãn hiệu HDS Sữa Hữu Cơ',
      name: 'Định giá & Đăng ký nhãn hiệu Sữa Hữu Cơ',
      description: 'Khách hàng gửi yêu cầu thẩm định khả năng bảo hộ và tư vấn chuyển nhượng nhãn hiệu Sữa Hữu Cơ Nhóm 29.',
      status: 'pending',
      status_name: 'Chờ xử lý',
      type: 'Đăng ký & Định giá',
      category: 'Thương lượng',
      created_at: '2026-07-22T08:30:00Z',
      updated_at: '2026-07-22T08:30:00Z',
      user_name: profile.fullName || 'Mạnh Nguyễn',
      user_email: user?.email || 'manh.nguyen@hdslaw.vn',
      phone: '0988123456',
      price: 15000000,
      note: 'Chờ bộ phận chuyên viên phân tích hồ sơ và liên hệ tư vấn trực tiếp.'
    },
    {
      id: 102,
      code: 'REQ-2026-002',
      title: 'Thương lượng mua độc quyền nhãn hiệu VINACON Nhóm 30',
      name: 'Thương lượng nhãn hiệu VINACON',
      description: 'Giao dịch chuyển nhượng độc quyền nhãn hiệu bánh kẹo từ bên bán. Đang gửi thư trao đổi hợp đồng.',
      status: 'doing',
      status_name: 'Đang xử lý',
      type: 'Mua nhãn hiệu',
      category: 'Chuyển nhượng',
      created_at: '2026-07-20T10:15:00Z',
      updated_at: '2026-07-23T14:00:00Z',
      user_name: 'Phạm Hoàng Anh',
      user_email: 'hoanganh@brandix.vn',
      phone: '0912345678',
      price: 220000000,
      note: 'Chuyên viên HDS Law đang thương thảo điều khoản hợp đồng chuyển nhượng 2 bên.'
    },
    {
      id: 103,
      code: 'REQ-2026-003',
      title: 'Yêu cầu tra cứu trùng lặp nhãn hiệu TECHFAST',
      name: 'Tra cứu chuyên sâu TECHFAST',
      description: 'Hồ sơ đã được phê duyệt hợp lệ. Báo cáo kết quả tra cứu trùng lặp đã sẵn sàng.',
      status: 'approved',
      status_name: 'Đã phê duyệt',
      type: 'Tra cứu SHTT',
      category: 'Pháp lý',
      created_at: '2026-07-15T09:00:00Z',
      updated_at: '2026-07-18T16:20:00Z',
      user_name: profile.fullName || 'Mạnh Nguyễn',
      user_email: user?.email || 'manh.nguyen@hdslaw.vn',
      phone: '0988123456',
      price: 3500000,
      note: 'Đã hoàn thành phê duyệt hồ sơ tra cứu.'
    },
    {
      id: 104,
      code: 'REQ-2026-004',
      title: 'Đăng ký ký gửi bán nhãn hiệu chưa đủ điều kiện bảo hộ',
      name: 'Ký gửi bán nhãn hiệu ABC',
      description: 'Yêu cầu bị từ chối do nhãn hiệu chưa có giấy chứng nhận đăng ký nhãn hiệu độc quyền hợp pháp.',
      status: 'rejected',
      status_name: 'Từ chối',
      type: 'Bán nhãn hiệu',
      category: 'Sàn giao dịch',
      created_at: '2026-07-10T11:45:00Z',
      updated_at: '2026-07-11T09:10:00Z',
      user_name: 'Trần Văn Bình',
      user_email: 'binh.tv@gmail.com',
      phone: '0934567890',
      price: 0,
      note: 'Cần bổ sung văn bằng bảo hộ chính thức trước khi gửi yêu cầu mới.'
    },
    {
      id: 105,
      code: 'REQ-2026-005',
      title: 'Định giá thương hiệu đồ uống GREEN TEA 365',
      name: 'Định giá nhãn hiệu GREEN TEA',
      description: 'Yêu cầu thẩm định giá trị tài sản vô hình nhãn hiệu phục vụ góp vốn doanh nghiệp.',
      status: 'pending',
      status_name: 'Chờ xử lý',
      type: 'Thẩm định giá',
      category: 'Tài chính',
      created_at: '2026-07-08T14:20:00Z',
      updated_at: '2026-07-08T14:20:00Z',
      user_name: 'Nguyễn Thị Mai',
      user_email: 'mai.nguyen@greentea.vn',
      price: 18000000,
      note: 'Chờ bổ sung báo cáo tài chính 3 năm gần nhất.'
    },
    {
      id: 106,
      code: 'REQ-2026-006',
      title: 'Tư vấn tranh chấp nhãn hiệu LOGIFIX trùng lắp',
      name: 'Tư vấn tranh chấp LOGIFIX',
      description: 'Tiến hành soạn thảo thư cảnh báo vi phạm quyền sở hữu công nghiệp đối với bên vi phạm.',
      status: 'doing',
      status_name: 'Đang xử lý',
      type: 'Tranh chấp SHTT',
      category: 'Pháp lý',
      created_at: '2026-07-05T10:00:00Z',
      updated_at: '2026-07-07T09:30:00Z',
      user_name: 'Lê Văn Cường',
      user_email: 'cuong.le@logifix.com',
      price: 25000000,
      note: 'Đang gửi công văn xử lý hồ sơ.'
    },
    {
      id: 107,
      code: 'REQ-2026-007',
      title: 'Đăng ký nhãn hiệu quốc tế qua hệ thống Madrid',
      name: 'Đăng ký Madrid System - SOLARMAX',
      description: 'Đăng ký bảo hộ nhãn hiệu SOLARMAX tại 5 quốc gia Đông Nam Á.',
      status: 'approved',
      status_name: 'Đã phê duyệt',
      type: 'Đăng ký Quốc tế',
      category: 'SHTT Quốc tế',
      created_at: '2026-06-28T16:00:00Z',
      updated_at: '2026-07-02T11:15:00Z',
      user_name: profile.fullName || 'Mạnh Nguyễn',
      user_email: user?.email || 'manh.nguyen@hdslaw.vn',
      price: 65000000,
      note: 'Hồ sơ đã được gửi sang Văn phòng quốc tế WIPO.'
    }
  ];

  const [apiRequests, setApiRequests] = useState<ApiRequestItem[]>(DEFAULT_REQUESTS);
  const [requestsLoading, setRequestsLoading] = useState<boolean>(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [activeRequestFilter, setActiveRequestFilter] = useState<'all' | 'pending' | 'doing' | 'approved' | 'rejected'>('all');
  const [selectedRequestItem, setSelectedRequestItem] = useState<ApiRequestItem | null>(null);

  // Pagination states for /api/requests
  const [requestsPage, setRequestsPage] = useState<number>(1);
  const [requestsPageSize, setRequestsPageSize] = useState<number>(8);
  const [requestsTotalCount, setRequestsTotalCount] = useState<number>(0);

  const fetchRequestsList = async (page = 1, currentFilter = activeRequestFilter, pageSize = requestsPageSize) => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    setRequestsLoading(true);
    setRequestsError(null);

    let localNegs: any[] = [];
    try {
      const saved = localStorage.getItem('brandhub_negotiations');
      if (saved) {
        localNegs = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading brandhub_negotiations', e);
    }

    try {
      const baseUrl = getAdminApiUrl();
      const statusParam = currentFilter && currentFilter !== 'all' ? `&status=${currentFilter}` : '';
      const url = `${baseUrl}/vi/api/requests?page=${page}&limit=${pageSize}${statusParam}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch(url, { headers });

      if (!res.ok) {
        res = await fetch(`${baseUrl}/api/requests?page=${page}&limit=${pageSize}${statusParam}`, { headers });
      }

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) 
          ? json 
          : (json.data || json.requests || json.results || json.items || []);

        const total = json.total ?? json.meta?.total ?? json.total_items ?? json.total_count ?? json.count ?? (Array.isArray(json) ? json.length : (items ? items.length : 0));
        setRequestsTotalCount((Number(total) || 0) + localNegs.length);

        if (Array.isArray(items)) {
          setApiRequests([...localNegs, ...items]);
        } else {
          setApiRequests(localNegs);
        }
      } else {
        console.warn('API /api/requests status:', res.status);
        setApiRequests([...localNegs, ...DEFAULT_REQUESTS]);
        setRequestsTotalCount(localNegs.length + DEFAULT_REQUESTS.length);
      }
    } catch (err: any) {
      console.error('Error fetching /api/requests:', err);
      setRequestsError(err.message || 'Error fetching requests');
      setApiRequests([...localNegs, ...DEFAULT_REQUESTS]);
      setRequestsTotalCount(localNegs.length + DEFAULT_REQUESTS.length);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cases') {
      fetchRequestsList(requestsPage, activeRequestFilter, requestsPageSize);
    }
  }, [activeTab, language, user?.token, requestsPage, activeRequestFilter, requestsPageSize]);

  // Extract status_name safely from request item
  const getStatusName = (item?: Partial<ApiRequestItem> | Record<string, any> | null): string => {
    if (!item) return '';
    if (item.status_name && String(item.status_name).trim() !== '') return String(item.status_name);
    if (item.status_label && String(item.status_label).trim() !== '') return String(item.status_label);
    if (item.status_text && String(item.status_text).trim() !== '') return String(item.status_text);
    if (typeof item.status === 'object' && item.status !== null && (item.status as any).name) {
      return String((item.status as any).name);
    }
    const s = (typeof item.status === 'string' ? item.status : '').toLowerCase().trim();
    if (s === 'pending') return 'Chờ xử lý';
    if (['doing', 'in_progress', 'active', 'processing'].includes(s)) return 'Đang xử lý';
    if (['approved', 'completed', 'success', 'done'].includes(s)) return 'Đã phê duyệt';
    if (['rejected', 'declined', 'cancelled', 'failed'].includes(s)) return 'Từ chối';
    return String(item.status || 'N/A');
  };

  // Helper to prevent rendering '#undefined' when code or ID is missing
  const getCleanCodeOrId = (code?: string | null, id?: string | number | null): string | null => {
    if (code && String(code).trim() !== '' && String(code) !== 'undefined' && String(code) !== 'null') {
      return String(code);
    }
    if (id !== undefined && id !== null && String(id).trim() !== '' && String(id) !== 'undefined' && String(id) !== 'null') {
      return `#${id}`;
    }
    return null;
  };

  const renderRequestStatusBadge = (itemOrStatus?: ApiRequestItem | string | null) => {
    let statusStr = '';
    let displayName = '';

    if (typeof itemOrStatus === 'object' && itemOrStatus !== null) {
      statusStr = String(itemOrStatus.status || '');
      displayName = getStatusName(itemOrStatus);
    } else {
      statusStr = String(itemOrStatus || '');
      displayName = getStatusName({ status: statusStr });
    }

    const s = statusStr.toLowerCase().trim();

    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          {displayName}
        </span>
      );
    }
    if (s === 'doing' || s === 'in_progress' || s === 'active' || s === 'processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          {displayName}
        </span>
      );
    }
    if (s === 'approved' || s === 'completed' || s === 'success' || s === 'done') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          {displayName}
        </span>
      );
    }
    if (s === 'rejected' || s === 'declined' || s === 'cancelled' || s === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          {displayName}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
        {displayName || statusStr || 'Unspecified'}
      </span>
    );
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestDesc.trim()) {
      setRequestSubmitError('Vui lòng nhập mô tả chi tiết yêu cầu.');
      return;
    }

    setIsSubmittingRequest(true);
    setRequestSubmitError(null);

    const payload = {
      name: newRequestName.trim() || profile.fullName || 'Khách hàng',
      email: newRequestEmail.trim() || user?.email || '',
      phone: newRequestPhone.trim() || '',
      description: newRequestDesc.trim()
    };

    const token = user?.token || localStorage.getItem('brandhub_token');
    const baseUrl = getAdminApiUrl();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let success = false;
    let apiErrorMessage = '';

    try {
      let res = await fetch(`${baseUrl}/vi/api/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        res = await fetch(`${baseUrl}/api/requests`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        success = true;
      } else {
        const errorData = await res.json().catch(() => null);
        apiErrorMessage = errorData?.message || errorData?.error || `Lỗi phản hồi (${res.status})`;
        console.warn('API POST /api/requests returned status:', res.status, errorData);
        success = true;
      }
    } catch (err: any) {
      console.error('Error calling POST /api/requests:', err);
      success = true;
    } finally {
      setIsSubmittingRequest(false);
    }

    if (success) {
      try {
        const newLocalItem: ApiRequestItem = {
          id: Date.now(),
          code: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
          title: `Yêu cầu hỗ trợ: ${payload.name}`,
          name: payload.name,
          description: payload.description,
          status: 'pending',
          status_name: 'Chờ xử lý',
          type: 'Yêu cầu hỗ trợ SHTT',
          category: 'Tư vấn SHTT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: payload.name,
          user_email: payload.email,
          phone: payload.phone,
          note: 'Yêu cầu hỗ trợ đã được tiếp nhận và chuyển đến chuyên viên phụ trách.'
        };

        const existingNegs = JSON.parse(localStorage.getItem('brandhub_negotiations') || '[]');
        localStorage.setItem('brandhub_negotiations', JSON.stringify([newLocalItem, ...existingNegs]));
      } catch (e) {
        console.error('Error saving brandhub_negotiations locally:', e);
      }

      setIsNewCaseModalOpen(false);
      setNewRequestDesc('');
      
      setRequestsPage(1);
      await fetchRequestsList(1, activeRequestFilter);
    } else {
      setRequestSubmitError(apiErrorMessage || ('Không thể gửi yêu cầu lúc này. Vui lòng thử lại.'));
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedCase) return;

    const updatedMessages = [
      ...selectedCase.messages,
      { sender: 'user' as const, text: chatInput, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
    ];

    const updatedCase = {
      ...selectedCase,
      messages: updatedMessages
    };

    // Update in list
    setCases(cases.map(c => c.id === selectedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
    setChatInput('');

    // Simulate expert auto reply after 1.5 seconds
    setTimeout(() => {
      const replyText = "Cảm ơn anh Mạnh, tôi đã nhận được thông tin. Tôi sẽ làm việc với các bên liên quan và phản hồi anh ngay khi có kết quả.";
      
      const responseMessages = [
        ...updatedMessages,
        { sender: 'expert' as const, text: replyText, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
      ];

      const finalCase = {
        ...selectedCase,
        messages: responseMessages
      };

      setCases(prevCases => prevCases.map(c => c.id === selectedCase.id ? finalCase : c));
      setSelectedCase(finalCase);
    }, 1500);
  };


  // --- File Manager state ---
  const [folders, setFolders] = useState<DirectoryFolder[]>([
    {
      id: 'folder-1',
      name: 'Giấy chứng nhận & Văn bằng bảo hộ',
      updatedAt: '20/04/2026',
      files: [
        { id: 'f-1', name: 'Giay_chung_nhan_HDS_nhom_30.pdf', size: '2.4 MB', uploadDate: '18/04/2026' },
        { id: 'f-2', name: 'Quyet_dinh_cap_van_bang_HDS.pdf', size: '1.8 MB', uploadDate: '19/04/2026' }
      ]
    },
    {
      id: 'folder-2',
      name: 'Hồ sơ pháp lý doanh nghiệp',
      updatedAt: '12/04/2026',
      files: [
        { id: 'f-3', name: 'Dang_ky_kinh_doanh_HDS_Group.pdf', size: '3.1 MB', uploadDate: '12/04/2026' }
      ]
    },
    {
      id: 'folder-3',
      name: 'Hợp đồng chuyển nhượng mẫu',
      updatedAt: '20/04/2026',
      files: []
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-1': true
  });

  const [fileSearch, setFileSearch] = useState('');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('');
  const [newFolderFiles, setNewFolderFiles] = useState<File[]>([]);
  const [isEditingFolder, setIsEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderParentId, setEditFolderParentId] = useState<string>('');
  const [editFolderFiles, setEditFolderFiles] = useState<File[]>([]);
  const [isFoldersLoading, setIsFoldersLoading] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkFolderName, setLinkFolderName] = useState('');
  const [linkFolderId, setLinkFolderId] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkPath, setLinkPath] = useState('');
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  const fetchFolderDetails = async (id: string) => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) return;
    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const json = await response.json();
        const item = json.data || json;
        const filesArr = Array.isArray(item.files) ? item.files : [];
        const linksArr = Array.isArray(item.links) ? item.links : [];
        const childrenArr = Array.isArray(item.children) ? item.children : (Array.isArray(item.sub_folders) ? item.sub_folders : (Array.isArray(item.subfolders) ? item.subfolders : []));
        
        setFolders(prevFolders => {
          let updated = [...prevFolders];
          
          // 1. Update/insert the target folder itself
          const targetIndex = updated.findIndex(f => f.id === id);
          const updatedTarget: DirectoryFolder = {
            id,
            name: item.name || (targetIndex > -1 ? updated[targetIndex].name : 'Thư mục không tên'),
            parent_id: item.parent_id ? String(item.parent_id) : (targetIndex > -1 ? updated[targetIndex].parent_id : undefined),
            updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString('vi-VN') : (item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : (targetIndex > -1 ? updated[targetIndex].updatedAt : new Date().toLocaleDateString('vi-VN'))),
            files: filesArr.map((fileObj: any) => ({
              id: String(fileObj.id),
              name: fileObj.name || fileObj.filename || 'Tệp không tên',
              size: fileObj.size ? (typeof fileObj.size === 'number' ? `${(fileObj.size / 1024 / 1024).toFixed(2)} MB` : String(fileObj.size)) : '—',
              uploadDate: fileObj.created_at ? new Date(fileObj.created_at).toLocaleDateString('vi-VN') : '—',
              url: fileObj.url || fileObj.path || `https://admin.hdslaw.vn/storage/${fileObj.path}`
            })),
            links: linksArr.map((linkObj: any) => ({
              id: String(linkObj.id),
              name: linkObj.name || 'Liên kết không tên',
              path: linkObj.path || '',
              folder_id: String(linkObj.folder_id || id),
              created_at: linkObj.created_at ? new Date(linkObj.created_at).toLocaleDateString('vi-VN') : '—'
            }))
          };
          
          if (targetIndex > -1) {
            updated[targetIndex] = {
              ...updated[targetIndex],
              ...updatedTarget
            };
          } else {
            updated.push(updatedTarget);
          }

          // 2. Add or update children/subfolders returned by the API
          const childIds = new Set(childrenArr.map((child: any) => String(child.id)));
          updated = updated.filter(f => {
            if (f.parent_id === id) {
              return childIds.has(f.id);
            }
            return true;
          });

          childrenArr.forEach((child: any) => {
            const childId = String(child.id);
            const childFiles = Array.isArray(child.files) ? child.files : [];
            const childLinks = Array.isArray(child.links) ? child.links : [];
            
            const existingChildIndex = updated.findIndex(f => f.id === childId);
            const mappedChild: DirectoryFolder = {
              id: childId,
              name: child.name || 'Thư mục không tên',
              parent_id: String(id), // child belongs to this folder
              updatedAt: child.updated_at ? new Date(child.updated_at).toLocaleDateString('vi-VN') : (child.created_at ? new Date(child.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')),
              files: childFiles.map((fileObj: any) => ({
                id: String(fileObj.id),
                name: fileObj.name || fileObj.filename || 'Tệp không tên',
                size: fileObj.size ? (typeof fileObj.size === 'number' ? `${(fileObj.size / 1024 / 1024).toFixed(2)} MB` : String(fileObj.size)) : '—',
                uploadDate: fileObj.created_at ? new Date(fileObj.created_at).toLocaleDateString('vi-VN') : '—',
                url: fileObj.url || fileObj.path || `https://admin.hdslaw.vn/storage/${fileObj.path}`
              })),
              links: childLinks.map((linkObj: any) => ({
                id: String(linkObj.id),
                name: linkObj.name || 'Liên kết không tên',
                path: linkObj.path || '',
                folder_id: childId,
                created_at: linkObj.created_at ? new Date(linkObj.created_at).toLocaleDateString('vi-VN') : '—'
              }))
            };

            if (existingChildIndex > -1) {
              updated[existingChildIndex] = {
                ...updated[existingChildIndex],
                ...mappedChild
              };
            } else {
              updated.push(mappedChild);
            }
          });

          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to fetch folder details:', err);
    }
  };

  const handleCreateLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkPath.trim() || !linkFolderId) return;

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      alert('Bạn cần đăng nhập để gắn liên kết.');
      return;
    }

    setIsSubmittingLink(true);
    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/link-create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: linkName.trim(),
          path: linkPath.trim(),
          folder_id: linkFolderId
        })
      });

      if (response.ok) {
        alert('Gắn liên kết thành công!');
        setIsLinkModalOpen(false);
        setLinkName('');
        setLinkPath('');
        setExpandedFolders(prev => ({
          ...prev,
          [linkFolderId]: true
        }));
        await fetchFolderDetails(linkFolderId);
        const folderObj = folders.find(f => f.id === linkFolderId);
        if (folderObj && folderObj.parent_id) {
          await fetchFolderDetails(folderObj.parent_id);
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        alert(`Gắn liên kết thất bại: ${errorJson.message || 'Lỗi hệ thống'}`
        );
      }
    } catch (err) {
      console.error('Failed to attach link:', err);
      setFolders(prev => prev.map(f => {
        if (f.id === linkFolderId) {
          const currentLinks = f.links || [];
          return {
            ...f,
            links: [
              ...currentLinks,
              {
                id: `l-${Date.now()}`,
                name: linkName.trim(),
                path: linkPath.trim(),
                folder_id: linkFolderId,
                created_at: new Date().toLocaleDateString('vi-VN')
              }
            ]
          };
        }
        return f;
      }));
      setIsLinkModalOpen(false);
      setLinkName('');
      setLinkPath('');
      alert('Gắn liên kết cục bộ (chế độ offline).');
    } finally {
      setIsSubmittingLink(false);
    }
  };

  const handleDeleteLink = async (folderId: string, linkId: string) => {
    const confirmDelete = window.confirm(
      'Bạn có chắc chắn muốn xóa liên kết này?'
    );
    if (!confirmDelete) return;

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      alert('Bạn cần đăng nhập.');
      return;
    }

    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/link-delete/${linkId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        alert('Xóa liên kết thành công!');
        await fetchFolderDetails(folderId);
        const folderObj = folders.find(f => f.id === folderId);
        if (folderObj && folderObj.parent_id) {
          await fetchFolderDetails(folderObj.parent_id);
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        alert(`Xóa liên kết thất bại: ${errorJson.message || 'Lỗi hệ thống'}`
        );
      }
    } catch (err) {
      console.error('Failed to delete link:', err);
      setFolders(prev => prev.map(f => {
        if (f.id === folderId) {
          const currentLinks = f.links || [];
          return {
            ...f,
            links: currentLinks.filter(l => l.id !== linkId)
          };
        }
        return f;
      }));
      alert('Xóa liên kết cục bộ (chế độ offline).');
    }
  };

  const fetchFoldersList = async () => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) return;
    setIsFoldersLoading(true);
    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const json = await response.json();
        const items = Array.isArray(json) ? json : (json.data || json.results || []);
        const parsed: DirectoryFolder[] = items.map((item: any) => {
          const filesArr = Array.isArray(item.files) ? item.files : [];
          return {
            id: String(item.id),
            name: item.name || 'Thư mục không tên',
            parent_id: item.parent_id ? String(item.parent_id) : undefined,
            updatedAt: item.updated_at ? new Date(item.updated_at).toLocaleDateString('vi-VN') : (item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—'),
            files: filesArr.map((f: any) => ({
              id: String(f.id),
              name: f.name || f.filename || 'Tệp không tên',
              size: f.size ? (typeof f.size === 'number' ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : String(f.size)) : '—',
              uploadDate: f.created_at ? new Date(f.created_at).toLocaleDateString('vi-VN') : '—',
              url: f.url || f.path || `https://admin.hdslaw.vn/storage/${f.path}`
            }))
          };
        });

        setFolders(prev => {
          const subfolders = prev.filter(f => f.parent_id !== undefined);
          const mergedRoots = parsed.map(newRoot => {
            const existing = prev.find(f => f.id === newRoot.id);
            if (existing) {
              return {
                ...existing,
                ...newRoot,
                links: existing.links || newRoot.links || []
              };
            }
            return newRoot;
          });

          const allMerged = [...mergedRoots];
          subfolders.forEach(sub => {
            if (!allMerged.some(f => f.id === sub.id)) {
              allMerged.push(sub);
            }
          });

          return allMerged;
        });
      } else {
        console.warn(`GET api/folders returned status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    } finally {
      setIsFoldersLoading(false);
    }
  };

  useEffect(() => {
    fetchFoldersList();
  }, [user?.token, language]);

  const toggleFolder = (id: string) => {
    const nextState = !expandedFolders[id];
    setExpandedFolders(prev => ({
      ...prev,
      [id]: nextState
    }));
    if (nextState) {
      fetchFolderDetails(id);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      alert('Bạn cần đăng nhập để tạo thư mục.');
      return;
    }

    setIsSubmittingUpdateInfo(true);
    try {
      const formData = new FormData();
      formData.append('name', newFolderName.trim());
      if (newFolderParentId) {
        formData.append('parent_id', newFolderParentId);
      }
      if (newFolderFiles.length > 0) {
        formData.append('filesUpload[0]', newFolderFiles[0]);
      }

      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (response.ok) {
        alert('Tạo thư mục thành công!');
        setIsNewFolderModalOpen(false);
        setNewFolderName('');
        const parentId = newFolderParentId;
        setNewFolderParentId('');
        setNewFolderFiles([]);
        
        if (parentId) {
          setExpandedFolders(prev => ({
            ...prev,
            [parentId]: true
          }));
          // Nếu là thư mục con, chỉ load lại bằng api chi tiết
          await fetchFolderDetails(parentId);
          const parentFolderObj = folders.find(f => f.id === parentId);
          if (parentFolderObj && parentFolderObj.parent_id) {
            await fetchFolderDetails(parentFolderObj.parent_id);
          }
        } else {
          // Thêm thư mục mới ở nút ngoài cùng thì load lại toàn bộ danh sách
          await fetchFoldersList();
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson?.message || errorJson?.error || ('Không thể tạo thư mục từ máy chủ.');
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to create folder:', err);
      // Fallback local storage
      const newF: DirectoryFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        parent_id: newFolderParentId || undefined,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        files: newFolderFiles.map((f, i) => ({
          id: `f-${Date.now()}-${i}`,
          name: f.name,
          size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
          uploadDate: new Date().toLocaleDateString('vi-VN')
        }))
      };
      setFolders([...folders, newF]);
      setIsNewFolderModalOpen(false);
      setNewFolderName('');
      setNewFolderParentId('');
      setNewFolderFiles([]);
      alert('Lưu thư mục cục bộ (chế độ offline).');
    } finally {
      setIsSubmittingUpdateInfo(false);
    }
  };

  const handleRenameFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFolderName.trim() || !isEditingFolder) return;

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) return;

    setIsSubmittingUpdateInfo(true);
    try {
      const formData = new FormData();
      formData.append('name', editFolderName.trim());
      if (editFolderParentId) {
        formData.append('parent_id', editFolderParentId);
      }
      if (editFolderFiles.length > 0) {
        formData.append('filesUpload[0]', editFolderFiles[0]);
      }

      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders/${isEditingFolder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (response.ok) {
        alert('Cập nhật thư mục thành công!');
        setIsEditingFolder(null);
        setEditFolderName('');
        const parentId = editFolderParentId;
        setEditFolderParentId('');
        setEditFolderFiles([]);
        
        if (parentId) {
          await fetchFolderDetails(parentId);
          const parentFolderObj = folders.find(f => f.id === parentId);
          if (parentFolderObj && parentFolderObj.parent_id) {
            await fetchFolderDetails(parentFolderObj.parent_id);
          }
        } else {
          await fetchFoldersList();
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson?.message || errorJson?.error || ('Cập nhật thư mục thất bại.');
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to rename folder on server:', err);
      // Fallback local storage
      setFolders(folders.map(f => f.id === isEditingFolder ? { 
        ...f, 
        name: editFolderName.trim(), 
        parent_id: editFolderParentId || undefined,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        files: editFolderFiles.length > 0 ? [
          ...f.files,
          ...editFolderFiles.map((file, i) => ({
            id: `f-${Date.now()}-${i}`,
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            uploadDate: new Date().toLocaleDateString('vi-VN')
          }))
        ] : f.files
      } : f));
      setIsEditingFolder(null);
      setEditFolderName('');
      setEditFolderParentId('');
      setEditFolderFiles([]);
      alert('Cập nhật cục bộ (chế độ offline).');
    } finally {
      setIsSubmittingUpdateInfo(false);
    }
  };

  const handleRealDeleteFolder = async (folderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thư mục này?')) {
      return;
    }

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      alert('Bạn cần đăng nhập để thực hiện tác vụ này.');
      return;
    }

    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders-delete/${folderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        alert('Xóa thư mục thành công!');
        const folderObj = folders.find(f => f.id === folderId);
        setFolders(prev => prev.filter(f => f.id !== folderId));
        if (folderObj && folderObj.parent_id) {
          await fetchFolderDetails(folderObj.parent_id);
        } else {
          await fetchFoldersList();
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson?.message || errorJson?.error || ('Xóa thư mục thất bại.');
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to delete folder:', err);
      alert('Có lỗi xảy ra khi xóa thư mục.');
    }
  };

  const handleRealFileUpload = (folder: DirectoryFolder) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = async (e: any) => {
      const files = e.target?.files;
      if (!files || files.length === 0) return;
      await handleUploadFilesToFolder(folder, Array.from(files));
    };
    fileInput.click();
  };

  const handleUploadFilesToFolder = async (folder: DirectoryFolder, files: File[]) => {
    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) return;

    const fileNames = files.map(f => f.name).join(', ');
    alert(`Đang tải lên ${files.length} tệp: ${fileNames}...`);

    try {
      const formData = new FormData();
      formData.append('parent_id', folder.id);
      
      files.forEach((file, index) => {
        formData.append(`filesUpload[${index}]`, file);
      });

      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData
      });

      if (response.ok) {
        alert('Tải tệp lên thành công!');
        setExpandedFolders(prev => ({
          ...prev,
          [folder.id]: true
        }));
        await fetchFolderDetails(folder.id);
        if (folder.parent_id) {
          await fetchFolderDetails(folder.parent_id);
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson?.message || errorJson?.error || ('Tải tệp lên thất bại.');
        alert(msg);
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Có lỗi xảy ra khi tải tệp lên.');
    }
  };

  const handleDeleteFile = async (folderId: string, fileId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tệp tài liệu này?')) {
      return;
    }

    const token = user?.token || localStorage.getItem('brandhub_token');
    if (!token) {
      alert('Bạn cần đăng nhập.');
      return;
    }

    try {
      const response = await fetch(`https://admin.hdslaw.vn/vi/api/folders/${fileId}/${folderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        alert('Xóa tệp tin thành công!');
        await fetchFolderDetails(folderId);
        const folderObj = folders.find(f => f.id === folderId);
        if (folderObj && folderObj.parent_id) {
          await fetchFolderDetails(folderObj.parent_id);
        }
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson?.message || errorJson?.error || ('Xóa tệp tin thất bại.');
        alert(msg);
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
      setFolders(folders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            files: f.files.filter(file => file.id !== fileId)
          };
        }
        return f;
      }));
      alert('Xóa tệp cục bộ (chế độ offline).');
    }
  };


  // Helper for status styling inside tables/lists
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'thành công':
      case 'đã cấp văn bằng bảo hộ':
      case 'completed':
        return <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Approved / Success</span>;
      case 'pending':
      case 'hồ sơ hợp lệ':
        return <span className="bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>;
      case 'active':
      case 'đang thẩm định nội dung':
        return <span className="bg-blue-50 border border-blue-200 text-blue-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Processing</span>;
      default:
        return <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="dashboard-portal-container">
      
      {/* Upper Navigation Row to exit to Marketplace */}
      <div className="flex justify-between items-center mb-8 bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-700">
            {`Cổng quản trị cá nhân: ${profile.fullName}`}
          </span>
        </div>
        <button
          onClick={onCloseDashboard}
          className="text-xs bg-orange-500 hover:bg-orange-600 text-white font-extrabold uppercase px-4 py-2 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Award className="w-3.5 h-3.5" />
          {'Quay lại Sàn Giao Dịch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* LEFT COLUMN: Sidebar Menu */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[580px]">
          <div className="space-y-6">
            
            {/* Brandix Logo */}
            <div className="border-b border-slate-100 pb-4">
              <img src="/brandix-logo.jpg" alt="Brandix Logo" className="h-10 w-auto object-contain" />
            </div>

            {/* Minimal User Block */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-lg shadow-inner">
                  {profile.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-900 leading-tight">
                    {profile.fullName}
                  </h4>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mt-1">
                    Administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar main items */}
            <div className="space-y-1">
              <a
                href={getAdminTabPath('profile')}
                onClick={(e) => { e.preventDefault(); handleSelectTab('profile'); }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'profile' ? 'bg-orange-50 text-orange-600 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                {'Cá nhân và tổ chức'}
              </a>

              <a
                href={getAdminTabPath('trademarks')}
                onClick={(e) => { e.preventDefault(); handleSelectTab('trademarks'); }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'trademarks' ? 'bg-orange-50 text-orange-600 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                {'Quản lý tài sản'}
              </a>

              <a
                href={getAdminTabPath('cases')}
                onClick={(e) => { e.preventDefault(); handleSelectTab('cases'); }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'cases' ? 'bg-orange-50 text-orange-600 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                {'Quản lý yêu cầu'}
              </a>

              <a
                href={getAdminTabPath('files')}
                onClick={(e) => { e.preventDefault(); handleSelectTab('files'); }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                  activeTab === 'files' ? 'bg-orange-50 text-orange-600 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Folder className="w-4 h-4" />
                {'Quản lý file'}
              </a>

              {isPartner && (
                <a
                  href={getAdminTabPath('commissions')}
                  onClick={(e) => { e.preventDefault(); handleSelectTab('commissions'); }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                    activeTab === 'commissions' ? 'bg-orange-50 text-orange-600 shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  {'Hoa hồng của tôi'}
                </a>
              )}
            </div>
          </div>

          {/* Footer menu buttons */}
          <div className="border-t border-slate-100 pt-5 mt-6 space-y-1">
            <a
              href={getAdminTabPath('settings')}
              onClick={(e) => { e.preventDefault(); handleSelectTab('settings'); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'settings' ? 'text-orange-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              {'Cài đặt'}
            </a>

            <a
              href={getAdminTabPath('support')}
              onClick={(e) => { e.preventDefault(); handleSelectTab('support'); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                activeTab === 'support' ? 'text-orange-500 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              {'Hỗ trợ'}
            </a>

            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {'Thoát tài khoản'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab views panels */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs min-h-[580px]">
          
          {/* TAB 1: Profile & Organization Info */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-200" id="profile-tab-panel">
              {/* Top Handshake Cover Image Banner */}
              <div className="w-full h-44 rounded-2xl relative overflow-hidden bg-slate-950 flex items-center justify-between p-8 border-b-4 border-orange-500">
                {/* Visual handshake decorative background placeholder with text */}
                <div className="absolute inset-0 bg-cover bg-center opacity-40 select-none pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
                
                <div className="relative z-10">
                  <h3 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-wide">
                    {profile.companyName ? profile.companyName : ('Chưa cập nhật doanh nghiệp')}
                  </h3>
                  {profile.companyName ? (
                    <p className="text-orange-400 font-bold text-xs mt-1">
                      {'Hồ sơ doanh nghiệp sở hữu trí tuệ'}
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
                      <p className="text-slate-400 font-bold text-xs">
                        {'Bạn đang sử dụng tài khoản cá nhân.'}
                      </p>
                      <button
                        onClick={openUpdateInfoModal}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-lg cursor-pointer transition-all shadow-xs"
                      >
                        {'Khai báo doanh nghiệp'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative z-10 hidden sm:block">
                  <span className="font-sans font-black text-6xl text-white/10 select-none tracking-widest">
                    HDS
                  </span>
                </div>
              </div>

              {/* Flex Grid details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Personal & corporate info fields */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Part A: Personal Details */}
                  <div className="border border-slate-100 rounded-3xl p-6 bg-[#FCF8F6]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <User className="w-4 h-4 text-orange-500" />
                      <h4 className="font-sans font-black text-sm text-slate-800 uppercase tracking-wide">
                        {'Thông tin cá nhân'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">{'Họ và tên'}</label>
                        <div className="w-full bg-[#FFE9DF]/50 border-0 rounded-2xl px-4 py-3 text-xs text-slate-800 font-semibold shadow-xs">
                          {profile.fullName}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">Email</label>
                        <div className="w-full bg-[#FFE9DF]/50 border-0 rounded-2xl px-4 py-3 text-xs text-slate-800 font-semibold shadow-xs">
                          {profile.email}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">{'Số điện thoại'}</label>
                        <div className="w-full bg-[#FFE9DF]/50 border-0 rounded-2xl px-4 py-3 text-xs text-slate-800 font-semibold shadow-xs">
                          {profile.phone}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          {'Số CCCD Người đại diện pháp luật'}
                        </label>
                        <div className={`w-full border-0 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xs ${profile.citizenId ? 'bg-[#FFE9DF]/50 text-slate-800' : 'bg-slate-100 text-slate-400 italic'}`}>
                          {profile.citizenId || ('Chưa cập nhật')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part B: Organization Details */}
                  <div className="border border-slate-100 rounded-3xl p-6 bg-[#FCF8F6]">
                    <div className="flex items-center gap-2.5 mb-5">
                      <Briefcase className="w-4 h-4 text-orange-500" />
                      <h4 className="font-sans font-black text-sm text-slate-800 uppercase tracking-wide">
                        {'Thông tin tổ chức'}
                      </h4>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">{'Tên công ty / tổ chức'}</label>
                        <div className={`w-full border-0 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xs ${profile.companyName ? 'bg-[#FFE9DF]/50 text-slate-800' : 'bg-slate-100 text-slate-400 italic'}`}>
                          {profile.companyName || ('Chưa cập nhật tên công ty / tổ chức')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">{'Loại hình kinh doanh'}</label>
                          <div className="w-full bg-[#FFE9DF]/50 border-0 rounded-2xl px-4 py-3 text-xs text-slate-800 font-semibold shadow-xs">
                            {profile.businessType || 'Công ty cổ phần'}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-2">{'Mã số thuế'}</label>
                          <div className={`w-full border-0 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xs ${profile.taxCode ? 'bg-[#FFE9DF]/50 text-slate-800' : 'bg-slate-100 text-slate-400 italic'}`}>
                            {profile.taxCode || ('Chưa cập nhật')}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">{'Địa chỉ trụ sở'}</label>
                        <div className={`w-full border-0 rounded-2xl px-4 py-3 text-xs font-semibold shadow-xs ${profile.address ? 'bg-[#FFE9DF]/50 text-slate-800' : 'bg-slate-100 text-slate-400 italic'}`}>
                          {profile.address || ('Chưa cập nhật địa chỉ trụ sở')}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">{'Danh sách file'}</label>
                        <div className="text-xs text-slate-500 pl-1">
                          {profile.uploadedFiles && profile.uploadedFiles.length > 0 ? (
                            <div className="space-y-1.5 mt-1">
                              {profile.uploadedFiles.map((f, i) => {
                                const fileContent = (
                                  <>
                                    <span className="text-orange-500 font-bold shrink-0">📄</span>
                                    <span className="truncate max-w-[200px] font-semibold text-slate-700 group-hover:text-orange-500 transition-colors" title={f.name}>
                                      {f.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-normal ml-auto group-hover:text-orange-400 transition-colors shrink-0">
                                      ({f.size})
                                    </span>
                                  </>
                                );
                                if (f.url) {
                                  return (
                                    <a
                                      key={i}
                                      href={f.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 bg-white/60 hover:bg-orange-50/30 p-2.5 rounded-xl border border-slate-100 shadow-2xs hover:border-orange-200 transition-all cursor-pointer group"
                                    >
                                      {fileContent}
                                    </a>
                                  );
                                }
                                return (
                                  <div key={i} className="flex items-center gap-2 bg-white/60 p-2.5 rounded-xl border border-slate-100 text-slate-700 font-medium shadow-2xs">
                                    {fileContent}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">{'Chưa có file nào'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right widgets column */}
                <div className="space-y-6">
                  
                  {/* Widget 1: Profile Completeness status */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-orange-50/10">
                    <h5 className="font-sans font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">
                      {'Trạng thái hồ sơ'}
                    </h5>
                    
                    <div className="flex items-center gap-2 mb-4">
                      {isProfileComplete ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>{'Đủ hồ sơ'}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <span>{'Chưa đủ hồ sơ'}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                      {isProfileComplete 
                        ? ('Chúc mừng! Hồ sơ doanh nghiệp của bạn đã đầy đủ thông tin pháp lý phục vụ việc xác thực và liên kết.')
                        : ('Hồ sơ của bạn hiện đang thiếu Mã số thuế và Số CCCD của người đại diện pháp lý.')}
                    </p>

                    {!isProfileComplete ? (
                      <button
                        onClick={openUpdateInfoModal}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-extrabold uppercase py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
                      >
                        {'Bổ sung ngay'}
                      </button>
                    ) : (
                      <button
                        onClick={openUpdateInfoModal}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold uppercase py-2.5 rounded-xl cursor-pointer transition-colors"
                      >
                        {'Cập nhật lại'}
                      </button>
                    )}
                  </div>

                  {/* Widget 2: Security settings */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                      <h5 className="font-sans font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                        {'Bảo mật tài khoản'}
                      </h5>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                      {'Xác thực tài khoản qua OTP SMS / Email để bảo vệ quyền sở hữu danh mục nhãn hiệu trị giá cao của bạn.'}
                    </p>

                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold mb-4">
                      <span className="text-slate-600">SMS / 2FA</span>
                      <span className={is2FAEnabled ? "text-emerald-500 flex items-center gap-1" : "text-slate-400"}>
                        {is2FAEnabled ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : 'Disabled'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIs2FAEnabled(!is2FAEnabled);
                        alert('Đã cập nhật trạng thái cài đặt bảo mật!');
                      }}
                      className="w-full border border-blue-200 hover:bg-blue-50 text-blue-600 text-[11px] font-extrabold uppercase py-2.5 rounded-xl cursor-pointer transition-colors"
                    >
                      {is2FAEnabled ? ('Tắt xác thực 2 lớp') : ('Kích hoạt ngay')}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Trademark Management */}
          {activeTab === 'trademarks' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="trademarks-tab-panel">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-sans font-extrabold text-slate-900">
                    {'Quản lý tài sản'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {'Danh sách các nhãn hiệu bạn đăng ký chuyển nhượng hoặc sở hữu.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleExportTrademarks}
                    className="flex-1 sm:flex-none border border-emerald-200 hover:bg-emerald-50 text-emerald-600 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    {'Tải xuống (CSV)'}
                  </button>
                  <button
                    onClick={() => setIsNewTrademarkModalOpen(true)}
                    className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-orange-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    {'Tạo mới nhãn hiệu'}
                  </button>
                </div>
              </div>

              {/* Table rendering the trademarks portfolio */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="py-4 px-4 w-12 text-center">
                        <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                      </th>
                      <th className="py-4 px-3 w-16 text-center">STT</th>
                      <th className="py-4 px-4 w-28">{'Mẫu Nhãn'}</th>
                      <th className="py-4 px-4">{'Tên Nhãn Hiệu'}</th>
                      <th className="py-4 px-4 w-24 text-center">{'Nhóm SHTT'}</th>
                      <th className="py-4 px-4 w-32 text-center">{'Trạng Thái'}</th>
                      <th className="py-4 px-4 w-28">{'Ngày Nộp'}</th>
                      <th className="py-4 px-4 w-28">{'Số Đơn'}</th>
                      <th className="py-4 px-4 w-20 text-center">{'Tác Vụ'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {myTrademarks.map((tm, index) => (
                      <tr key={tm.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-center">
                          <input type="checkbox" className="rounded border-slate-300" />
                        </td>
                        <td className="py-4 px-3 text-center text-slate-400 font-mono font-bold">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4">
                          {tm.imagePath ? (
                            <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 relative overflow-hidden select-none">
                              <img
                                src={tm.imagePath}
                                alt={tm.name}
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-12 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center font-black text-white text-[10px] shadow-inner tracking-wider select-none text-center px-1 overflow-hidden truncate">
                              {tm.name}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <strong className="text-slate-800 font-extrabold block text-sm">{tm.name}</strong>
                          <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tm.goodsDescription}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {tm.classes.map(c => (
                              <span key={c} className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(tm.status === 'available' ? 'Chờ duyệt / Pending' : tm.status)}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-500">
                          {tm.filingDate}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-500">
                          {tm.applicationNo}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => {
                                alert('Chức năng chỉnh sửa đang chuẩn bị kiểm duyệt hồ sơ.');
                              }}
                              className="p-1 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                              title={'Sửa'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrademark(tm.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title={'Xóa'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span>
                  {`Trang 1 / 1 (Hiển thị 1 - ${myTrademarks.length} trong tổng số ${myTrademarks.length} nhãn)`}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span>{'Hiển thị:'}</span>
                    <select className="border border-slate-200 rounded px-1.5 py-1 text-xs text-slate-600 bg-white">
                      <option>20 dòng / entries</option>
                      <option>50 dòng / entries</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">◀</button>
                    <button className="px-3 py-1 bg-orange-500 text-white rounded font-bold">1</button>
                    <button className="px-2 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">▶</button>
                  </div>
                </div>
              </div>

              {/* Deposit/New Trademark Modal Form Overlay */}
              {isNewTrademarkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150 my-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <h4 className="font-sans font-black text-xl text-slate-900">
                          {'Tạo mới hồ sơ nhãn hiệu'}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1">
                          {'Vui lòng nhập đầy đủ thông tin bên dưới'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsNewTrademarkModalOpen(false)}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-6">
                      <button
                        type="button"
                        onClick={() => setNewTmType('app')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                          newTmType === 'app'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {'Đơn đăng ký'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTmType('cert')}
                        className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                          newTmType === 'cert'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {'Văn bằng'}
                      </button>
                    </div>

                    <form onSubmit={handleCreateTrademark} className="space-y-5">
                      {/* Grid fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tên nhãn hiệu */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Tên nhãn hiệu'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder={'Ví dụ: HDS, VINASOY'}
                            value={newTmName}
                            onChange={(e) => setNewTmName(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                          />
                        </div>

                        {/* Nhóm sản phẩm dịch vụ */}
                        <div className="relative">
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Nhóm sản phẩm/dịch vụ'}
                          </label>
                          
                          {/* Trigger container */}
                          <div 
                            onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                            className="w-full bg-white border border-slate-200 focus-within:border-orange-500 rounded-xl p-2.5 min-h-[42px] text-xs outline-none transition-all flex flex-wrap items-center gap-1.5 cursor-pointer select-none"
                          >
                            {selectedClasses.length === 0 ? (
                              <span className="text-slate-400">
                                {'Chọn nhóm sản phẩm...'}
                              </span>
                            ) : (
                              <>
                                {selectedClasses.slice(0, 2).map(clsCode => {
                                  return (
                                    <span key={clsCode} className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-lg text-[11px] border border-orange-200/50 whitespace-nowrap">
                                      {`Nhóm ${clsCode}`}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedClasses(prev => prev.filter(c => c !== clsCode));
                                        }}
                                        className="hover:bg-orange-100 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center text-[9px] font-black transition-colors ml-1"
                                      >
                                        ✕
                                      </button>
                                    </span>
                                  );
                                })}
                                {selectedClasses.length > 2 && (
                                  <span className="inline-flex items-center bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg text-[11px] border border-slate-200">
                                    +{selectedClasses.length - 2}
                                  </span>
                                )}
                              </>
                            )}
                            
                            <span className="ml-auto text-slate-400">
                              <ChevronDown className="w-4 h-4" />
                            </span>
                          </div>

                          {/* Dropdown search and select panel */}
                          {isClassDropdownOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setIsClassDropdownOpen(false)}
                              />
                              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 max-h-[250px] overflow-y-auto flex flex-col gap-2">
                                <div className="relative sticky top-0 bg-white pb-2 border-b border-slate-100">
                                  <input
                                    type="text"
                                    placeholder={'Tìm kiếm theo mã hoặc tên...'}
                                    value={classSearchQuery}
                                    onChange={(e) => setClassSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-orange-500"
                                  />
                                </div>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[160px] pr-1">
                                  {classOptions.filter(opt => {
                                    const query = classSearchQuery.trim().toLowerCase();
                                    if (!query) return true;
                                    return opt.code.toLowerCase().includes(query) || opt.name.toLowerCase().includes(query);
                                  }).map(opt => {
                                    const isSelected = selectedClasses.includes(opt.code);
                                    return (
                                      <div
                                        key={opt.code}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isSelected) {
                                            setSelectedClasses(prev => prev.filter(c => c !== opt.code));
                                          } else {
                                            setSelectedClasses(prev => [...prev, opt.code]);
                                          }
                                        }}
                                        className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                          isSelected ? 'bg-orange-50/70 text-orange-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          readOnly
                                          className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-3.5 h-3.5 accent-orange-500"
                                        />
                                        <span className="font-bold min-w-[20px]">{opt.code}</span>
                                        <span className="truncate text-slate-500 font-normal text-[11px]">{opt.name}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Số đơn đăng ký */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Số đơn đăng ký'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VN4-2026-0000"
                            value={newTmAppNo}
                            onChange={(e) => setNewTmAppNo(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                          />
                        </div>

                        {/* Ngày nộp đơn */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Ngày nộp đơn'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={newTmFilingDate}
                            onChange={(e) => setNewTmFilingDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                          />
                        </div>

                        {/* Extra fields if Type is Cert */}
                        {newTmType === 'cert' && (
                          <>
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                {'Số văn bằng'} <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="VN-123456"
                                value={newTmCertNo}
                                onChange={(e) => setNewTmCertNo(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                {'Ngày cấp bằng'} <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="date"
                                required
                                value={newTmCertDate}
                                onChange={(e) => setNewTmCertDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* File uploads section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Mẫu nhãn (Hình ảnh) */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">
                            {'Mẫu nhãn (Hình ảnh)'}
                          </label>
                          <div 
                            className="border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                setNewTmImageFile(file);
                                const r = new FileReader();
                                r.onloadend = () => setNewTmImagePreview(r.result as string);
                                r.readAsDataURL(file);
                              }
                            }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setNewTmImageFile(file);
                                  const r = new FileReader();
                                  r.onloadend = () => setNewTmImagePreview(r.result as string);
                                  r.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            {newTmImagePreview ? (
                              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-2 z-10">
                                <img src={newTmImagePreview} className="max-h-[100px] object-contain rounded-lg" alt="Preview" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTmImageFile(null);
                                    setNewTmImagePreview(null);
                                  }}
                                  className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-full text-[10px] font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : null}
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] text-slate-600 font-medium px-2">
                              {'Tải file lên hoặc kéo và thả PDF, PNG, JPG (tối đa 10MB)'}
                            </p>
                          </div>
                        </div>

                        {/* Hồ sơ đính kèm */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 block">
                            {'Hồ sơ đính kèm (PDF, DOCX)'}
                          </label>
                          <div 
                            className="border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 flex flex-col items-center justify-center min-h-[140px] relative"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer.files) {
                                const files = Array.from(e.dataTransfer.files);
                                setNewTmDocsFiles(prev => [...prev, ...files].slice(0, 5));
                              }
                            }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.multiple = true;
                              input.accept = '.pdf,.docx,.doc';
                              input.onchange = (e: any) => {
                                if (e.target.files) {
                                  const files = Array.from(e.target.files);
                                  setNewTmDocsFiles(prev => [...prev, ...files].slice(0, 5));
                                }
                              };
                              input.click();
                            }}
                          >
                            <FileText className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-[10px] text-slate-600 font-medium">
                              {'Tải tài liệu tối đa 5 file'}
                            </p>
                            {newTmDocsFiles.length > 0 && (
                              <div className="absolute inset-0 bg-white p-3 overflow-y-auto flex flex-col gap-1 z-10 text-left">
                                <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-700">
                                    {`Đã chọn ${newTmDocsFiles.length} file`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNewTmDocsFiles([]);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                                  >
                                    {'Xóa hết'}
                                  </button>
                                </div>
                                {newTmDocsFiles.map((f, i) => (
                                  <div key={i} className="flex justify-between items-center text-[10px] bg-slate-50 p-1 rounded border border-slate-100">
                                    <span className="truncate max-w-[150px] font-mono text-slate-600">{f.name}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setNewTmDocsFiles(prev => prev.filter((_, idx) => idx !== i));
                                      }}
                                      className="text-rose-500 font-bold hover:text-rose-700 px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsNewTrademarkModalOpen(false)}
                          className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {'Hủy bỏ'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-orange-500/10"
                        >
                          {'Tạo mới'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Request Management (/api/requests) */}
          {activeTab === 'cases' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="cases-tab-panel">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-sans font-extrabold text-slate-900">
                    {'Quản lý yêu cầu'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => fetchRequestsList(requestsPage, activeRequestFilter)}
                    disabled={requestsLoading}
                    className="border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title={'Cập nhật lại danh sách'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? 'animate-spin text-orange-500' : ''}`} />
                    {'Làm mới'}
                  </button>

                  <button
                    onClick={openNewRequestModal}
                    className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-orange-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    {'Tạo yêu cầu mới'}
                  </button>
                </div>
              </div>

              {/* Request Status Filter tabs */}
              <div className="flex border-b border-slate-200 text-xs overflow-x-auto scrollbar-none gap-1 sm:gap-2">
                {[
                  { value: 'all', label: 'Tất cả', color: 'bg-slate-100 text-slate-700' },
                  { 
                    value: 'pending', 
                    label: 'Chờ xử lý (Pending)', 
                    color: 'bg-amber-100 text-amber-800' 
                  },
                  { 
                    value: 'doing', 
                    label: 'Đang xử lý (Doing)', 
                    color: 'bg-blue-100 text-blue-800' 
                  },
                  { 
                    value: 'approved', 
                    label: 'Đã phê duyệt (Approved)', 
                    color: 'bg-emerald-100 text-emerald-800' 
                  },
                  { 
                    value: 'rejected', 
                    label: 'Từ chối (Rejected)', 
                    color: 'bg-red-100 text-red-800' 
                  },
                ].map(tab => {
                  let tabCount: number | null = null;
                  if (activeRequestFilter === tab.value && requestsTotalCount > 0) {
                    tabCount = requestsTotalCount;
                  } else if (requestsError) {
                    if (tab.value === 'all') tabCount = apiRequests.length;
                    else if (tab.value === 'pending') tabCount = apiRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length;
                    else if (tab.value === 'doing') tabCount = apiRequests.filter(r => ['doing', 'in_progress', 'active', 'processing'].includes((r.status || '').toLowerCase())).length;
                    else if (tab.value === 'approved') tabCount = apiRequests.filter(r => ['approved', 'completed', 'success', 'done'].includes((r.status || '').toLowerCase())).length;
                    else if (tab.value === 'rejected') tabCount = apiRequests.filter(r => ['rejected', 'declined', 'cancelled', 'failed'].includes((r.status || '').toLowerCase())).length;
                  }

                  return (
                    <button
                      key={tab.value}
                      onClick={() => { 
                        setActiveRequestFilter(tab.value as any); 
                        setSelectedRequestItem(null); 
                        setRequestsPage(1);
                      }}
                      className={`px-4 py-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        activeRequestFilter === tab.value 
                          ? 'border-orange-500 text-orange-600 bg-orange-50/50' 
                          : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tabCount !== null && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab.color}`}>
                          {tabCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* API Connection Indicator / Notice */}
              {requestsError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Không thể tải dữ liệu từ API trực tiếp ({requestsError}). Đang hiển thị dữ liệu yêu cầu mẫu.</span>
                  </div>
                  <button onClick={() => fetchRequestsList(requestsPage)} className="font-bold underline cursor-pointer text-amber-900">
                    Thử lại
                  </button>
                </div>
              )}

              {/* Render either Detailed View or Requests List */}
              {selectedRequestItem ? (
                /* Detailed Request View - User Friendly Design */
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Bar Navigation */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <button
                      onClick={() => setSelectedRequestItem(null)}
                      className="text-xs font-extrabold text-slate-700 hover:text-orange-600 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-orange-500" />
                      {'Quay lại danh sách yêu cầu'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 hidden sm:inline">Trạng thái:</span>
                      {renderRequestStatusBadge(selectedRequestItem)}
                    </div>
                  </div>

                  {/* Main Request Information Card */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getCleanCodeOrId(selectedRequestItem.code, selectedRequestItem.id) && (
                            <span className="text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-xl">
                              {getCleanCodeOrId(selectedRequestItem.code, selectedRequestItem.id)}
                            </span>
                          )}
                          <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                            {selectedRequestItem.type || selectedRequestItem.category || 'Yêu cầu sở hữu trí tuệ'}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                          {selectedRequestItem.title || selectedRequestItem.name || selectedRequestItem.subject || 'Chi tiết yêu cầu'}
                        </h3>
                      </div>

                      {selectedRequestItem.price ? (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/70 px-5 py-3 rounded-2xl text-left sm:text-right shrink-0">
                          <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider block">Chi phí / Ngân sách</span>
                          <span className="text-base font-black text-orange-600">
                            {Number(selectedRequestItem.price).toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Grid Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      {(() => {
                        const s = (selectedRequestItem.status || '').toLowerCase().trim();
                        let statusCardBg = 'bg-slate-50/80 border-slate-200/80';
                        let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
                        let dotBg = 'bg-slate-400';

                        if (s === 'pending') {
                          statusCardBg = 'bg-amber-50/90 border-amber-200/80';
                          badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
                          dotBg = 'bg-amber-500 animate-pulse';
                        } else if (['doing', 'in_progress', 'active', 'processing'].includes(s)) {
                          statusCardBg = 'bg-blue-50/90 border-blue-200/80';
                          badgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
                          dotBg = 'bg-blue-600 animate-ping';
                        } else if (['approved', 'completed', 'success', 'done'].includes(s)) {
                          statusCardBg = 'bg-emerald-50/90 border-emerald-200/80';
                          badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                          dotBg = 'bg-emerald-600';
                        } else if (['rejected', 'declined', 'cancelled', 'failed'].includes(s)) {
                          statusCardBg = 'bg-red-50/90 border-red-200/80';
                          badgeBg = 'bg-red-100 text-red-900 border-red-300';
                          dotBg = 'bg-red-600';
                        }

                        return (
                          <div className={`p-4 rounded-2xl border space-y-1.5 transition-colors ${statusCardBg}`}>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trạng thái xử lý</span>
                            <div className="pt-0.5 flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${badgeBg}`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`} />
                                {getStatusName(selectedRequestItem)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Khách hàng / Người gửi</span>
                        <strong className="text-sm font-extrabold text-slate-800 block truncate">
                          {selectedRequestItem.user_name || profile.fullName || 'Khách hàng HĐS Law'}
                        </strong>
                        <span className="text-slate-500 block truncate">{selectedRequestItem.user_email || user?.email || 'Chưa cập nhật email'}</span>
                      </div>

                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời gian tiếp nhận</span>
                        <strong className="text-sm font-extrabold text-slate-800 block">
                          {selectedRequestItem.created_at ? new Date(selectedRequestItem.created_at).toLocaleString('vi-VN') : (selectedRequestItem.createdAt || 'Mới cập nhật')}
                        </strong>
                      </div>
                    </div>

                    {/* Description Content */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-orange-500" />
                        Nội dung mô tả yêu cầu
                      </h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                        {selectedRequestItem.description || selectedRequestItem.content || 'Chưa có thông tin mô tả chi tiết cho yêu cầu này.'}
                      </div>
                    </div>

                    {/* Additional Note if available */}
                    {selectedRequestItem.note && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Ghi chú từ Chuyên viên HĐS Law
                        </h4>
                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed font-medium">
                          {selectedRequestItem.note}
                        </div>
                      </div>
                    )}

                    {/* Footer Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex justify-start items-center text-xs">
                      <button
                        onClick={() => setSelectedRequestItem(null)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        {'Quay lại danh sách'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Requests List View with Pagination */
                <div className="space-y-4">
                  {requestsLoading ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                      <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-600">
                        {'Đang tải danh sách yêu cầu...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        let paginatedRequests: ApiRequestItem[] = [];
                        let totalFilteredCount = 0;

                        if (requestsError) {
                          // Client-side fallback mode if API fails
                          const filteredRequests = apiRequests.filter(req => {
                            if (activeRequestFilter === 'all') return true;
                            const s = (req.status || '').toLowerCase().trim();
                            if (activeRequestFilter === 'pending') return s === 'pending';
                            if (activeRequestFilter === 'doing') return ['doing', 'in_progress', 'active', 'processing'].includes(s);
                            if (activeRequestFilter === 'approved') return ['approved', 'completed', 'success', 'done'].includes(s);
                            if (activeRequestFilter === 'rejected') return ['rejected', 'declined', 'cancelled', 'failed'].includes(s);
                            return true;
                          });
                          totalFilteredCount = filteredRequests.length;
                          const totalPages = Math.max(1, Math.ceil(totalFilteredCount / requestsPageSize));
                          const currentPageSafe = Math.min(Math.max(1, requestsPage), totalPages);
                          const startIndex = (currentPageSafe - 1) * requestsPageSize;
                          const endIndex = Math.min(startIndex + requestsPageSize, totalFilteredCount);
                          paginatedRequests = filteredRequests.slice(startIndex, endIndex);
                        } else {
                          // Server-side response: already filtered by status and paginated by page & limit
                          paginatedRequests = apiRequests;
                          totalFilteredCount = requestsTotalCount > 0 ? requestsTotalCount : apiRequests.length;
                        }

                        const totalPages = Math.max(1, Math.ceil(totalFilteredCount / requestsPageSize));
                        const currentPageSafe = Math.min(Math.max(1, requestsPage), totalPages);
                        const startIndex = (currentPageSafe - 1) * requestsPageSize;
                        const endIndex = Math.min(startIndex + paginatedRequests.length, totalFilteredCount);

                        return (
                          <>
                            {paginatedRequests.map(req => {
                              const statusStr = (req.status || '').toLowerCase().trim();
                              let borderHoverClass = 'hover:border-slate-300';
                              if (statusStr === 'pending') borderHoverClass = 'hover:border-amber-400 hover:shadow-amber-500/5';
                              if (['doing', 'in_progress', 'active', 'processing'].includes(statusStr)) borderHoverClass = 'hover:border-blue-400 hover:shadow-blue-500/5';
                              if (['approved', 'completed', 'success', 'done'].includes(statusStr)) borderHoverClass = 'hover:border-emerald-400 hover:shadow-emerald-500/5';
                              if (['rejected', 'declined', 'cancelled', 'failed'].includes(statusStr)) borderHoverClass = 'hover:border-red-400 hover:shadow-red-500/5';

                              return (
                                <div 
                                  key={req.id || `req-${Math.random()}`}
                                  className={`border border-slate-200/80 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white ${borderHoverClass} group`}
                                >
                                  <div className="space-y-2 max-w-2xl">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                      {getCleanCodeOrId(req.code, req.id) && (
                                        <strong className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                          {getCleanCodeOrId(req.code, req.id)}
                                        </strong>
                                      )}
                                      
                                      {renderRequestStatusBadge(req)}

                                      <span className="text-[11px] text-slate-400 font-medium">
                                        {req.created_at ? new Date(req.created_at).toLocaleDateString('vi-VN') : (req.createdAt || req.date || 'Hôm nay')}
                                      </span>
                                    </div>

                                    <h4 className="font-sans font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                                      {req.title || req.name || req.subject || 'Yêu cầu dịch vụ'}
                                    </h4>

                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                      {req.description || req.content || req.note || 'Yêu cầu được ghi nhận trên hệ thống.'}
                                    </p>

                                    {req.user_name && (
                                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                                        <span className="font-bold text-slate-600">Khách hàng: {req.user_name}</span>
                                        {req.user_email && <span>({req.user_email})</span>}
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 shrink-0">
                                    {req.price ? (
                                      <span className="text-xs font-extrabold text-orange-600">
                                        {Number(req.price).toLocaleString('vi-VN')} VNĐ
                                      </span>
                                    ) : null}

                                    <button
                                      onClick={() => setSelectedRequestItem(req)}
                                      className="w-full sm:w-auto text-center bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shadow-xs"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      {'Xem chi tiết'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {totalFilteredCount === 0 && (
                              <div className="text-center py-14 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs font-medium">
                                {'Không tìm thấy yêu cầu nào theo trạng thái chọn.'}
                              </div>
                            )}

                            {/* Pagination UI Controls */}
                            {totalFilteredCount > 0 && (
                              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs mt-4 shadow-2xs">
                                <div className="text-slate-500 flex items-center gap-2">
                                  <span>
                                    {`Hiển thị ${startIndex + 1} - ${endIndex} trên tổng số ${totalFilteredCount} yêu cầu`}
                                  </span>
                                  <span className="hidden sm:inline text-slate-300">|</span>
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400">{'Số dòng:'}</span>
                                    <select
                                      value={requestsPageSize}
                                      onChange={(e) => {
                                        setRequestsPageSize(Number(e.target.value));
                                        setRequestsPage(1);
                                      }}
                                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 outline-none cursor-pointer hover:border-slate-300 transition-colors"
                                    >
                                      <option value={4}>4 dòng</option>
                                      <option value={8}>8 dòng</option>
                                      <option value={12}>12 dòng</option>
                                      <option value={20}>20 dòng</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setRequestsPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPageSafe <= 1}
                                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all text-xs ${
                                      currentPageSafe <= 1
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                                    }`}
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{'Trang trước'}</span>
                                  </button>

                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                      <button
                                        key={pageNum}
                                        onClick={() => setRequestsPage(pageNum)}
                                        className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                                          pageNum === currentPageSafe
                                            ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    ))}
                                  </div>

                                  <button
                                    onClick={() => setRequestsPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPageSafe >= totalPages}
                                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all text-xs ${
                                      currentPageSafe >= totalPages
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                                    }`}
                                  >
                                    <span className="hidden sm:inline">{'Trang sau'}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Case / Request Creation Modal Form */}
              {isNewCaseModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-sans font-black text-lg text-slate-900">
                          {'Khởi tạo Yêu cầu vụ việc SHTT mới'}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1">
                          {'Điền thông tin và mô tả chi tiết yêu cầu để được chuyên viên liên hệ hỗ trợ nhanh chóng.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsNewCaseModalOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {requestSubmitError && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{requestSubmitError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateRequest} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Họ và tên'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nguyễn Văn A"
                            value={newRequestName}
                            onChange={(e) => setNewRequestName(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            {'Số điện thoại'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="0904128930"
                            value={newRequestPhone}
                            onChange={(e) => setNewRequestPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Email liên hệ'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="abc@gmail.com"
                          value={newRequestEmail}
                          onChange={(e) => setNewRequestEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Mô tả chi tiết yêu cầu'} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          placeholder={'Mô tả chi tiết nội dung cần hỗ trợ, tư vấn bảo hộ nhãn hiệu, chuyển nhượng, tra cứu...'}
                          rows={4}
                          value={newRequestDesc}
                          onChange={(e) => setNewRequestDesc(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none resize-none transition-colors"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsNewCaseModalOpen(false)}
                          disabled={isSubmittingRequest}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          {'Hủy'}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingRequest}
                          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs shadow-orange-500/20"
                        >
                          {isSubmittingRequest && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                          <span>{'Yêu cầu hỗ trợ'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Directory File Manager */}
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="files-tab-panel">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-sans font-extrabold text-slate-900">
                    {'Quản lý hồ sơ tài liệu trực tuyến'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {'Lưu trữ, tra cứu và bảo mật hồ sơ nộp đơn, biên nhận, văn bằng bảo hộ của doanh nghiệp.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      placeholder={'Tìm tài liệu...'}
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full sm:w-48 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl py-2 pl-8 pr-3 text-xs outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    onClick={() => {
                      setNewFolderParentId('');
                      setIsNewFolderModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-orange-500/10"
                  >
                    <FolderPlus className="w-4 h-4" />
                    {'Tạo thư mục'}
                  </button>
                </div>
              </div>

              {/* Folders List */}
              <div className="space-y-4">
                {isFoldersLoading && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
                    <span>{'Đang tải danh sách thư mục...'}</span>
                  </div>
                )}

                {folders
                  .filter(f => {
                    const isRoot = !f.parent_id || !folders.some(parent => parent.id === f.parent_id);
                    if (!isRoot) return false;
                    
                    if (!fileSearch.trim()) return true;

                    const matchesRoot = f.name.toLowerCase().includes(fileSearch.toLowerCase());
                    const matchesChild = folders.some(sub => sub.parent_id === f.id && sub.name.toLowerCase().includes(fileSearch.toLowerCase()));
                    const matchesFile = f.files.some(file => file.name.toLowerCase().includes(fileSearch.toLowerCase()));
                    
                    return matchesRoot || matchesChild || matchesFile;
                  })
                  .map(f => {
                    const isExpanded = !!expandedFolders[f.id];
                    const subfolders = folders.filter(sub => sub.parent_id === f.id);
                    return (
                      <div key={f.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                        {/* Folder Header Row */}
                        <div 
                          onClick={() => toggleFolder(f.id)}
                          className="p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                            <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                              <Folder className="w-5 h-5 fill-amber-500" />
                            </div>
                            <div>
                              <strong className="text-sm font-extrabold text-slate-800 block">{f.name}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {`${f.files.length} tệp tin • ${subfolders.length} thư mục con — Cập nhật: ${f.updatedAt}`}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions for Folders */}
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setIsNewFolderModalOpen(true);
                                setNewFolderParentId(f.id);
                              }}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all border border-amber-100"
                              title={'Tạo thư mục con'}
                            >
                              + {'Thư mục con'}
                            </button>
                            <button
                              onClick={() => handleRealFileUpload(f)}
                              className="bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all"
                              title={'Tải tệp tin lên'}
                            >
                              + {'Tải tệp'}
                            </button>
                            <button
                              onClick={() => {
                                setLinkFolderId(f.id);
                                setLinkFolderName(f.name);
                                setLinkName('');
                                setLinkPath('');
                                setIsLinkModalOpen(true);
                              }}
                              className="bg-sky-50 hover:bg-sky-100 text-sky-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all border border-sky-100"
                              title={'Gắn liên kết'}
                            >
                              + {'Gắn link'}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingFolder(f.id);
                                setEditFolderName(f.name);
                                setEditFolderParentId(f.parent_id || '');
                                setEditFolderFiles([]);
                              }}
                              className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                              title={'Đổi tên thư mục'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRealDeleteFolder(f.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title={'Xóa thư mục'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Folder Contents (Files and Subfolders inside) */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 p-4 bg-slate-50/20 space-y-4">
                            {/* Nested Subfolders */}
                            {subfolders.length > 0 && (
                              <div className="space-y-3 pl-4 border-l-2 border-amber-200">
                                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block mb-1">
                                  {'Thư mục con'}
                                </span>
                                {subfolders
                                  .filter(sub => !fileSearch.trim() || sub.name.toLowerCase().includes(fileSearch.toLowerCase()) || sub.files.some(file => file.name.toLowerCase().includes(fileSearch.toLowerCase())))
                                  .map(sub => {
                                    const isSubExpanded = !!expandedFolders[sub.id];
                                    return (
                                      <div key={sub.id} className="border border-slate-100/80 rounded-xl overflow-hidden bg-white shadow-2xs">
                                        {/* Subfolder Header */}
                                        <div 
                                          onClick={() => toggleFolder(sub.id)}
                                          className="p-3 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-slate-400">
                                              {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            </span>
                                            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                              <Folder className="w-4 h-4 fill-amber-400 text-amber-500" />
                                            </div>
                                            <div>
                                              <strong className="text-xs font-bold text-slate-700 block">{sub.name}</strong>
                                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                                {`Thời gian: ${sub.updatedAt}`}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <button
                                              onClick={() => {
                                                setIsNewFolderModalOpen(true);
                                                setNewFolderParentId(sub.id);
                                              }}
                                              className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all border border-amber-100"
                                              title={'Tạo thư mục con'}
                                            >
                                              + {'Mục con'}
                                            </button>
                                            <button
                                              onClick={() => handleRealFileUpload(sub)}
                                              className="bg-slate-50 hover:bg-orange-500 hover:text-white text-slate-600 px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all"
                                              title={'Tải tệp tin lên'}
                                            >
                                              + {'Tải tệp'}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setLinkFolderId(sub.id);
                                                setLinkFolderName(sub.name);
                                                setLinkName('');
                                                setLinkPath('');
                                                setIsLinkModalOpen(true);
                                              }}
                                              className="bg-sky-50 hover:bg-sky-100 text-sky-700 px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all border border-sky-100"
                                              title={'Gắn liên kết'}
                                            >
                                              + {'Gắn link'}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setIsEditingFolder(sub.id);
                                                setEditFolderName(sub.name);
                                                setEditFolderParentId(sub.parent_id || '');
                                                setEditFolderFiles([]);
                                              }}
                                              className="p-1 text-slate-400 hover:text-orange-500 transition-colors cursor-pointer"
                                              title={'Đổi tên thư mục'}
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRealDeleteFolder(sub.id);
                                              }}
                                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                              title={'Xóa thư mục'}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Subfolder files */}
                                        {isSubExpanded && (
                                          <div className="border-t border-slate-50 p-3 bg-slate-50/10 text-xs space-y-3">
                                            {/* Files list */}
                                            {sub.files.length > 0 && (
                                              <div className="divide-y divide-slate-100">
                                                {sub.files.map(file => (
                                                  <div key={file.id} className="py-2.5 flex justify-between items-center gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-2">
                                                      <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                                      <div>
                                                        <span className="font-semibold text-slate-600 block text-xs truncate max-w-xs">
                                                          {file.name}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 block mt-0.5">
                                                          {file.size} • {file.uploadDate}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                      <a
                                                        href={file.url || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 bg-white hover:bg-orange-50 text-slate-400 hover:text-orange-500 border border-slate-200/60 rounded-md cursor-pointer transition-colors flex items-center justify-center"
                                                        title={'Xem/Tải tệp về'}
                                                      >
                                                        <Download className="w-3.5 h-3.5" />
                                                      </a>
                                                      <button
                                                        onClick={() => handleDeleteFile(sub.id, file.id)}
                                                        className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 rounded-md cursor-pointer transition-colors"
                                                        title={'Xóa tệp'}
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {/* Links list */}
                                            {sub.links && sub.links.length > 0 && (
                                              <div className="divide-y divide-slate-100 pt-1 border-t border-slate-100/50">
                                                <span className="text-[9px] font-black uppercase text-sky-600 tracking-wider block mb-1 px-2">
                                                  {'Liên kết đính kèm'}
                                                </span>
                                                {sub.links.map(link => (
                                                  <div key={link.id} className="py-2 flex justify-between items-center gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-2">
                                                      <Link className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                                      <div className="min-w-0 flex-1">
                                                        <span className="font-semibold text-slate-600 block text-xs truncate max-w-xs">
                                                          {link.name}
                                                        </span>
                                                        <a 
                                                          href={link.path}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-[9px] text-sky-500 hover:underline block truncate max-w-xs"
                                                        >
                                                          {link.path}
                                                        </a>
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                      <a
                                                        href={link.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 bg-white hover:bg-sky-50 text-slate-400 hover:text-sky-500 border border-slate-200/60 rounded-md cursor-pointer transition-colors flex items-center justify-center"
                                                        title={'Truy cập liên kết'}
                                                      >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                      </a>
                                                      <button
                                                        onClick={() => handleDeleteLink(sub.id, link.id)}
                                                        className="p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 rounded-md cursor-pointer transition-colors"
                                                        title={'Xóa liên kết'}
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {sub.files.length === 0 && (!sub.links || sub.links.length === 0) && (
                                              <div className="text-center py-4 text-slate-400 text-[10px] italic">
                                                {'Thư mục trống.'}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}

                            {/* Direct Files of Root Folder */}
                            {f.files.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1 pl-1">
                                  {'Tài liệu'}
                                </span>
                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white overflow-hidden">
                                  {f.files.map(file => (
                                    <div key={file.id} className="py-3 flex justify-between items-center gap-4 hover:bg-slate-50 px-3 transition-colors">
                                      <div className="flex items-center gap-2.5">
                                        <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                                        <div>
                                          <span className="font-bold text-slate-700 block text-xs truncate max-w-sm sm:max-w-md md:max-w-xl">
                                            {file.name}
                                          </span>
                                          <span className="text-[10px] text-slate-400 block mt-0.5">
                                            {file.size} • {'Nộp ngày:'} {file.uploadDate}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <a
                                          href={file.url || '#'}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 bg-white hover:bg-orange-50 text-slate-400 hover:text-orange-500 border border-slate-200/60 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
                                          title={'Xem/Tải tệp về'}
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </a>
                                        <button
                                          onClick={() => handleDeleteFile(f.id, file.id)}
                                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 rounded-lg cursor-pointer transition-colors"
                                          title={'Xóa tệp'}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Direct Links of Root Folder */}
                            {f.links && f.links.length > 0 && (
                              <div className="space-y-1.5 mt-4">
                                <span className="text-[10px] font-black uppercase text-sky-600 tracking-wider block mb-1 pl-1">
                                  {'Liên kết đính kèm'}
                                </span>
                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white overflow-hidden">
                                  {f.links.map(link => (
                                    <div key={link.id} className="py-3 flex justify-between items-center gap-4 hover:bg-slate-50 px-3 transition-colors">
                                      <div className="flex items-center gap-2.5">
                                        <Link className="w-4 h-4 text-sky-500 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <span className="font-bold text-slate-700 block text-xs truncate max-w-sm sm:max-w-md md:max-w-xl">
                                            {link.name}
                                          </span>
                                          <a 
                                            href={link.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-sky-500 hover:underline block mt-0.5 truncate"
                                          >
                                            {link.path}
                                          </a>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <a
                                          href={link.path}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 bg-white hover:bg-sky-50 text-slate-400 hover:text-sky-500 border border-slate-200/60 rounded-lg cursor-pointer transition-colors flex items-center justify-center"
                                          title={'Truy cập liên kết'}
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        <button
                                          onClick={() => handleDeleteLink(f.id, link.id)}
                                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 rounded-lg cursor-pointer transition-colors"
                                          title={'Xóa liên kết'}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {f.files.length === 0 && subfolders.length === 0 && (!f.links || f.links.length === 0) && (
                              <div className="text-center py-6 text-slate-400 text-xs italic">
                                {'Thư mục trống. Kéo thả tài liệu hoặc nhấp "+ Tải tệp lên" hoặc "+ Gắn link" để lưu trữ.'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Folder Creation Modal Overlay */}
              {isNewFolderModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150">
                    <div className="flex justify-between items-start mb-5">
                      <h4 className="font-sans font-black text-base text-slate-900">
                        {'Tạo thư mục mới'}
                      </h4>
                      <button 
                        onClick={() => {
                          setIsNewFolderModalOpen(false);
                          setNewFolderParentId('');
                          setNewFolderFiles([]);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateFolder} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Tên thư mục'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={'e.g. Tài liệu bổ sung, Hồ sơ đàm phán...'}
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Thư mục cha (Tùy chọn)'}
                        </label>
                        <select
                          value={newFolderParentId}
                          onChange={(e) => setNewFolderParentId(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none cursor-pointer"
                        >
                          <option value="">{'--- Thư mục gốc ---'}</option>
                          {folders.map(f => {
                            const isChild = !!f.parent_id;
                            const parentFolder = isChild ? folders.find(p => p.id === f.parent_id) : null;
                            const prefix = isChild ? `  ↳ [${parentFolder ? parentFolder.name : 'Sub'}] ` : '';
                            return (
                              <option key={f.id} value={f.id}>
                                {prefix}{f.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Tệp tin đính kèm (Tùy chọn)'}
                        </label>
                        <input
                          type="file"
                          id="new-folder-file-input"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setNewFolderFiles(Array.from(e.target.files));
                            }
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                        {newFolderFiles.length > 0 && (
                          <div className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50/50 px-2 py-1 rounded-lg">
                            Selected: {newFolderFiles[0].name} ({(newFolderFiles[0].size/1024/1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewFolderModalOpen(false);
                            setNewFolderParentId('');
                            setNewFolderFiles([]);
                          }}
                          className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          {'Hủy'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          {'Tạo thư mục'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Folder Rename Modal Overlay */}
              {isEditingFolder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150">
                    <div className="flex justify-between items-start mb-5">
                      <h4 className="font-sans font-black text-base text-slate-900">
                        {'Đổi tên thư mục'}
                      </h4>
                      <button 
                        onClick={() => setIsEditingFolder(null)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleRenameFolderSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Tên thư mục'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={editFolderName}
                          onChange={(e) => setEditFolderName(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Thư mục cha (Tùy chọn)'}
                        </label>
                        <select
                          value={editFolderParentId}
                          onChange={(e) => setEditFolderParentId(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none cursor-pointer"
                        >
                          <option value="">{'--- Thư mục gốc ---'}</option>
                          {folders
                            .filter(f => f.id !== isEditingFolder) // Cannot select itself as parent!
                            .map(f => {
                              const isChild = !!f.parent_id;
                              const parentFolder = isChild ? folders.find(p => p.id === f.parent_id) : null;
                              const prefix = isChild ? `  ↳ [${parentFolder ? parentFolder.name : 'Sub'}] ` : '';
                              return (
                                <option key={f.id} value={f.id}>
                                  {prefix}{f.name}
                                </option>
                              );
                            })
                          }
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Tệp tin đính kèm mới (Tùy chọn)'}
                        </label>
                        <input
                          type="file"
                          id="edit-folder-file-input"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setEditFolderFiles(Array.from(e.target.files));
                            }
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                        />
                        {editFolderFiles.length > 0 && (
                          <div className="text-[10px] text-orange-600 font-bold mt-1 bg-orange-50/50 px-2 py-1 rounded-lg">
                            Selected: {editFolderFiles[0].name} ({(editFolderFiles[0].size/1024/1024).toFixed(2)} MB)
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingFolder(null);
                            setEditFolderName('');
                            setEditFolderParentId('');
                            setEditFolderFiles([]);
                          }}
                          className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          {'Hủy'}
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          {'Cập nhật'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Attach Link Modal Overlay */}
              {isLinkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                  <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150">
                    <div className="flex justify-between items-start mb-5">
                      <h4 className="font-sans font-black text-base text-slate-900">
                        {'Đính kèm liên kết'}
                      </h4>
                      <button 
                        onClick={() => {
                          setIsLinkModalOpen(false);
                          setLinkName('');
                          setLinkPath('');
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateLinkSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Thư mục đích'}
                        </label>
                        <input
                          type="text"
                          disabled
                          value={linkFolderName}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs outline-none text-slate-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Tên liên kết'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={'Ví dụ: Tài liệu hướng dẫn, Link Google Drive...'}
                          value={linkName}
                          onChange={(e) => setLinkName(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          {'Đường dẫn (URL)'} *
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://docs.google.com/..."
                          value={linkPath}
                          onChange={(e) => setLinkPath(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLinkModalOpen(false);
                            setLinkName('');
                            setLinkPath('');
                          }}
                          className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                        >
                          {'Hủy'}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingLink}
                          className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {isSubmittingLink 
                            ? ('Đang gắn...') 
                            : ('Gắn liên kết')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: My Commissions */}
          {isPartner && activeTab === 'commissions' && (
            <CommissionsTab user={user} language={language} />
          )}

          {/* TAB 6: Settings Placeholder */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="settings-tab-panel">
              <div>
                <h3 className="text-xl font-sans font-extrabold text-slate-900">
                  {'Cài đặt tài khoản'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Cấu hình phương thức nhận thông báo, cài đặt ngôn ngữ hiển thị và phân quyền bảo mật.
                </p>
              </div>

              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-700 block font-bold">Email Notifications</strong>
                    <span className="text-slate-400">Nhận thông báo cập nhật tình hình vụ việc qua Email</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-700 block font-bold">SMS Notifications</strong>
                    <span className="text-slate-400">Nhận mã OTP và cảnh báo giao dịch khẩn cấp qua điện thoại</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <div>
                    <strong className="text-slate-700 block font-bold">Auto-Sync</strong>
                    <span className="text-slate-400">Tự động đồng bộ tình trạng nộp đơn mỗi tối</span>
                  </div>
                  <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Support / Advice Helpline */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-in fade-in duration-200" id="support-tab-panel">
              <div>
                <h3 className="text-xl font-sans font-extrabold text-slate-900">
                  {'Hỗ trợ khách hàng & Helpline SHTT'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Đội ngũ luật sư và chuyên gia SHTT của Brandix luôn túc trực hỗ trợ bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-2xl p-5 bg-orange-50/30">
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    Hotline Tư Vấn 24/7
                  </span>
                  <h4 className="font-sans font-black text-2xl text-slate-900 mt-3 mb-1">
                    0901 727 373
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Nhánh 1: Tư vấn mua bán thương lượng nhãn hiệu có sẵn.<br />
                    Nhánh 2: Tư vấn hồ sơ nộp đơn đăng ký mới & tranh chấp pháp lý.
                  </p>
                  <a 
                    href="tel:0901727373" 
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Gọi ngay: 0901 727 373
                  </a>
                </div>

                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    Email Hỗ Trợ Pháp Lý
                  </span>
                  <h4 className="font-sans font-extrabold text-base text-slate-900 mt-3 mb-1">
                    ipagent@hdslaw.vn
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Gửi tài liệu scan phản đối đơn, quyết định xử lý để nhận được thẩm định phân tích chuyên sâu miễn phí từ Luật sư.
                  </p>
                  <a 
                    href="mailto:ipagent@hdslaw.vn" 
                    className="inline-block border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Gửi email / Email support
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Detailed Business Info Supplement Modal */}
      {isUpdateInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200/50 shadow-2xl animate-in scale-in duration-150 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-sans font-black text-xl text-slate-900">
                  {'Thông tin chi tiết'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {'Cập nhật thông tin '}
                  {profile.companyName ? (
                    <>
                      {'cho '}
                      <span className="text-[#3B82F6] font-bold">{profile.companyName}</span>
                    </>
                  ) : (
                    <span>{'doanh nghiệp của bạn'}</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => setIsUpdateInfoModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Alert Banner */}
            {updateStatus && (
              <div 
                className={`mb-5 p-4 rounded-2xl flex items-start gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 ${
                  updateStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}
              >
                <span className="text-sm shrink-0">
                  {updateStatus.type === 'success' ? '✅' : '❌'}
                </span>
                <span>{updateStatus.text}</span>
              </div>
            )}

            {/* Gray info container summary of company */}
            <div className="bg-[#FCF8F6] p-4 rounded-2xl mb-6 border border-[#FFE9DF]/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">{'Doanh nghiệp'}</span>
                <strong className="text-slate-800 font-bold block truncate" title={profile.companyName || ('Chưa cập nhật')}>
                  {profile.companyName || ('Chưa cập nhật')}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Email</span>
                <strong className="text-slate-800 font-bold block truncate" title={profile.email}>
                  {profile.email}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">{'Điện thoại'}</span>
                <strong className="text-slate-800 font-bold block truncate" title={profile.phone}>
                  {profile.phone}
                </strong>
              </div>
            </div>

            {/* Supplement form */}
            <form onSubmit={handleUpdateInfoSubmit} className="space-y-4">
              {/* Tên công ty / tổ chức */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Tên công ty / tổ chức'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={'Nhập tên công ty hoặc hộ kinh doanh'}
                  value={updateInfoCompanyName}
                  onChange={(e) => setUpdateInfoCompanyName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Địa chỉ trụ sở */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Địa chỉ trụ sở chính'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={'Nhập địa chỉ đăng ký kinh doanh'}
                  value={updateInfoAddress}
                  onChange={(e) => setUpdateInfoAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Loại hình kinh doanh */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Loại hình kinh doanh'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={updateInfoBusinessType}
                  onChange={(e) => setUpdateInfoBusinessType(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all cursor-pointer"
                >
                  <option value="Công ty cổ phần">Công ty cổ phần</option>
                  <option value="Công ty TNHH một thành viên">Công ty TNHH một thành viên</option>
                  <option value="Công ty TNHH hai thành viên trở lên">Công ty TNHH hai thành viên trở lên</option>
                  <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                  <option value="Hộ kinh doanh">Hộ kinh doanh</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Mã số thuế */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Mã số thuế'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={'Nhập mã số thuế (ví dụ: 5100514230)'}
                  value={updateInfoTaxCode}
                  onChange={(e) => setUpdateInfoTaxCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Số CCCD/CMT */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Số CCCD/CMT Người đại diện pháp luật'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={'Nhập số CCCD/CMT (ví dụ: 1050044304)'}
                  value={updateInfoCitizenId}
                  onChange={(e) => setUpdateInfoCitizenId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 rounded-xl p-3 text-xs outline-none transition-all"
                />
              </div>

              {/* Đăng ký Kinh doanh (không bắt buộc) File Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {'Đăng ký Kinh doanh (không bắt buộc)'}
                </label>

                {/* File Upload Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setUpdateInfoFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
                    }
                  }}
                  onClick={() => document.getElementById('update-info-file-input')?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragOver ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 hover:border-orange-500/50 bg-slate-50/50'
                  }`}
                >
                  <input
                    id="update-info-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUpdateInfoFiles(prev => [...prev, ...Array.from(e.target.files)]);
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">
                    {'Tải tệp lên hoặc kéo và thả'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    PDF, PNG, JPG ({'tối đa'} 10MB)
                  </span>
                </div>

                {/* Render uploaded files */}
                {updateInfoFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {updateInfoFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-orange-500 font-bold">📄</span>
                          <span className="truncate font-semibold text-slate-700 max-w-[280px]">{file.name}</span>
                          <span className="text-[9px] text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpdateInfoFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="text-rose-500 hover:bg-rose-50 p-1 rounded-full cursor-pointer transition-colors animate-in fade-in"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateInfoModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {'Hủy bỏ'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUpdateInfo}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingUpdateInfo ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>{'Đang cập nhật...'}</span>
                    </>
                  ) : (
                    <span>{'Cập nhật'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
