import { Language } from '../localization';

// Load the API base URL from the environment variables, prioritizing NEXT_PUBLIC_API_URL or VITE_API_URL
const getApiBaseUrl = (): string => {
  const meta = import.meta as any;
  const envUrl = 
    (meta.env?.VITE_API_URL) || 
    (meta.env?.NEXT_PUBLIC_API_URL) ||
    // @ts-ignore
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
    'https://admin.hdslaw.vn';
  
  // Strip trailing slash if present
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

export interface ApiNiceClass {
  id: number;
  name: string;
  position: number;
}

export interface NiceClassInfo {
  name: string;
  desc: string;
}

// Full 45 Nice Classes Fallback for English & Vietnamese
const FALLBACK_CLASSES_VI: Record<number, NiceClassInfo> = {
  1: { name: "Hóa chất công nghiệp", desc: "Hóa chất dùng trong công nghiệp, khoa học, nhiếp ảnh, cũng như trong nông nghiệp, nghề làm vườn và lâm nghiệp." },
  2: { name: "Sơn & Chất màu", desc: "Sơn, vecni, sơn mài; chất chống rỉ và chất bảo quản gỗ; chất nhuộm." },
  3: { name: "Mỹ phẩm & Chất tẩy rửa", desc: "Mỹ phẩm không chứa thuốc và chế phẩm vệ sinh; chế phẩm đánh bóng và tẩy sạch." },
  4: { name: "Dầu mỡ công nghiệp", desc: "Dầu và mỡ công nghiệp, sáp; chất bôi trơn; chất hấp thụ bụi." },
  5: { name: "Y tế & Dược phẩm", desc: "Chế phẩm dược phẩm, y tế và thú y; chế phẩm dinh dưỡng; chất diệt cỏ, diệt côn trùng." },
  6: { name: "Kim loại thông thường", desc: "Kim loại thông thường và hợp kim của chúng; vật liệu xây dựng bằng kim loại." },
  7: { name: "Máy móc & Động cơ", desc: "Máy móc, công cụ cơ khí, động cơ; máy nông nghiệp; máy ấp trứng." },
  8: { name: "Công cụ cầm tay", desc: "Công cụ và dụng cụ cầm tay thao tác thủ công; dao kéo; vũ khí phụ." },
  9: { name: "Thiết bị điện tử & Phần mềm", desc: "Máy tính, phần mềm, ứng dụng di động, thiết bị viễn thông, thiết bị khoa học." },
  10: { name: "Thiết bị y tế", desc: "Thiết bị và dụng cụ y khoa, nha khoa, thú y; bộ phận giả; chỉ khâu." },
  11: { name: "Thiết bị nhiệt & Ánh sáng", desc: "Thiết bị chiếu sáng, sưởi ấm, tạo hơi nước, nấu nướng, thông gió." },
  12: { name: "Phương tiện giao thông", desc: "Xe cộ; phương tiện giao thông trên bộ, trên không, dưới nước." },
  13: { name: "Chất nổ & Pháo hoa", desc: "Súng đạn; chất nổ; pháo hoa." },
  14: { name: "Kim hoàn & Trang sức", desc: "Kim loại quý và hợp kim của chúng; trang sức, đồng hồ." },
  15: { name: "Nhạc cụ", desc: "Nhạc cụ; giá để bản nhạc; dùi đánh nhạc." },
  16: { name: "Giấy & Văn phòng phẩm", desc: "Giấy, bìa các tông; sách báo, ấn phẩm; văn phòng phẩm." },
  17: { name: "Cao su & Chất dẻo bán thành phẩm", desc: "Cao su, chất dẻo dạng bán thành phẩm; vật liệu gắn, bít và cách điện." },
  18: { name: "Da & Giả da", desc: "Da và giả da; vali, túi xách, ví; ô dù; yên cương." },
  19: { name: "Vật liệu xây dựng phi kim", desc: "Vật liệu xây dựng phi kim loại; đường ống phi kim dùng trong xây dựng." },
  20: { name: "Đồ nội thất", desc: "Đồ nội thất, gương, khung tranh; sản phẩm bằng gỗ, sáp." },
  21: { name: "Dụng cụ gia đình & Nhà bếp", desc: "Dụng cụ và đồ chứa dùng cho gia đình hoặc nhà bếp; thủy tinh, sứ." },
  22: { name: "Dây cáp, Lều bạt & Buồm", desc: "Dây cáp, dây thừng; lưới; lều bạt; buồm; bao tải." },
  23: { name: "Sợi ngành dệt", desc: "Các loại sợi dùng cho ngành dệt." },
  24: { name: "Vải & Sản phẩm dệt", desc: "Vải và các sản phẩm dệt; khăn trải giường, khăn trải bàn." },
  25: { name: "Thời trang & May mặc", desc: "Quần áo, giày dép, đồ đội đầu." },
  26: { name: "Ren, Ruy băng & Khuy", desc: "Ren, ruy băng; khuy, móc, mắt cáo; kim; hoa nhân tạo." },
  27: { name: "Thảm & Giấy dán tường", desc: "Thảm, chiếu, bạt; vật liệu lót sàn; giấy dán tường." },
  28: { name: "Đồ chơi & Thiết bị thể thao", desc: "Trò chơi, đồ chơi; thiết bị thể thao; đồ trang trí cây thông Noel." },
  29: { name: "Thực phẩm & Sữa", desc: "Sữa, bơ, pho mát, sữa chua; thịt, cá; rau quả sấy khô hoặc đã chế biến." },
  30: { name: "Cà phê, Trà & Bánh kẹo", desc: "Cà phê, trà, cacao, đường, gạo, bột mì, bánh mì, gia vị, bánh kẹo." },
  31: { name: "Sản phẩm nông nghiệp thô", desc: "Sản phẩm nông, lâm, thủy sản chưa chế biến; hạt giống." },
  32: { name: "Đồ uống không cồn", desc: "Bia; nước suối, nước trái cây, nước ngọt, đồ uống không cồn khác." },
  33: { name: "Đồ uống có cồn", desc: "Rượu mạnh, rượu vang, đồ uống có cồn (trừ bia)." },
  34: { name: "Thuốc lá & Diêm", desc: "Thuốc lá; diêm; dụng cụ cho người hút thuốc." },
  35: { name: "Quảng cáo & Bán lẻ", desc: "Dịch vụ quảng cáo, quản lý và điều hành kinh doanh; bán lẻ sản phẩm." },
  36: { name: "Tài chính & Bất động sản", desc: "Dịch vụ tài chính, tiền tệ, bảo hiểm; dịch vụ bất động sản." },
  37: { name: "Xây dựng & Sửa chữa", desc: "Dịch vụ xây dựng, lắp đặt, tháo dỡ và sửa chữa." },
  38: { name: "Dịch vụ viễn thông", desc: "Dịch vụ truyền thông, phát sóng, viễn thông." },
  39: { name: "Vận tải & Lưu kho", desc: "Vận tải; đóng gói và lưu kho hàng hóa; sắp xếp chuyến đi." },
  40: { name: "Xử lý vật liệu", desc: "Xử lý vật liệu; tái chế rác thải; in ấn; mạ điện." },
  41: { name: "Giáo dục & Giải trí", desc: "Dịch vụ giáo dục, đào tạo; hoạt động giải trí, thể thao và văn hóa." },
  42: { name: "Nghiên cứu & Phần mềm", desc: "Dịch vụ khoa học và công nghệ; dịch vụ thiết kế và phát triển phần mềm." },
  43: { name: "Dịch vụ ăn uống & Lưu trú", desc: "Dịch vụ cung cấp đồ ăn uống; dịch vụ lưu trú tạm thời (nhà hàng, khách sạn)." },
  44: { name: "Y tế & Làm đẹp", desc: "Dịch vụ y tế, chăm sóc sắc đẹp, thẩm mỹ viện, spa; dịch vụ thú y, nông nghiệp." },
  45: { name: "Dịch vụ pháp lý & An ninh", desc: "Dịch vụ pháp lý; dịch vụ an ninh nhằm bảo vệ người và tài sản." }
};

const FALLBACK_CLASSES_EN: Record<number, NiceClassInfo> = {
  1: { name: "Industrial Chemicals", desc: "Chemicals for use in industry, science, photography, agriculture, horticulture, and forestry." },
  2: { name: "Paints & Colorants", desc: "Paints, varnishes, lacquers; preservatives against rust and deterioration of wood; colorants." },
  3: { name: "Cosmetics & Cleaning", desc: "Non-medicated cosmetics and toiletry preparations; polishing and abrasive preparations." },
  4: { name: "Industrial Oils", desc: "Industrial oils and greases, wax; lubricants; dust absorbing compositions." },
  5: { name: "Pharmaceuticals", desc: "Pharmaceuticals, medical and veterinary preparations; sanitary preparations; herbicides, pesticides." },
  6: { name: "Common Metals", desc: "Common metals and their alloys; metal materials for building and construction." },
  7: { name: "Machines & Motors", desc: "Machines, machine tools, power-operated tools; motors and engines; agricultural implements." },
  8: { name: "Hand Tools", desc: "Hand tools and implements, hand-operated; cutlery; side arms." },
  9: { name: "Electronics & Software", desc: "Computers, software, mobile apps, telecommunication equipment, scientific apparatus." },
  10: { name: "Medical Devices", desc: "Surgical, medical, dental, and veterinary apparatus and instruments; artificial limbs; suture materials." },
  11: { name: "Heating & Lighting", desc: "Apparatus for lighting, heating, steam generating, cooking, ventilating, water supply." },
  12: { name: "Vehicles", desc: "Vehicles; apparatus for locomotion by land, air, or water." },
  13: { name: "Explosives & Fireworks", desc: "Firearms; ammunition and projectiles; explosives; fireworks." },
  14: { name: "Jewellery & Watches", desc: "Precious metals and their alloys; jewellery, precious stones; horological instruments." },
  15: { name: "Musical Instruments", desc: "Musical instruments; music stands and stands for musical instruments." },
  16: { name: "Paper & Stationery", desc: "Paper and cardboard; printed matter; bookbinding material; stationery." },
  17: { name: "Rubber & Semi-processed Plastics", desc: "Unprocessed and semi-processed rubber, plastics; packing, stopping, and insulating materials." },
  18: { name: "Leather Goods", desc: "Leather and imitations of leather; luggage, bags, wallets; umbrellas; saddlery." },
  19: { name: "Non-metallic Building Materials", desc: "Materials, not of metal, for building and construction; non-metallic rigid pipes." },
  20: { name: "Furniture", desc: "Furniture, mirrors, picture frames; goods of wood, wax, plaster." },
  21: { name: "Household & Kitchen Utensils", desc: "Household or kitchen utensils and containers; cookware; glassware, porcelain." },
  22: { name: "Ropes, Tents & Sails", desc: "Ropes and string; nets; tents and tarpaulins; sails; sacks." },
  23: { name: "Yarns & Threads", desc: "Yarns and threads, for textile use." },
  24: { name: "Textiles & Fabrics", desc: "Textiles and substitutes for textiles; household linen; curtains." },
  25: { name: "Clothing & Headwear", desc: "Clothing, footwear, headwear." },
  26: { name: "Lace, Ribbons & Buttons", desc: "Lace, braid, embroidery, and haberdashery ribbons; buttons, hooks; artificial flowers." },
  27: { name: "Carpets & Wallpapers", desc: "Carpets, rugs, mats and matting, linoleum; wall hangings." },
  28: { name: "Toys & Sporting Goods", desc: "Games, toys, and playthings; video game apparatus; gymnastic and sporting articles." },
  29: { name: "Foods & Dairy", desc: "Meat, fish, poultry; milk, butter, cheese, yogurt; preserved or dried fruits." },
  30: { name: "Coffee, Tea & Baking", desc: "Coffee, tea, cocoa, sugar, rice, flour, bread, pastries, spices, confectionery." },
  31: { name: "Raw Agricultural Products", desc: "Raw and unprocessed agricultural, aquacultural, horticultural products; seeds." },
  32: { name: "Non-Alcoholic Beverages", desc: "Beers; non-alcoholic beverages; mineral waters; fruit juices." },
  33: { name: "Alcoholic Beverages", desc: "Alcoholic beverages, except beers; wines, spirits, liqueurs." },
  34: { name: "Tobacco & Matches", desc: "Tobacco and tobacco substitutes; cigarettes; matches; smokers' articles." },
  35: { name: "Advertising & Retail", desc: "Advertising; business management, organization and administration; retail services." },
  36: { name: "Finance & Real Estate", desc: "Financial, monetary and banking services; insurance; real estate affairs." },
  37: { name: "Construction & Repair", desc: "Construction services; installation, demolition and repair services." },
  38: { name: "Telecommunications", desc: "Telecommunications services; broadcasting and communication." },
  39: { name: "Transport & Storage", desc: "Transport; packaging and storage of goods; travel arrangement." },
  40: { name: "Material Treatment", desc: "Treatment of materials; recycling of waste; printing; electroplating." },
  41: { name: "Education & Entertainment", desc: "Education; providing of training; entertainment; sporting and cultural activities." },
  42: { name: "Research & Software", desc: "Scientific and technological services and research; software development and design." },
  43: { name: "Food Services & Lodging", desc: "Services for providing food and drink; temporary accommodation (restaurants, hotels)." },
  44: { name: "Medical & Beauty", desc: "Medical services; veterinary services; hygienic and beauty care; agriculture services." },
  45: { name: "Legal & Security", desc: "Legal services; security services for the physical protection of tangible property and individuals." }
};

/**
 * Extracts a concise title from a longer class description
 * e.g., "Hóa chất dùng trong công nghiệp, khoa học, nhiếp ảnh..." -> "Hóa chất công nghiệp"
 */
const extractShortTitle = (fullText: string, lang: Language): string => {
  if (!fullText) return lang === 'vi' ? 'Lĩnh vực' : 'Class';
  
  // Split by common separators to get the first clause
  const firstClause = fullText.split(';')[0].split(',')[0].split('.')[0].trim();
  
  // Clean up and truncate if too long
  if (firstClause.length > 30) {
    return firstClause.slice(0, 27) + '...';
  }
  return firstClause;
};

/**
 * Fetches Nice classes from the external API with automatic fallback
 */
export async function fetchNiceClasses(lang: Language): Promise<Record<number, NiceClassInfo>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/${lang}/api/attributes/nhom-san-pham-code`;
  
  console.log(`Fetching Nice classes from API: ${url}`);
  
  const defaultFallback = lang === 'vi' ? FALLBACK_CLASSES_VI : FALLBACK_CLASSES_EN;
  
  try {
    // Standard timeout to prevent loading indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API response error: Status ${response.status}`);
    }
    
    const json = await response.json();
    
    // Support various formats: raw array, { data: [...] }, or { results: [...] }
    let rawItems: ApiNiceClass[] = [];
    if (Array.isArray(json)) {
      rawItems = json;
    } else if (json && Array.isArray(json.data)) {
      rawItems = json.data;
    } else if (json && Array.isArray(json.results)) {
      rawItems = json.results;
    } else if (json && typeof json === 'object') {
      // Look for any property that contains an array
      const foundArray = Object.values(json).find(val => Array.isArray(val)) as ApiNiceClass[] | undefined;
      if (foundArray) {
        rawItems = foundArray;
      }
    }
    
    if (rawItems.length === 0) {
      throw new Error('No items found in API response');
    }
    
    // Transform API items to NiceClassInfo format
    const transformed: Record<number, NiceClassInfo> = {};
    
    rawItems.forEach((item) => {
      const position = Number(item.position) || Number(item.id);
      if (!position) return;
      
      const descText = item.name || '';
      const shortName = extractShortTitle(descText, lang);
      
      transformed[position] = {
        name: shortName,
        desc: descText
      };
    });
    
    console.log(`Successfully parsed ${Object.keys(transformed).length} Nice classes from API`);
    return transformed;
    
  } catch (error) {
    console.warn(`Could not load Nice classes from API, using robust offline fallback:`, error);
    return defaultFallback;
  }
}
