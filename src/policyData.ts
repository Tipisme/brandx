export interface PolicyDocumentItem {
  id: string;
  title: string;
  filename: string;
  description: string;
}

export const POLICY_DOCUMENTS: PolicyDocumentItem[] = [
  {
    id: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    filename: 'chinh-sach-bao-mat.docx',
    description: 'Chính sách bảo mật thông tin mua bán, dữ liệu cá nhân và bí mật kinh doanh của khách hàng trên hệ thống Brandix.'
  },
  {
    id: 'phuong-thuc-tiep-nhan-va-giai-quyet-phan-anh-yeu-cau-khieu-nai',
    title: 'Phương thức tiếp nhận và giải quyết phản ánh yêu cầu khiếu nại',
    filename: 'phuong-thuc-tiep-nhan-va-giai-quyet-phan-anh-yeu-cau-khieu-nai.docx',
    description: 'Quy trình và phương thức tiếp nhận, thẩm tra, giải quyết khiếu nại và phản ánh của khách hàng minh bạch.'
  },
  {
    id: 'chinh-sach-gia',
    title: 'Chính sách giá',
    filename: 'chinh-sach-gia.docx',
    description: 'Quy định rõ nguyên tắc định giá, niêm yết giá chuyển nhượng và cơ chế đàm phán nhãn hiệu trên Brandix.'
  },
  {
    id: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    filename: 'chinh-sach-thanh-toan.docx',
    description: 'Cơ chế thanh toán an toàn, bảo đảm giao dịch và các phương thức thanh toán hợp pháp qua Brandix.'
  },
  {
    id: 'cac-dieu-kien-hoac-han-che-trong-viec-cung-cap-dich-vu',
    title: 'Các điều kiện hoặc hạn chế trong việc cung cấp dịch vụ',
    filename: 'cac-dieu-kien-hoac-han-che-trong-viec-cung-cap-dich-vu.docx',
    description: 'Điều kiện pháp lý, giới hạn thẩm định và phạm vi cung cấp dịch vụ nhãn hiệu theo quy định.'
  },
  {
    id: 'phuong-thuc-cung-cap-dich-vu',
    title: 'Phương thức cung cấp dịch vụ brandix.vn',
    filename: 'phuong-thuc-cung-cap-dich-vu.docx',
    description: 'Quy trình cung cấp dịch vụ, thời hạn thực hiện, thủ tục chấm dứt dịch vụ và chính sách hoàn tiền chi tiết.'
  },
  {
    id: 'hinh-thuc-ho-tro-truc-tuyen',
    title: 'Hình thức hỗ trợ trực tuyến',
    filename: 'hinh-thuc-ho-tro-truc-tuyen.docx',
    description: 'Các kênh hỗ trợ khách hàng 24/7 bao gồm Hotline, kênh trực tuyến và tiếp nhận yêu cầu.'
  },
  {
    id: 'quyen-va-nghia-vu-cac-ben',
    title: 'Quyền và nghĩa vụ các bên',
    filename: 'quyen-va-nghia-vu-cac-ben.docx',
    description: 'Quyền và nghĩa vụ của bên mua, bên bán và đơn vị vận hành sàn giao dịch nhãn hiệu Brandix.'
  }
];
