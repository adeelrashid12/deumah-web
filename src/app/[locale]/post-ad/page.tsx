'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from '@/i18n/navigation';

export default function PostAdPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();

  // Basic Details State
  const [transactionType, setTransactionType] = useState<'rent' | 'sell'>('rent');
  const [category, setCategory] = useState<string>('cars');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('day');
  const [city, setCity] = useState('sanaa');
  const [area, setArea] = useState('');

  // Contact Preference States
  const [contactCall, setContactCall] = useState(true);
  const [contactChat, setContactChat] = useState(true);
  const [contactWhatsApp, setContactWhatsApp] = useState(false);

  // Category Specific States
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carTransmission, setCarTransmission] = useState('automatic');
  const [carFuel, setCarFuel] = useState('gasoline');

  const [propType, setPropType] = useState('apartment');
  const [propBedrooms, setPropBedrooms] = useState('');
  const [propBathrooms, setPropBathrooms] = useState('');
  const [propSize, setPropSize] = useState('');
  const [propFurnished, setPropFurnished] = useState('no');

  const [hallCapacity, setHallCapacity] = useState('');
  const [hallSound, setHallSound] = useState('yes');
  const [hallAC, setHallAC] = useState('central');
  const [hallValet, setHallValet] = useState('yes');

  const [chaletPool, setChaletPool] = useState('yes');
  const [chaletRooms, setChaletRooms] = useState('');

  const [elecBrand, setElecBrand] = useState('');
  const [elecModel, setElecModel] = useState('');
  const [elecCondition, setElecCondition] = useState('new');

  // Media Mock States
  const [photosList, setPhotosList] = useState<{ id: string; name: string; url: string }[]>([]);
  const [videoFile, setVideoFile] = useState<{ name: string; size: string } | null>(null);

  // Validation / Loading States
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Mock Image Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    if (photosList.length + filesArray.length > 10) {
      setErrorMsg(isAr ? 'عذراً، الحد الأقصى هو ١٠ صور فقط!' : 'Sorry, the maximum limit is 10 photos!');
      return;
    }
    setErrorMsg('');

    const newPhotos = filesArray.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setPhotosList(prev => [...prev, ...newPhotos]);
  };

  // Remove Photo
  const handleRemovePhoto = (id: string) => {
    setPhotosList(prev => prev.filter(photo => photo.id !== id));
  };

  // Handle Mock Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Check file size (approx 100MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      setErrorMsg(isAr ? 'حجم الفيديو كبير جداً! الحد الأقصى ١٠٠ ميجابايت.' : 'Video size is too large! Maximum limit is 100MB.');
      return;
    }
    setErrorMsg('');
    setVideoFile({
      name: file.name,
      size: `${fileSizeMB.toFixed(1)} MB`
    });
  };

  // Remove Video
  const handleRemoveVideo = () => {
    setVideoFile(null);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !description.trim()) {
      setErrorMsg(isAr ? 'يرجى تعبئة كافة الحقول الأساسية!' : 'Please fill out all required basic fields!');
      return;
    }

    setShowToast(true);
    setErrorMsg('');
    setTimeout(() => {
      setShowToast(false);
      router.push('/');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-deumah-navy-950 tracking-tight font-heading">
            {isAr ? 'انشر إعلاناً جديداً' : 'Post a New Ad'}
          </h1>
          <p className="text-sm text-deumah-gray-500 mt-1 font-medium">
            {isAr ? 'املأ التفاصيل لتبدأ في الوصول لآلاف المهتمين في اليمن' : 'Fill out details to start reaching thousands of buyers in Yemen'}
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="bg-white rounded-deumah border border-deumah-gray-200 p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Section 1: Transaction and Category */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">
                {isAr ? 'نوع المعاملة' : 'Transaction Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType('rent')}
                  className={`py-3 rounded-deumah-sm font-bold text-sm border text-center transition ${
                    transactionType === 'rent'
                      ? 'bg-deumah-green-700 text-white border-deumah-green-700 shadow-sm'
                      : 'bg-deumah-gray-50 text-deumah-gray-700 border-deumah-gray-200 hover:border-deumah-gray-300'
                  }`}
                >
                  {isAr ? 'تأجير' : 'Rent'}
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('sell')}
                  className={`py-3 rounded-deumah-sm font-bold text-sm border text-center transition ${
                    transactionType === 'sell'
                      ? 'bg-deumah-green-700 text-white border-deumah-green-700 shadow-sm'
                      : 'bg-deumah-gray-50 text-deumah-gray-700 border-deumah-gray-200 hover:border-deumah-gray-300'
                  }`}
                >
                  {isAr ? 'بيع' : 'Sell'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">
                {isAr ? 'الفئة' : 'Category'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-3 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold"
              >
                <option value="cars">{isAr ? '🚗 سيارات' : '🚗 Cars'}</option>
                <option value="properties">{isAr ? '🏠 عقارات' : '🏠 Properties'}</option>
                <option value="wedding_halls">{isAr ? '💍 قاعات أفراح' : '💍 Wedding Halls'}</option>
                <option value="chalets">{isAr ? '🏡 شاليهات' : '🏡 Chalets'}</option>
                <option value="electronics">{isAr ? '📱 إلكترونيات' : '📱 Electronics'}</option>
                <option value="tools">{isAr ? '🛠️ أدوات ومعدات' : '🛠️ Tools'}</option>
                <option value="services">{isAr ? '🔧 خدمات' : '🔧 Services'}</option>
              </select>
            </div>
          </div>

          {/* Section 2: Dynamic Category Specific Fields */}
          <div className="bg-deumah-gray-50/50 p-5 rounded-deumah border border-deumah-gray-200/60 space-y-4">
            <h3 className="text-xs font-bold text-deumah-navy-950 uppercase tracking-wider">
              ⚙️ {isAr ? 'المواصفات الفنية للفئة' : 'Category Specifications'}
            </h3>

            {/* CARS SPEC FIELDS */}
            {category === 'cars' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الشركة المصنعة' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota, Lexus"
                    value={carBrand}
                    onChange={e => setCarBrand(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Land Cruiser, RAV4"
                    value={carModel}
                    onChange={e => setCarModel(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'سنة الصنع' : 'Year'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 2022"
                    value={carYear}
                    onChange={e => setCarYear(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'ناقل الحركة' : 'Transmission'}</label>
                  <select
                    value={carTransmission}
                    onChange={e => setCarTransmission(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="automatic">{isAr ? 'أوتوماتيك' : 'Automatic'}</option>
                    <option value="manual">{isAr ? 'عادي' : 'Manual'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نوع الوقود' : 'Fuel Type'}</label>
                  <select
                    value={carFuel}
                    onChange={e => setCarFuel(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="gasoline">{isAr ? 'بنزين' : 'Gasoline'}</option>
                    <option value="diesel">{isAr ? 'ديزل' : 'Diesel'}</option>
                    <option value="hybrid">{isAr ? 'هايبرد' : 'Hybrid'}</option>
                    <option value="electric">{isAr ? 'كهربائي بالكامل' : 'Electric'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* PROPERTIES SPEC FIELDS */}
            {category === 'properties' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نوع العقار' : 'Property Type'}</label>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="apartment">{isAr ? 'شقة' : 'Apartment'}</option>
                    <option value="villa">{isAr ? 'فيلا' : 'Villa'}</option>
                    <option value="office">{isAr ? 'مكتب' : 'Office'}</option>
                    <option value="land">{isAr ? 'أرض' : 'Land'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'غرف النوم' : 'Bedrooms'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={propBedrooms}
                    onChange={e => setPropBedrooms(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الحمامات' : 'Bathrooms'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={propBathrooms}
                    onChange={e => setPropBathrooms(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'المساحة (متر مربع)' : 'Size (sqm)'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={propSize}
                    onChange={e => setPropSize(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'مفروش' : 'Furnished'}</label>
                  <select
                    value={propFurnished}
                    onChange={e => setPropFurnished(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* WEDDING HALLS SPEC FIELDS */}
            {category === 'wedding_halls' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'السعة الاستيعابية (ضيف)' : 'Capacity (guests)'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={hallCapacity}
                    onChange={e => setHallCapacity(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نظام صوتي DJ' : 'Sound System'}</label>
                  <select
                    value={hallSound}
                    onChange={e => setHallSound(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'متوفر' : 'Available'}</option>
                    <option value="no">{isAr ? 'غير متوفر' : 'Not Available'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نظام التكييف' : 'AC System'}</label>
                  <select
                    value={hallAC}
                    onChange={e => setHallAC(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="central">{isAr ? 'تكييف مركزي' : 'Central AC'}</option>
                    <option value="split">{isAr ? 'تكييف عادي' : 'Split AC'}</option>
                    <option value="none">{isAr ? 'مراوح فقط' : 'Fans Only'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'خدمة حراسة ومواقف' : 'Valet Parking'}</label>
                  <select
                    value={hallValet}
                    onChange={e => setHallValet(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* CHALETS SPEC FIELDS */}
            {category === 'chalets' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'وجود مسبح' : 'Pool'}</label>
                  <select
                    value={chaletPool}
                    onChange={e => setChaletPool(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'عدد الغرف' : 'Rooms Count'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={chaletRooms}
                    onChange={e => setChaletRooms(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
              </div>
            )}

            {/* ELECTRONICS SPEC FIELDS */}
            {category === 'electronics' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الشركة المصنعة' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Sony, Canon"
                    value={elecBrand}
                    onChange={e => setElecBrand(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15, EOS 80D"
                    value={elecModel}
                    onChange={e => setElecModel(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'حالة الجهاز' : 'Condition'}</label>
                  <select
                    value={elecCondition}
                    onChange={e => setElecCondition(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="new">{isAr ? 'جديد تماماً' : 'Brand New'}</option>
                    <option value="open_box">{isAr ? 'شبه جديد (كرتون مفتوح)' : 'Open Box'}</option>
                    <option value="used">{isAr ? 'مستعمل نظيف' : 'Used (Clean)'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Fallback for Tools/Services */}
            {(category === 'tools' || category === 'services') && (
              <p className="text-xs text-deumah-gray-400 font-semibold italic">
                {isAr ? 'هذه الفئة تستخدم مواصفات تعبئة الإعلان العامة فقط.' : 'This category relies on default basic ad attributes.'}
              </p>
            )}
          </div>

          {/* Section 3: Media File Uploader (Up to 10 photos + 1 optional video) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">
                📸 {isAr ? 'معرض الصور والفيديو (الحد الأقصى ١٠ صور وفيديو واحد)' : 'Photo & Video Gallery (Max 10 photos & 1 video)'}
              </h3>
              
              {/* Flex grids for photo & video drag-drop cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Photo Dropzone */}
                <div className="border-2 border-dashed border-deumah-gray-200 rounded-deumah p-6 text-center hover:border-deumah-green-700 transition relative cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg className="size-8 text-deumah-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-bold text-deumah-navy-950">{isAr ? 'اضغط لرفع الصور' : 'Click to Upload Photos'}</p>
                  <p className="text-[10px] text-deumah-gray-400 mt-1">{isAr ? 'تنسيق JPG, PNG حتى ١٠ صور' : 'Formats: JPG, PNG (Max 10)'}</p>
                </div>

                {/* Video Dropzone */}
                <div className="border-2 border-dashed border-deumah-gray-200 rounded-deumah p-6 text-center hover:border-deumah-green-700 transition relative cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!!videoFile}
                  />
                  <svg className="size-8 text-deumah-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-bold text-deumah-navy-950">
                    {videoFile ? (isAr ? 'تم رفع الفيديو' : 'Video Uploaded') : (isAr ? 'رفع فيديو قصير' : 'Upload Short Video')}
                  </p>
                  <p className="text-[10px] text-deumah-gray-400 mt-1">{isAr ? 'اختياري، أقل من ١٠٠ ميجابايت' : 'Optional (Max 100MB)'}</p>
                </div>

              </div>
            </div>

            {/* Render uploaded items list grid */}
            {(photosList.length > 0 || videoFile) && (
              <div className="bg-deumah-gray-50 border border-deumah-gray-200 rounded-deumah p-4 space-y-3">
                <p className="text-[11px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                  {isAr ? 'الملفات المرفوعة حالياً' : 'Currently Uploaded Files'}
                </p>
                
                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {/* Photo tiles */}
                  {photosList.map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded border border-deumah-gray-200 overflow-hidden bg-white group shadow-sm">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition duration-200"
                      >
                        🗑️ {isAr ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  ))}

                  {/* Video tile */}
                  {videoFile && (
                    <div className="relative aspect-square rounded border border-deumah-gray-200 p-3 bg-deumah-navy-950 text-white flex flex-col justify-between shadow-sm">
                      <div className="text-xl">🎥</div>
                      <div className="truncate text-[10px] font-semibold text-white/90">{videoFile.name}</div>
                      <div className="text-[9px] text-white/50">{videoFile.size}</div>
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-red-600 text-white rounded p-1 text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Basic Info (Title, Description, Price, Location) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'عنوان الإعلان' : 'Ad Title'} *
              </label>
              <input
                type="text"
                placeholder={isAr ? 'مثال: تويوتا لاند كروزر ٢٠٢١ للبيع' : 'e.g. Toyota Land Cruiser 2021 for Rent'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'السعر (بالدولار)' : 'Price (in USD)'} *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                  required
                />
              </div>

              {/* Dynamic Billing Period Selector (Only if Rent selected) */}
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'فترة الدفع' : 'Billing Period'}
                </label>
                <select
                  value={billingPeriod}
                  onChange={e => setBillingPeriod(e.target.value)}
                  disabled={transactionType === 'sell'}
                  className={`w-full text-sm border rounded-deumah-sm px-3 py-3 outline-none transition cursor-pointer font-semibold ${
                    transactionType === 'sell'
                      ? 'bg-deumah-gray-100 text-deumah-gray-400 border-deumah-gray-200 cursor-not-allowed'
                      : 'bg-white border-deumah-gray-200 focus:border-deumah-green-600'
                  }`}
                >
                  <option value="day">{isAr ? 'لكل يوم' : 'Per Day'}</option>
                  <option value="week">{isAr ? 'لكل أسبوع' : 'Per Week'}</option>
                  <option value="month">{isAr ? 'لكل شهر' : 'Per Month'}</option>
                  <option value="year">{isAr ? 'لكل سنة' : 'Per Year'}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'المحافظة' : 'City'} *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-3 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold"
                >
                  <option value="sanaa_city">{isAr ? 'أمانة العاصمة' : "Sana'a City"}</option>
                  <option value="sanaa">{isAr ? 'صنعاء' : "Sana'a"}</option>
                  <option value="aden">{isAr ? 'عدن' : 'Aden'}</option>
                  <option value="taiz">{isAr ? 'تعز' : 'Taiz'}</option>
                  <option value="ibb">{isAr ? 'إب' : 'Ibb'}</option>
                  <option value="hadhramaut">{isAr ? 'حضرموت' : 'Hadhramaut'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'المديرية / المنطقة' : 'District / Area'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hadda, Al-Sabeen"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'وصف تفصيلي' : 'Detailed Description'} *
              </label>
              <textarea
                placeholder={isAr ? 'اكتب تفاصيل الإعلان وشروطه ومميزاته هنا...' : 'Describe specifications, options, policies here...'}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm p-4 outline-none focus:border-deumah-green-600 resize-none transition"
                required
              />
            </div>
          </div>

          {/* Section 5: Contact Preference */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider">
              📞 {isAr ? 'طرق التواصل المفضلة' : 'Contact Preferences'}
            </label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-deumah-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactCall}
                  onChange={e => setContactCall(e.target.checked)}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'اتصال هاتفي مباشر' : 'Direct Phone Calls'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-deumah-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactChat}
                  onChange={e => setContactChat(e.target.checked)}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'دردشة ديومة الداخلية' : 'Deumah Chat'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-deumah-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactWhatsApp}
                  onChange={e => setContactWhatsApp(e.target.checked)}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'رسائل واتساب' : 'WhatsApp Messages'}</span>
              </label>
            </div>
          </div>

          {/* Publish Action Button */}
          <button
            type="submit"
            className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3.5 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer"
          >
            {isAr ? 'انشر الإعلان الآن' : 'Publish Ad Now'}
          </button>

        </form>

      </main>

      {/* Success Notification Toast Popup */}
      {showToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs">✓</span>
          <span className="text-xs font-semibold">
            {isAr ? 'تم نشر إعلانك بنجاح وجارٍ المراجعة!' : 'Your listing has been posted successfully and is pending approval!'}
          </span>
        </div>
      )}

      <Footer />
    </div>
  );
}
