import React, { useState, useEffect } from 'react';
import { fetchPageBySlug, ApiPageResponse } from '../services/pageService';
import WhyUs from './WhyUs';
import ComparisonSection from './ComparisonSection';
import WaitlessBenefitsSection from './WaitlessBenefitsSection';
import { updateMetaSeo, resetMetaSeo, resolveMetaImage } from '../utils/seo';

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

  useEffect(() => {
    if (pageData) {
      const metaTitle = pageData.title || 'Về Chúng Tôi - Brandix Việt Nam';
      const metaDesc = pageData.description || 'Tìm hiểu về Brandix - Nền tảng giao dịch, chuyển nhượng và bảo hộ nhãn hiệu trực tuyến hàng đầu Việt Nam.';
      const metaImg = resolveMetaImage(pageData.image, '/brandix-logo.jpg');

      updateMetaSeo({
        title: `${metaTitle} | Brandix`,
        description: metaDesc,
        image: metaImg,
        imageAlt: metaTitle,
        type: 'website'
      });

      return () => {
        resetMetaSeo();
      };
    }
  }, [pageData]);

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
