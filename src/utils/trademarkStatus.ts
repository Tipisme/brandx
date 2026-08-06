export const formatToDDMMYYYY = (rawDate?: string): string => {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str) return '';

  // Case 1: DD.MM.YYYY or D.M.YYYY
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].trim();
      return `${d}/${m}/${y}`;
    }
  }

  // Case 2: YYYY-MM-DD or DD-MM-YYYY
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${d}/${m}/${y}`;
      } else {
        // DD-MM-YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${d}/${m}/${y}`;
      }
    }
  }

  // Case 3: DD/MM/YYYY or D/M/YYYY or YYYY/MM/DD
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        return `${d}/${m}/${y}`;
      } else {
        // DD/MM/YYYY
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${d}/${m}/${y}`;
      }
    }
  }

  // Fallback to Date parse
  const dObj = new Date(str);
  if (!isNaN(dObj.getTime())) {
    const day = String(dObj.getDate()).padStart(2, '0');
    const month = String(dObj.getMonth() + 1).padStart(2, '0');
    const year = dObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
};

export const extractFilingDate = (progresses?: any[], fallbackDate?: string): string => {
  let rawDate = '';
  if (progresses && Array.isArray(progresses) && progresses.length > 0) {
    const first = progresses[0];
    if (typeof first === 'string') {
      rawDate = first;
    } else if (first && typeof first === 'object') {
      rawDate = first.name || first.date || first.value || '';
    }
  }

  if (!rawDate && fallbackDate) {
    rawDate = fallbackDate;
  }

  return formatToDDMMYYYY(rawDate) || '01/01/2023';
};

export const isExpiredOrRefusedStatus = (statusStr?: string): boolean => {
  if (!statusStr) return false;
  const s = statusStr.toLowerCase().trim();
  return (
    s.includes('từ chối') ||
    s.includes('hết hạn') ||
    s.includes('hết hiệu lực') ||
    s.includes('chấm dứt') ||
    s.includes('hủy bỏ') ||
    s.includes('rút đơn') ||
    s.includes('refuse') ||
    s.includes('reject') ||
    s.includes('expire') ||
    s.includes('cancel') ||
    s.includes('withdraw')
  );
};

export const checkIsExpiringSoon = (progresses?: any[], fallbackFilingDate?: string): boolean => {
  let dateStr = '';

  if (progresses && Array.isArray(progresses)) {
    const nopDonItem = progresses.find((item: any) => {
      const slug = (item.slug || '').toLowerCase().trim();
      const name = (item.name || '').toLowerCase().trim();
      return (
        slug.includes('nộp đơn') ||
        slug.includes('nop don') ||
        slug.includes('n\u1ed9p \u0111\u01a1n') ||
        name.includes('nộp đơn') ||
        name.includes('nop don')
      );
    });
    if (nopDonItem && nopDonItem.name) {
      dateStr = String(nopDonItem.name).trim();
    }
  }

  if (!dateStr && fallbackFilingDate) {
    dateStr = fallbackFilingDate.trim();
  }

  if (!dateStr) return false;

  let filingDate: Date | null = null;

  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        filingDate = new Date(year, month, day);
      }
    }
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        filingDate = new Date(year, month, day);
      }
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        filingDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        filingDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
  }

  if (!filingDate || isNaN(filingDate.getTime())) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      filingDate = parsed;
    }
  }

  if (!filingDate || isNaN(filingDate.getTime())) return false;

  const expiryDate = new Date(filingDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);

  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= 30;
};

export const getTrademarkStatusDisplay = (
  statusStr?: string,
  progresses?: any[],
  language: string = 'vi',
  fallbackFilingDate?: string
) => {
  if (isExpiredOrRefusedStatus(statusStr)) {
    return {
      text: language === 'vi' ? 'Được quyền đăng ký' : 'Free to Register',
      badgeBg: 'bg-rose-600',
      textColor: 'text-blue-600',
      isExpired: true,
      isExpiringSoon: false
    };
  }

  if (checkIsExpiringSoon(progresses, fallbackFilingDate)) {
    return {
      text: language === 'vi' ? 'Sắp hết hạn' : 'Expiring Soon',
      badgeBg: 'bg-amber-500',
      textColor: 'text-amber-600',
      isExpired: false,
      isExpiringSoon: true
    };
  }

  return {
    text: statusStr || (language === 'vi' ? 'Được quyền đăng ký' : 'Free to Register'),
    badgeBg: 'bg-emerald-600',
    textColor: 'text-emerald-600',
    isExpired: false,
    isExpiringSoon: false
  };
};
