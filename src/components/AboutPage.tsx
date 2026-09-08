import React, { useState, useEffect } from 'react';
import { fetchPageBySlug, ApiPageResponse } from '../services/pageService';
import WhyUs from './WhyUs';
import ComparisonSection from './ComparisonSection';
import WaitlessBenefitsSection from './WaitlessBenefitsSection';

interface AboutPageProps {
  language?: 'vi' | 'en';
  onOpenWizard?: () => void;
}

/**
 * AboutPage renders the "Về chúng tôi" page.
 * Crucially: it performs ONLY A SINGLE API CALL to fetch "brandix-about",
 * and distributes the data to WhyUs, ComparisonSection, and WaitlessBenefitsSection.
 */
export default function AboutPage({
  language = 'vi',
  onOpenWizard
}: AboutPageProps) {
  const [pageData, setPageData] = useState<ApiPageResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Single consolidated fetch call for the entire "Về chúng tôi" page
    fetchPageBySlug('brandix-about', language)
      .then((data) => {
        if (isMounted) {
          setPageData(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load brandix-about page data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [language]); // Only re-fetches if language changes or component remounts

  return (
    <div id="about-page-container">
      {/* 1. Tại Sao Nên Sở Hữu Thương Hiệu Từ Brandix? (5 Tabs) */}
      <WhyUs 
        pageData={pageData} 
        slug="brandix-about" 
        language={language} 
      />

      {/* 2. Sở Hữu Nhãn Hiệu Trong Vài Ngày, Thay Vì Chờ Đợi 2 Năm (8 metrics) */}
      <ComparisonSection
        pageData={pageData}
        slug="brandix-about"
        language={language}
        onOpenWizard={onOpenWizard}
      />

      {/* 3. Không Cần Chờ Đợi - Sở Hữu Thương Hiệu Độc Quyền Ngay Hôm Nay (4 items) */}
      <WaitlessBenefitsSection
        pageData={pageData}
        slug="brandix-about"
        language={language}
      />
    </div>
  );
}
