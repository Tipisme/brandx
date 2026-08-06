import { Trademark, Blog, FAQ, Review } from './types';

export const TRADEMARK_CLASSES: Record<number, { name: string; desc: string }> = {
  5: { name: "Y tế & Dược phẩm", desc: "Chế phẩm dược phẩm, y tế, chất diệt cỏ, diệt côn trùng." },
  9: { name: "Thiết bị điện tử & Phần mềm", desc: "Máy tính, phần mềm, ứng dụng di động, thiết bị viễn thông." },
  14: { name: "Kim hoàn & Trang sức", desc: "Kim loại quý, đá quý, đồng hồ." },
  25: { name: "Thời trang & May mặc", desc: "Quần áo, giày dép, mũ nón." },
  29: { name: "Thực phẩm & Sữa", desc: "Sữa, bơ, phomai, sữa chua; dầu thực vật; thịt, cá, rau quả sấy khô." },
  30: { name: "Cà phê, Trà & Bánh kẹo", desc: "Cà phê, trà, cacao, đường, gạo, bột mì, bánh mì, gia vị." },
  32: { name: "Đồ uống không cồn", desc: "Bia, nước suối, nước hoa quả, nước ngọt, đồ uống không cồn khác." },
  33: { name: "Đồ uống có cồn", desc: "Rượu mạnh, rượu vang, đồ uống có cồn (trừ bia)." },
  35: { name: "Quảng cáo & Bán lẻ", desc: "Dịch vụ quảng cáo, quản lý kinh doanh, bán lẻ sản phẩm." },
  43: { name: "Dịch vụ ăn uống & Lưu trú", desc: "Nhà hàng, quán cà phê, khách sạn, nhà khách." },
  44: { name: "Y tế & Làm đẹp", desc: "Dịch vụ y tế, chăm sóc sắc đẹp, thẩm mỹ viện, spa." }
};

export const MOCK_TRADEMARKS: Trademark[] = [
  {
    id: "tm-1",
    name: "VINAMILK",
    logoText: "Vinamilk",
    logoBg: "from-blue-600 to-indigo-800",
    status: "available",
    classes: [29, 30, 32],
    goodsDescription: "Sữa, bơ, pho mát, sữa yogurt và các sản phẩm từ sữa khác; dầu thực vật dùng cho thực phẩm; nước trái cây đóng chai, đồ uống dinh dưỡng.",
    applicationNo: "4-2023-12345",
    filingDate: "2023-05-15",
    price: 1500000000, // 1.5 billion
    isFeatured: true,
    description: "Nhãn hiệu sữa hàng đầu Việt Nam, đã được đăng ký bảo hộ độc quyền trên toàn quốc. Thích hợp cho doanh nghiệp muốn khởi nghiệp hoặc mở rộng quy mô trong ngành sữa và chế phẩm từ sữa chất lượng cao.",
    ownerType: "Tổ chức",
    views: 1245,
    likes: 342
  },
  {
    id: "tm-2",
    name: "PEPSI.CO",
    logoText: "Pepsi.co",
    logoBg: "from-blue-500 via-red-500 to-indigo-600",
    status: "available",
    classes: [32, 35],
    goodsDescription: "Đồ uống không cồn, nước ngọt có ga, nước tăng lực, nước suối đóng chai; dịch vụ quảng cáo thương mại và phân phối nước giải khát.",
    applicationNo: "4-2022-54321",
    filingDate: "2022-09-10",
    price: 3200000000, // 3.2 billion
    isFeatured: true,
    description: "Nhãn hiệu nước giải khát mang tính biểu tượng toàn cầu, cấu trúc chữ dễ nhớ, phù hợp cho các dòng sản phẩm nước ngọt, nước giải khát năng động, sáng tạo.",
    ownerType: "Tổ chức",
    views: 980,
    likes: 185
  },
  {
    id: "tm-3",
    name: "COKE.CO",
    logoText: "Coke.co",
    logoBg: "from-red-600 to-red-800",
    status: "negotiating",
    classes: [32, 43],
    goodsDescription: "Nước ngọt có ga, nước khoáng, nước ép trái cây; dịch vụ cung cấp đồ ăn uống, chuỗi nhà hàng thức ăn nhanh và quán nước giải khát.",
    applicationNo: "4-2023-88899",
    filingDate: "2023-01-20",
    price: 2800000000, // 2.8 billion
    isFeatured: true,
    description: "Nhãn hiệu mang tính thương mại cực cao, thích hợp để phát triển các chuỗi đồ uống, quán cafe kết hợp thức ăn nhanh thế hệ mới. Hiện đang có 2 đối tác đàm phán mua quyền sở hữu.",
    ownerType: "Tổ chức",
    views: 1540,
    likes: 290
  },
  {
    id: "tm-4",
    name: "HEINEKEN",
    logoText: "Heineken",
    logoBg: "from-green-600 to-emerald-800",
    status: "available",
    classes: [32, 33],
    goodsDescription: "Bia, các loại nước có cồn nhẹ lên men từ lúa mạch; rượu vang và rượu mạnh chất lượng cao dùng trong nhà hàng, quán bar.",
    applicationNo: "4-2021-00789",
    filingDate: "2021-11-05",
    price: 4500000000, // 4.5 billion
    isFeatured: true,
    description: "Tên tuổi huyền thoại trong ngành bia và đồ uống có cồn. Cơ hội sở hữu nhãn hiệu danh tiếng bậc nhất với hồ sơ pháp lý sạch, chuyển nhượng ngay lập tức.",
    ownerType: "Tổ chức",
    views: 2310,
    likes: 512
  },
  {
    id: "tm-5",
    name: "FANTA",
    logoText: "Fanta",
    logoBg: "from-orange-500 to-amber-600",
    status: "available",
    classes: [32],
    goodsDescription: "Nước giải khát hương cam, nước ngọt hương vị trái cây tự nhiên, đồ uống sủi bọt không cồn cho giới trẻ.",
    applicationNo: "4-2023-33445",
    filingDate: "2023-08-12",
    price: 1200000000, // 1.2 billion
    isFeatured: true,
    description: "Nhãn hiệu mang tính vui nhộn, năng động cực kỳ phù hợp với phân khúc nước trái cây, nước ngọt có ga cho học sinh, sinh viên và gia đình.",
    ownerType: "Cá nhân",
    views: 750,
    likes: 120
  },
  {
    id: "tm-6",
    name: "BUDWEISER",
    logoText: "Budweiser",
    logoBg: "from-red-700 via-amber-700 to-red-950",
    status: "sold",
    classes: [32, 33, 43],
    goodsDescription: "Bia cao cấp, đồ uống có cồn chưng cất; dịch vụ quầy bar, quán bia, vũ trường và nhà hàng phục vụ món ăn kèm đồ uống.",
    applicationNo: "4-2020-99887",
    filingDate: "2020-04-18",
    price: 3800000000, // 3.8 billion
    isFeatured: true,
    description: "Nhãn hiệu bia vua đầy mạnh mẽ. Đã hoàn tất chuyển nhượng thành công cho một tập đoàn đồ uống lớn tại Việt Nam thông qua BrandHub.",
    ownerType: "Tổ chức",
    views: 1890,
    likes: 410
  },
  {
    id: "tm-7",
    name: "HIGHLANDS",
    logoText: "Highlands",
    logoBg: "from-red-800 to-amber-900",
    status: "available",
    classes: [30, 43],
    goodsDescription: "Cà phê rang xay, hạt cà phê, trà xanh, trà đen túi lọc; dịch vụ quán cà phê, quán trà và cung cấp dịch vụ ẩm thực lưu động.",
    applicationNo: "4-2023-11223",
    filingDate: "2023-03-30",
    price: 2500000000, // 2.5 billion
    isFeatured: false,
    description: "Tên thương mại lý tưởng cho các chuỗi quán cà phê sang trọng, mang phong cách Việt hiện đại. Pháp lý bảo hộ độc quyền nhóm 30 và 43.",
    ownerType: "Cá nhân",
    views: 932,
    likes: 198
  },
  {
    id: "tm-8",
    name: "MEDICARE",
    logoText: "MediCare",
    logoBg: "from-teal-500 to-cyan-600",
    status: "available",
    classes: [5, 44],
    goodsDescription: "Thực phẩm chức năng, vitamin, thiết bị y tế gia đình; dịch vụ phòng khám, chăm sóc sức khỏe, tư vấn dinh dưỡng và chăm sóc da.",
    applicationNo: "4-2022-77665",
    filingDate: "2022-12-05",
    price: 950000000, // 950 million
    isFeatured: false,
    description: "Thương hiệu y tế và sức khỏe hiện đại. Phù hợp cho chuỗi nhà thuốc, phòng khám tư nhân hoặc thương hiệu thực phẩm chức năng nhập khẩu.",
    ownerType: "Tổ chức",
    views: 612,
    likes: 88
  },
  {
    id: "tm-9",
    name: "ECOGLOW",
    logoText: "EcoGlow",
    logoBg: "from-emerald-500 to-teal-700",
    status: "available",
    classes: [25, 44],
    goodsDescription: "Mỹ phẩm thiên nhiên, sản phẩm chăm sóc da hữu cơ; dịch vụ spa, massage và điều trị thẩm mỹ không xâm lấn.",
    applicationNo: "4-2023-99112",
    filingDate: "2023-07-22",
    price: 680000000, // 680 million
    isFeatured: false,
    description: "Sự kết hợp hoàn hảo giữa 'Eco' (Thân thiện môi trường) và 'Glow' (Tỏa sáng). Thích hợp cho các nhãn hàng mỹ phẩm organic và chuỗi spa thuần chay.",
    ownerType: "Cá nhân",
    views: 520,
    likes: 145
  },
  {
    id: "tm-10",
    name: "TECHVINA",
    logoText: "TechVina",
    logoBg: "from-slate-700 to-slate-900",
    status: "negotiating",
    classes: [9, 35],
    goodsDescription: "Phần mềm quản lý doanh nghiệp, ứng dụng ví điện tử, phần cứng máy tính; dịch vụ tư vấn chuyển đổi số và tiếp thị trực tuyến.",
    applicationNo: "4-2022-90909",
    filingDate: "2022-10-15",
    price: 1800000000, // 1.8 billion
    isFeatured: false,
    description: "Thương hiệu công nghệ thuần Việt cực kỳ chuyên nghiệp và uy tín. Đã được cấp bằng độc quyền sáng chế và nhãn hiệu, thích hợp cho tập đoàn công nghệ phần mềm.",
    ownerType: "Tổ chức",
    views: 1102,
    likes: 215
  }
];

export const MOCK_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Cách chọn dịch vụ đăng ký nhãn hiệu phù hợp tại Việt Nam",
    excerpt: "Lựa chọn đại diện sở hữu trí tuệ uy tín giúp rút ngắn thời gian thẩm định, tránh các rủi ro bị từ chối đơn đăng ký nhãn hiệu từ Cục Sở hữu trí tuệ.",
    date: "2026-07-01",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600",
    readTime: "5 phút đọc",
    category: "Pháp Lý"
  },
  {
    id: "blog-2",
    title: "Quy trình chuyển nhượng nhãn hiệu: Những lưu ý pháp lý quan trọng",
    excerpt: "Mua lại nhãn hiệu đã được bảo hộ giúp doanh nghiệp rút ngắn 2 năm chờ đợi. Khám phá các bước ký hợp đồng và đăng ký chuyển nhượng đúng pháp luật.",
    date: "2026-06-25",
    imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600",
    readTime: "8 phút đọc",
    category: "Giao Dịch"
  },
  {
    id: "blog-3",
    title: "Bảo hộ thương hiệu trên không gian mạng và sàn thương mại điện tử",
    excerpt: "Cách giải quyết tranh chấp thương hiệu khi bị các gian hàng giả mạo xâm phạm bản quyền trên Shopee, Lazada, TikTok Shop một cách triệt để.",
    date: "2026-06-18",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    readTime: "6 phút đọc",
    category: "Thương Hiệu"
  }
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: "faq-1",
    category: "buy",
    question: "Các nhãn hiệu hoặc tên miền có được xác minh về quyền sở hữu, tình trạng đăng ký và tính hợp lệ không?",
    answer: "Tất cả các nhãn hiệu niêm yết trên BrandHub đều trải qua quy trình thẩm định 3 lớp nghiêm ngặt bởi đội ngũ chuyên gia pháp lý và luật sư SHTT của chúng tôi. Chúng tôi đối chiếu trực tiếp dữ liệu với Cục Sở hữu Trí tuệ Việt Nam (WIPO / CSDL quốc gia), kiểm tra tình trạng hiệu lực, tranh chấp, khiếu nại hoặc cầm cố trước khi cho phép hiển thị lên sàn. Người mua được đảm bảo 100% về tính sạch sẽ pháp lý."
  },
  {
    id: "faq-2",
    category: "buy",
    question: "Quy trình giao dịch gồm những bước nào và mất bao lâu để hoàn tất?",
    answer: "Quy trình gồm 4 bước đơn giản: 1. Đặt mua và ký hợp đồng đặt cọc; 2. Soạn thảo hợp đồng chuyển nhượng chính thức ký 3 bên/công chứng; 3. Nộp hồ sơ chuyển nhượng lên Cục SHTT; 4. Bàn giao Giấy chứng nhận đăng ký nhãn hiệu (văn bằng bảo hộ gốc) đã được ghi nhận chủ sở hữu mới. Thời gian bàn giao quyền khai thác thương mại là ngay lập tức khi ký hợp đồng, thời gian hoàn thành ghi nhận hành chính tại Cục SHTT từ 3-6 tháng."
  },
  {
    id: "faq-3",
    category: "buy",
    question: "Giá niêm yết có thể thương lượng không? Có phát sinh chi phí giao dịch hoặc dịch vụ bổ sung nào không?",
    answer: "Giá niêm yết trên hệ thống là giá đề xuất từ chủ sở hữu nhãn hiệu. Người mua hoàn toàn có thể sử dụng tính năng 'Thương lượng giá' trên BrandHub để đưa ra mức giá mong muốn. Chi phí giao dịch bao gồm phí môi giới sàn (đã tính vào giá bán) và lệ phí nhà nước về ghi nhận chuyển nhượng. BrandHub cam kết công khai, minh bạch, không phát sinh bất kỳ khoản phí ẩn nào."
  },
  {
    id: "faq-4",
    category: "sell",
    question: "Làm thế nào để tôi có thể ký gửi nhãn hiệu của mình lên sàn BrandHub?",
    answer: "Bạn chỉ cần nhấn nút 'Bán ngay' hoặc 'Ký gửi nhãn hiệu' trên thanh menu. Điền thông tin nhãn hiệu bao gồm: số đơn/số bằng bảo hộ, nhóm sản phẩm, giá bán mong muốn và thông tin liên hệ. Chuyên gia của chúng tôi sẽ liên hệ trong vòng 2 giờ làm việc để thẩm định hồ sơ gốc, ký hợp đồng ký gửi và đưa nhãn hiệu của bạn tiếp cận hơn 5,000+ nhà đầu tư tiềm năng."
  },
  {
    id: "faq-5",
    category: "sell",
    question: "Thanh toán giao dịch được thực hiện như thế nào để đảm bảo an toàn cho cả hai bên?",
    answer: "BrandHub áp dụng cơ chế tài khoản Escrow (Ký quỹ an toàn). Khi người mua thanh toán, tiền sẽ được giữ tại tài khoản ký quỹ của Ngân hàng đối tác liên kết với BrandHub. Tiền chỉ được giải ngân cho người bán sau khi hồ sơ chuyển nhượng hợp lệ được nộp và có dấu nhận đơn của Cục Sở hữu Trí tuệ Việt Nam, hoặc khi hợp đồng công chứng chuyển nhượng đã hoàn tất tùy thỏa thuận đặt cọc."
  },
  {
    id: "faq-6",
    category: "register",
    question: "Tại sao nên mua một nhãn hiệu đã đăng ký sẵn thay vì đăng ký một nhãn hiệu mới?",
    answer: "Đăng ký một nhãn hiệu mới tại Việt Nam trung bình mất từ 18 đến 24 tháng (thậm chí lâu hơn nếu có phản đối đơn), và tỷ lệ bị từ chối đơn là hơn 50% do trùng hoặc tương tự gây nhầm lẫn với các nhãn hiệu đã có trước đó. Mua lại nhãn hiệu đã được cấp văn bằng bảo hộ giúp bạn: 1. Có quyền sở hữu độc quyền ngay lập tức; 2. Bỏ qua hoàn toàn rủi ro bị từ chối; 3. Triển khai sản xuất kinh doanh và nhượng quyền thương mại (franchise) ngay trong ngày."
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Nguyễn Minh Trí",
    role: "Quản lý chuỗi ẩm thực Trí Việt",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    content: "Tôi đã tìm kiếm một thương hiệu về mảng thực phẩm và ăn uống rất khó khăn trong suốt thời gian qua vì hầu hết các tên đẹp đều bị đăng ký hết. Thật tuyệt vời khi tìm được BrandHub! Quy trình chuyển nhượng cực kỳ nhanh gọn, giúp chúng tôi sở hữu nhãn hiệu độc quyền chỉ trong vài ngày thay vì chờ đợi 2 năm."
  },
  {
    id: "rev-2",
    author: "Phan Thị Thu Hà",
    role: "CEO EcoGlow Cosmetics",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    content: "Nhờ BrandHub, tôi đã thanh lý được 2 nhãn hiệu mỹ phẩm chưa dùng tới với giá rất tốt. Đội ngũ tư vấn pháp lý hỗ trợ tận tình từ khâu soạn hợp đồng đến khâu nộp hồ sơ lên Cục SHTT. Dịch vụ tuyệt vời và uy tín!"
  },
  {
    id: "rev-3",
    author: "Trần Hoàng Nam",
    role: "Nhà sáng lập TechVina Solutions",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    rating: 5,
    content: "Sàn giao dịch rất chuyên nghiệp, thông tin nhãn hiệu minh bạch rõ ràng, tra cứu nhóm hàng hóa phân loại cực kỳ chuẩn xác theo Thỏa ước Nice. Đây đúng là giải pháp tối ưu cho giới khởi nghiệp công nghệ."
  }
];
