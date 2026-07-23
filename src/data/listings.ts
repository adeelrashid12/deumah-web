export interface ListingItem {
  id: string;
  category: string;
  images: string[];
  video?: string;
  titleEn: string;
  titleAr: string;
  price: number;
  periodEn: string;
  periodAr: string;
  type: 'rent' | 'sell';
  locationEn: string;
  locationAr: string;
  cityId: string;
  verified: boolean;
  newToday: boolean;
  negotiable: boolean;
  deliveryAvailable: boolean;
  freeDelivery: boolean;
  createdDaysAgo: number;
  descriptionEn: string;
  descriptionAr: string;
  specs: { labelEn: string; labelAr: string; valueEn: string; valueAr: string }[];
  owner: {
    nameEn: string;
    nameAr: string;
    avatar: string;
    memberSinceEn: string;
    memberSinceAr: string;
    responseRate: string;
  };
}

export const LISTINGS_DB: Record<string, ListingItem> = {
  '1': {
    id: '1',
    category: 'cars',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop&q=80'
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    titleEn: 'Toyota Land Cruiser 2021',
    titleAr: 'تويوتا لاند كروزر 2021',
    price: 85,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a • Hadda",
    locationAr: 'صنعاء • حدة',
    cityId: 'sanaa',
    verified: true,
    newToday: false,
    negotiable: true,
    deliveryAvailable: false,
    freeDelivery: true,
    createdDaysAgo: 2,
    descriptionEn: 'Premium luxury SUV in excellent condition. Ideal for delegation trips, rough terrain, and family travel in Yemen. Regularly serviced with full insurance coverage included.',
    descriptionAr: 'سيارة دفع رباعي فاخرة وممتازة في حالة ممتازة جداً. مثالية للرحلات والوفود والمناطق الوعرة والسفر العائلي في اليمن. صيانة دورية شاملة مع التأمين.',
    specs: [
      { labelEn: 'Brand', labelAr: 'الشركة المصنعة', valueEn: 'Toyota', valueAr: 'تويوتا' },
      { labelEn: 'Model', labelAr: 'الموديل', valueEn: 'Land Cruiser V8', valueAr: 'لاند كروزر V8' },
      { labelEn: 'Year', labelAr: 'سنة الصنع', valueEn: '2021', valueAr: '٢٠٢١' },
      { labelEn: 'Transmission', labelAr: 'ناقل الحركة', valueEn: 'Automatic', valueAr: 'أوتوماتيك' },
      { labelEn: 'Fuel', labelAr: 'نوع الوقود', valueEn: 'Gasoline', valueAr: 'بنزين' }
    ],
    owner: {
      nameEn: 'Maged Al-Subaee',
      nameAr: 'ماجد السبيعي',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      memberSinceEn: 'June 2022',
      memberSinceAr: 'يونيو ٢٠٢٢',
      responseRate: '98%'
    }
  },
  '2': {
    id: '2',
    category: 'properties',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-apartment-40248-large.mp4',
    titleEn: 'Villa in Al-Sabeen Street',
    titleAr: 'فيلا في شارع السبعين',
    price: 950,
    periodEn: 'Month',
    periodAr: 'شهر',
    type: 'rent',
    locationEn: "Sana'a • Al-Sabeen",
    locationAr: 'صنعاء • السبعين',
    cityId: 'sanaa',
    verified: true,
    newToday: false,
    negotiable: false,
    deliveryAvailable: true,
    freeDelivery: false,
    createdDaysAgo: 5,
    descriptionEn: 'Spacious luxury villa located in the heart of Sanaa. Features 5 bedrooms, 4 bathrooms, private garden, security guarding service, and continuous electricity/water connection.',
    descriptionAr: 'فيلا فاخرة واسعة تقع في قلب العاصمة صنعاء بشارع السبعين. تحتوي على ٥ غرف نوم، ٤ حمامات، حديقة خاصة، حراسة أمنية، وخطوط كهرباء وماء متواصلة.',
    specs: [
      { labelEn: 'Type', labelAr: 'النوع', valueEn: 'Villa', valueAr: 'فيلا' },
      { labelEn: 'Bedrooms', labelAr: 'غرف النوم', valueEn: '5', valueAr: '٥' },
      { labelEn: 'Bathrooms', labelAr: 'الحمامات', valueEn: '4', valueAr: '٤' },
      { labelEn: 'Area Size', labelAr: 'المساحة', valueEn: '450 sqm', valueAr: '٤٥٠ متر مربع' },
      { labelEn: 'Furnished', labelAr: 'مفروش', valueEn: 'No', valueAr: 'لا' }
    ],
    owner: {
      nameEn: 'Ahmad Al-Wazir',
      nameAr: 'أحمد الوزير',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      memberSinceEn: 'January 2020',
      memberSinceAr: 'يناير ٢٠٢٠',
      responseRate: '95%'
    }
  },
  '3': {
    id: '3',
    category: 'electronics',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80'
    ],
    titleEn: 'Canon 80D Camera',
    titleAr: 'كاميرا Canon 80D',
    price: 450,
    periodEn: '',
    periodAr: '',
    type: 'sell',
    locationEn: "Sana'a • Al-Tahrir",
    locationAr: 'صنعاء • التحرير',
    cityId: 'sanaa',
    verified: false,
    newToday: true,
    negotiable: false,
    deliveryAvailable: false,
    freeDelivery: false,
    createdDaysAgo: 0,
    descriptionEn: 'Professional DSLR camera, almost new condition. Includes 18-135mm lens, original battery, charger, and carrying bag. Perfect for creators and vloggers.',
    descriptionAr: 'كاميرا DSLR احترافية، بحالة شبه جديدة تماماً. تشمل عدسة ١٨-١٣٥ مم، البطارية الأصلية، الشاحن، وحقيبة كتف. مثالية للمصورين وصناع المحتوى.',
    specs: [
      { labelEn: 'Brand', labelAr: 'الشركة', valueEn: 'Canon', valueAr: 'كانون' },
      { labelEn: 'Model', labelAr: 'الموديل', valueEn: 'EOS 80D', valueAr: 'EOS 80D' },
      { labelEn: 'Lens', labelAr: 'العدسة', valueEn: '18-135mm USM', valueAr: '١٨-١٣٥ مم' },
      { labelEn: 'Resolution', labelAr: 'دقة الحساس', valueEn: '24.2 MP', valueAr: '٢٤.٢ ميجابكسل' }
    ],
    owner: {
      nameEn: 'Hasan Al-Kohali',
      nameAr: 'حسن الكحلي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      memberSinceEn: 'March 2023',
      memberSinceAr: 'مارس ٢٠٢٣',
      responseRate: '100%'
    }
  },
  '5': {
    id: '5',
    category: 'wedding_halls',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505232458627-537449567a5b?w=800&auto=format&fit=crop&q=80'
    ],
    video: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-40251-large.mp4',
    titleEn: 'Royal Palace Wedding Hall',
    titleAr: 'قاعة القصر الملكية للأفراح',
    price: 1200,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a City • Al-Wahdah",
    locationAr: 'أمانة العاصمة • الوحدة',
    cityId: 'sanaa_city',
    verified: true,
    newToday: true,
    negotiable: false,
    deliveryAvailable: false,
    freeDelivery: true,
    createdDaysAgo: 0,
    descriptionEn: 'The most prestigious wedding hall in Sanaa. Accommodates up to 1,000 guests, equipped with luxury lighting, high-end sound system, and professional catering staff.',
    descriptionAr: 'قاعة الأفراح الأكثر تميزاً وفخامة في صنعاء. تتسع لأكثر من ١٠٠٠ ضيف، مجهزة بالكامل بأنظمة إضاءة وصوت دي جي فاخرة وطاقم ضيافة متميز.',
    specs: [
      { labelEn: 'Capacity', labelAr: 'السعة الاستيعابية', valueEn: '1000 Guests', valueAr: '١٠٠٠ ضيف' },
      { labelEn: 'Valet Parking', labelAr: 'مواقف سيارات', valueEn: 'Yes', valueAr: 'نعم' },
      { labelEn: 'Sound System', labelAr: 'نظام الصوت', valueEn: 'High Fidelity', valueAr: 'ممتاز مجسم' },
      { labelEn: 'AC System', labelAr: 'التكييف', valueEn: 'Central AC', valueAr: 'مركزي بالكامل' }
    ],
    owner: {
      nameEn: 'Deumah Wedding Services',
      nameAr: 'ديومة لخدمات المناسبات',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      memberSinceEn: 'November 2021',
      memberSinceAr: 'نوفمبر ٢٠٢١',
      responseRate: '92%'
    }
  }
};
