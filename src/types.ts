export interface Trademark {
  id: string;
  name: string;
  logoText: string;
  logoBg: string; // e.g. "from-amber-500 to-orange-600"
  status: 'available' | 'negotiating' | 'sold';
  statusText?: string;
  classes: number[];
  goodsDescription: string;
  applicationNo: string;
  filingDate: string;
  registrationNo?: string;
  price: number; // in VND, e.g. 1500000000 (1.5 billion)
  isFeatured: boolean;
  description: string;
  ownerType: string; // "Cá nhân" or "Tổ chức"
  views: number;
  likes: number;
  imagePath?: string;
  progresses?: any[];
  isExpiringSoon?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  readTime: string;
  category: string;
}

export interface FAQ {
  id: string;
  category: 'buy' | 'sell' | 'register';
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  content: string;
}
