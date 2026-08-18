'use client';

import { useState, useEffect, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

interface PhotoItem {
  id: string;
  name: string;
  url: string;
}

function PostAdForm() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  // Basic Details State
  const [transactionType, setTransactionType] = useState<'rent' | 'sell'>(
    (searchParams.get('type') as 'rent' | 'sell') || 'sell'
  );
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'cars');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [globalPricingMethod, setGlobalPricingMethod] = useState('fixed');
  const [currency, setCurrency] = useState<'USD' | 'YER'>('USD');
  const [billingPeriod, setBillingPeriod] = useState('day');
  const [governorate, setGovernorate] = useState('sanaa_city');
  const [area, setArea] = useState('');

  // General Item Condition
  const [itemCondition, setItemCondition] = useState('good');

  // Contact Preference States
  const [contactCall, setContactCall] = useState(true);
  const [contactChat, setContactChat] = useState(true);
  const [contactWhatsApp, setContactWhatsApp] = useState(false);
  const [contactPhoneNum, setContactPhoneNum] = useState('');
  const [contactWhatsAppNum, setContactWhatsAppNum] = useState('');

  // Category Specific States
  // 1. Cars
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carTransmission, setCarTransmission] = useState('automatic');
  const [carFuel, setCarFuel] = useState('gasoline');
  const [carMileage, setCarMileage] = useState('');

  // 2. Properties
  const [propType, setPropType] = useState('apartment');
  const [propBedrooms, setPropBedrooms] = useState('');
  const [propBathrooms, setPropBathrooms] = useState('');
  const [propSize, setPropSize] = useState('');
  const [propFurnished, setPropFurnished] = useState('no');

  // 3. Wedding Halls
  const [hallCapacity, setHallCapacity] = useState('');
  const [hallSound, setHallSound] = useState('yes');
  const [hallAC, setHallAC] = useState('central');
  const [hallParking, setHallParking] = useState('yes');

  // 4. Chalets
  const [chaletCapacity, setChaletCapacity] = useState('');
  const [chaletBedrooms, setChaletBedrooms] = useState('');
  const [chaletPool, setChaletPool] = useState('yes');
  const [chaletOvernight, setChaletOvernight] = useState('yes');

  // 5. Electronics
  const [elecBrand, setElecBrand] = useState('');
  const [elecModel, setElecModel] = useState('');
  const [elecWarranty, setElecWarranty] = useState('no');

  // 6. Tools
  const [toolsBrand, setToolsBrand] = useState('');
  const [toolsModel, setToolsModel] = useState('');

  // 7. Services
  const [serviceType, setServiceType] = useState('maintenance');
  const [serviceArea, setServiceArea] = useState('');
  const [servicePricing, setServicePricing] = useState('fixed');

  // Media Mock States
  const [photosList, setPhotosList] = useState<PhotoItem[]>([]);
  const [videoFile, setVideoFile] = useState<{ name: string; size: string; url?: string } | null>(null);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');

  // Terms and Agreement Checkbox
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Overlay Screens
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<'pending' | 'approved'>('pending');

  // Validation / Error States
  const [errorMsg, setErrorMsg] = useState('');

  const editId = searchParams.get('edit');
  const [listingId, setListingId] = useState<string | null>(editId);

  // Load draft from Supabase if ?edit=id exists
  useEffect(() => {
    async function loadListing() {
      if (!editId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', editId)
        .eq('owner_id', user.id)
        .single();
        
      if (data) {
        setTitle(isAr ? data.title_ar : data.title_en || '');
        setDescription(isAr ? data.description_ar : data.description_en || '');
        setPrice(data.price?.toString() || '');
        setGlobalPricingMethod(data.specifications?.globalPricingMethod || 'fixed');
        setCategory(data.category || 'cars');
        setTransactionType(data.type || 'rent');
        setCurrency(data.currency || 'USD');
        setGovernorate(data.governorate || 'sanaa_city');
        setItemCondition(data.condition || 'good');
        
        if (data.images && Array.isArray(data.images)) {
          setPhotosList(data.images.map((url: string, i: number) => ({ id: `saved-${i}`, name: `Photo ${i+1}`, url })));
        }
        if (data.video_url) {
          setVideoFile({ name: 'Saved Video', size: 'unknown', url: data.video_url });
        }
        
        if (data.specifications) {
          const s = data.specifications;
          if (data.category === 'cars') {
            setCarBrand(s.brand || ''); setCarModel(s.model || ''); setCarYear(s.year || ''); setCarTransmission(s.transmission || 'automatic'); setCarFuel(s.fuel || 'gasoline'); setCarMileage(s.mileage || '');
          } else if (data.category === 'properties') {
            setPropType(s.type || 'apartment'); setPropBedrooms(s.bedrooms || ''); setPropBathrooms(s.bathrooms || ''); setPropSize(s.area || ''); setPropFurnished(s.furnished || 'no');
          } else if (data.category === 'wedding_halls') {
            setHallCapacity(s.capacity || ''); setHallSound(s.soundSystem || 'yes'); setHallAC(s.ac || 'central'); setHallParking(s.parking || 'yes');
          } else if (data.category === 'chalets') {
            setChaletCapacity(s.capacity || ''); setChaletBedrooms(s.bedrooms || ''); setChaletPool(s.pool || 'yes'); setChaletOvernight(s.overnight || 'yes');
          } else if (data.category === 'electronics') {
            setElecBrand(s.brand || ''); setElecModel(s.model || ''); setElecWarranty(s.warranty || 'no');
          } else if (data.category === 'tools') {
            setToolsBrand(s.brand || ''); setToolsModel(s.model || '');
          } else if (data.category === 'services') {
            setServiceType(s.type || 'maintenance'); setServiceArea(s.area || ''); setServicePricing(s.pricingMethod || 'fixed');
          }
          if (s.contact) {
            setContactCall(s.contact.call ?? true); setContactChat(s.contact.chat ?? true); setContactWhatsApp(s.contact.whatsapp ?? false);
            setContactPhoneNum(s.contact.phoneNumber || ''); setContactWhatsAppNum(s.contact.whatsappNumber || '');
          }
        }
      }
    }
    loadListing();
  }, [editId, isAr]);

  // Build Specs Helper
  const buildSpecs = () => {
    let specs: any = {};
    if (category === 'cars') specs = { brand: carBrand, model: carModel, year: carYear, transmission: carTransmission, fuel: carFuel, mileage: carMileage };
    else if (category === 'properties') specs = { type: propType, bedrooms: propBedrooms, bathrooms: propBathrooms, area: propSize, furnished: propFurnished };
    else if (category === 'wedding_halls') specs = { capacity: hallCapacity, soundSystem: hallSound, ac: hallAC, parking: hallParking };
    else if (category === 'chalets') specs = { capacity: chaletCapacity, bedrooms: chaletBedrooms, pool: chaletPool, overnight: chaletOvernight };
    else if (category === 'electronics') specs = { brand: elecBrand, model: elecModel, warranty: elecWarranty };
    else if (category === 'tools') specs = { brand: toolsBrand, model: toolsModel };
    else if (category === 'services') specs = { type: serviceType, area: serviceArea, pricingMethod: servicePricing };
    
    specs.globalPricingMethod = globalPricingMethod;
    specs.contact = { call: contactCall, chat: contactChat, whatsapp: contactWhatsApp, phoneNumber: contactPhoneNum, whatsappNumber: contactWhatsAppNum };
    return specs;
  };

  // Save Draft Functionality
  const handleSaveDraft = async () => {
    setUploadStatusMsg(isAr ? 'جاري حفظ المسودة...' : 'Saving draft...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg(isAr ? 'يرجى تسجيل الدخول أولاً' : 'Please sign in first');
        return;
      }

      const imageUrls = photosList.map(p => p.url);
      
      const payload = {
        owner_id: user.id,
        title_en: title || 'Draft Ad',
        title_ar: title || 'إعلان مسودة',
        description_en: description,
        description_ar: description,
        price: globalPricingMethod === 'contact' ? 0 : (Number(price) || 0),
        currency: currency,
        category: category,
        type: transactionType,
        governorate: governorate,
        images: imageUrls,
        video_url: videoFile?.url || null,
        specifications: buildSpecs(),
        condition: itemCondition,
        status: 'draft'
      };

      if (listingId) {
        const { error } = await supabase.from('listings').update(payload).eq('id', listingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('listings').insert(payload).select().single();
        if (error) throw error;
        if (data) setListingId(data.id);
      }
      
      setUploadStatusMsg('');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);
      alert(isAr ? 'تم حفظ الإعلان كمسودة بنجاح!' : 'Draft saved successfully!');
    } catch (err: any) {
      setUploadStatusMsg('');
      setErrorMsg(err.message || 'Error saving draft');
    }
  };

  // Handle Photo Upload with dynamic simulated progress & HEIC support
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    if (photosList.length + filesArray.length > 10) {
      setErrorMsg(isAr ? 'عذراً، الحد الأقصى هو ١٠ صور فقط!' : 'Sorry, the maximum limit is 10 photos!');
      return;
    }
    setErrorMsg('');
    setUploadProgress(0);
    setUploadStatusMsg(isAr ? 'جاري رفع الصور وضغطها تلقائياً...' : 'Uploading & compressing images automatically...');

    try {
      const uploadedPhotos: PhotoItem[] = [];
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath);

        uploadedPhotos.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          url: publicUrlData.publicUrl
        });

        setUploadProgress(Math.round(((i + 1) / filesArray.length) * 100));
      }

      setPhotosList(prev => [...prev, ...uploadedPhotos]);
      setUploadProgress(null);
      setUploadStatusMsg('');
    } catch (err: any) {
      setUploadProgress(null);
      setUploadStatusMsg('');
      let errMsg = err.message || (isAr ? 'حدث خطأ أثناء رفع الصور.' : 'An error occurred during file upload.');
      if (errMsg.toLowerCase().includes('exceeded the maximum allowed size')) {
        errMsg = isAr 
          ? 'حجم الملف يتجاوز الحد الأقصى المسموح به في إعدادات الخادم.' 
          : 'The file exceeded the maximum allowed size configured on the server.';
      }
      setErrorMsg(errMsg);
    }
  };

  // Photo reordering helpers
  const movePhotoLeft = (index: number) => {
    if (index === 0) return;
    setPhotosList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const movePhotoRight = (index: number) => {
    if (index === photosList.length - 1) return;
    setPhotosList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const makePhotoCover = (index: number) => {
    setPhotosList(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    setErrorMsg('');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotosList(prev => prev.filter(p => p.id !== id));
  };

  // Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 50) {
      setErrorMsg(isAr ? 'حجم الفيديو يتجاوز ٥٠ ميجابايت!' : 'Video size exceeds 50MB!');
      return;
    }
    setErrorMsg('');
    setUploadProgress(10);
    setUploadStatusMsg(isAr ? 'جاري ضغط ورفع مقطع الفيديو...' : 'Compressing & uploading video file...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath);

      setVideoFile({
        name: file.name,
        size: `${fileSizeMB.toFixed(1)} MB`,
        url: publicUrlData.publicUrl
      });
      setUploadProgress(null);
      setUploadStatusMsg('');
    } catch (err: any) {
      setUploadProgress(null);
      setUploadStatusMsg('');
      let errMsg = err.message || (isAr ? 'حدث خطأ أثناء رفع الفيديو.' : 'An error occurred during video upload.');
      if (errMsg.toLowerCase().includes('exceeded the maximum allowed size')) {
        errMsg = isAr 
          ? 'حجم مقطع الفيديو يتجاوز الحد الأقصى المسموح به في إعدادات الخادم.' 
          : 'The video exceeded the maximum allowed size configured on the server.';
      }
      setErrorMsg(errMsg);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
  };

  // Final Publish Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrice = globalPricingMethod === 'contact' ? 0 : (Number(price) || 0);
    if (!title.trim() || (globalPricingMethod === 'fixed' && !finalPrice) || !description.trim()) {
      setErrorMsg(isAr ? 'يرجى تعبئة كافة الحقول الأساسية!' : 'Please fill out all required basic fields!');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg(isAr ? 'يرجى الموافقة على شروط الاستخدام وقواعد النشر!' : 'Please agree to the Terms of Use and listing rules!');
      return;
    }

    setErrorMsg('');
    setUploadProgress(10);
    setUploadStatusMsg(isAr ? 'جاري نشر إعلانك على قاعدة البيانات...' : 'Publishing listing to database...');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Collect specs dynamically by category selection
      let specs: any = {};
      if (category === 'cars') {
        specs = { brand: carBrand, model: carModel, year: carYear, transmission: carTransmission, fuel: carFuel, mileage: carMileage };
      } else if (category === 'properties') {
        specs = { type: propType, bedrooms: propBedrooms, bathrooms: propBathrooms, area: propSize, furnished: propFurnished };
      } else if (category === 'wedding_halls') {
        specs = { capacity: hallCapacity, soundSystem: hallSound, ac: hallAC, parking: hallParking };
      } else if (category === 'chalets') {
        specs = { capacity: chaletCapacity, bedrooms: chaletBedrooms, pool: chaletPool, overnight: chaletOvernight };
      } else if (category === 'electronics') {
        specs = { brand: elecBrand, model: elecModel, warranty: elecWarranty };
      } else if (category === 'tools') {
        specs = { brand: toolsBrand, model: toolsModel };
      } else if (category === 'services') {
        specs = { type: serviceType, area: serviceArea, pricingMethod: servicePricing };
      }

      specs.globalPricingMethod = globalPricingMethod;
      specs.contact = {
        call: contactCall,
        chat: contactChat,
        whatsapp: contactWhatsApp,
        phoneNumber: contactPhoneNum,
        whatsappNumber: contactWhatsAppNum
      };

      const imageUrls = photosList.map(p => p.url);

      const payload = {
        owner_id: user?.id,
        title_en: title,
        title_ar: title,
        description_en: description,
        description_ar: description,
        price: globalPricingMethod === 'contact' ? 0 : (Number(price) || 0),
        currency: currency,
        category: category,
        type: transactionType,
        governorate: governorate,
        images: imageUrls,
        video_url: videoFile?.url || null,
        specifications: specs,
        condition: itemCondition,
        status: 'pending'
      };

      if (listingId) {
        const { error } = await supabase
          .from('listings')
          .update(payload)
          .eq('id', listingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('listings')
          .insert(payload);
        if (error) throw error;
      }

      setUploadProgress(null);
      setUploadStatusMsg('');
      setModerationStatus('approved');
      setShowSuccessModal(true);
    } catch (err: any) {
      setUploadProgress(null);
      setUploadStatusMsg('');
      setErrorMsg(err.message || (isAr ? 'حدث خطأ أثناء حفظ الإعلان.' : 'An error occurred during submission.'));
    }
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-deumah-navy-950 tracking-tight font-heading">
              {isAr ? 'انشر إعلاناً جديداً' : 'Post a New Ad'}
            </h1>
            <p className="text-sm text-deumah-gray-500 mt-1 font-medium">
              {isAr ? 'املأ التفاصيل لتبدأ في الوصول لآلاف المهتمين في اليمن' : 'Fill out details to start reaching thousands of buyers in Yemen'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="self-start sm:self-center px-4 py-2 border border-deumah-gray-300 text-deumah-gray-700 bg-white rounded-deumah-sm text-xs font-bold shadow-sm hover:bg-deumah-gray-50 transition"
          >
            💾 {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
          </button>
        </div>

        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="bg-white rounded-deumah border border-deumah-gray-200 p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3.5 rounded-deumah-sm flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Upload Progress Loader */}
          {uploadProgress !== null && (
            <div className="bg-deumah-green-50 border border-deumah-green-200 p-4 rounded-deumah space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-deumah-green-800">
                <span>{uploadStatusMsg}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-deumah-green-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-deumah-green-700 h-full transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Section 1: Transaction & Category */}
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
                <option value="electronics">{isAr ? '📱 إلكترونيات' : '📱 Electronics'}</option>
                <option value="furniture">{isAr ? '🛋️ أثاث' : '🛋️ Furniture'}</option>
                <option value="services">{isAr ? '🔧 خدمات' : '🔧 Services'}</option>
                <option value="tools">{isAr ? '🛠️ أدوات ومعدات' : '🛠️ Tools'}</option>
                <option value="fashion">{isAr ? '👕 أزياء وموضة' : '👕 Fashion'}</option>
                <option value="kids">{isAr ? '🧸 مستلزمات أطفال' : '🧸 Kids & Babies'}</option>
                <option value="hobbies">{isAr ? '🎨 هوايات' : '🎨 Hobbies'}</option>
                <option value="wedding_halls">{isAr ? '💍 قاعات أفراح' : '💍 Wedding Halls'}</option>
                <option value="chalets">{isAr ? '🏡 شاليهات' : '🏡 Chalets'}</option>
              </select>
            </div>
          </div>

          {/* Section 2: Dynamic Category Specific Details */}
          <div className="bg-deumah-gray-50/50 p-5 rounded-deumah border border-deumah-gray-200/60 space-y-4">
            <h3 className="text-xs font-bold text-deumah-navy-950 uppercase tracking-wider">
              ⚙️ {isAr ? 'مواصفات الإعلان' : 'Category Details'}
            </h3>

            {/* CARS */}
            {category === 'cars' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الشركة المصنعة' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={carBrand}
                    onChange={e => setCarBrand(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Land Cruiser"
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
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'المسافة المقطوعة (كم)' : 'Mileage (km)'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={carMileage}
                    onChange={e => setCarMileage(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
              </div>
            )}

            {/* PROPERTIES */}
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
                    <option value="furnished_apartment">{isAr ? 'شقة مفروشة' : 'Furnished Apartment'}</option>
                    <option value="house">{isAr ? 'بيت' : 'House'}</option>
                    <option value="villa">{isAr ? 'فيلا' : 'Villa'}</option>
                    <option value="building">{isAr ? 'عمارة' : 'Building'}</option>
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
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'المساحة (متر مربع)' : 'Area (sqm)'}</label>
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

            {/* WEDDING HALLS */}
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
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'مواقف سيارات' : 'Parking'}</label>
                  <select
                    value={hallParking}
                    onChange={e => setHallParking(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نظام صوتي' : 'Sound System'}</label>
                  <select
                    value={hallSound}
                    onChange={e => setHallSound(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نظام التكييف' : 'Air Conditioning'}</label>
                  <select
                    value={hallAC}
                    onChange={e => setHallAC(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="central">{isAr ? 'مركزي' : 'Central'}</option>
                    <option value="split">{isAr ? 'سبليت' : 'Split'}</option>
                    <option value="none">{isAr ? 'بدون تكييف' : 'None'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* CHALETS */}
            {category === 'chalets' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'السعة (أشخاص)' : 'Capacity (guests)'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={chaletCapacity}
                    onChange={e => setChaletCapacity(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'عدد الغرف' : 'Bedrooms'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={chaletBedrooms}
                    onChange={e => setChaletBedrooms(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
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
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'إمكانية المبيت' : 'Overnight Availability'}</label>
                  <select
                    value={chaletOvernight}
                    onChange={e => setChaletOvernight(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                    <option value="no">{isAr ? 'لا' : 'No'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* ELECTRONICS */}
            {category === 'electronics' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الشركة المصنعة' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple"
                    value={elecBrand}
                    onChange={e => setElecBrand(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro"
                    value={elecModel}
                    onChange={e => setElecModel(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الضمان' : 'Warranty'}</label>
                  <select
                    value={elecWarranty}
                    onChange={e => setElecWarranty(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="no">{isAr ? 'بدون ضمان' : 'No'}</option>
                    <option value="yes">{isAr ? 'متوفر' : 'Yes'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* TOOLS */}
            {category === 'tools' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الشركة المصنعة' : 'Brand'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Bosch"
                    value={toolsBrand}
                    onChange={e => setToolsBrand(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'الموديل' : 'Model'}</label>
                  <input
                    type="text"
                    placeholder="e.g. GSB 18V-55"
                    value={toolsModel}
                    onChange={e => setToolsModel(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
              </div>
            )}

            {/* SERVICES */}
            {category === 'services' && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نوع الخدمة' : 'Service Type'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Cleaning, Maintenance"
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'نطاق الخدمة' : 'Service Area'}</label>
                  <input
                    type="text"
                    placeholder="e.g. Sana'a City"
                    value={serviceArea}
                    onChange={e => setServiceArea(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-deumah-gray-500 mb-1.5">{isAr ? 'طريقة احتساب السعر' : 'Pricing Method'}</label>
                  <select
                    value={servicePricing}
                    onChange={e => setServicePricing(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  >
                    <option value="fixed">{isAr ? 'سعر ثابت' : 'Fixed Price'}</option>
                    <option value="hourly">{isAr ? 'بالساعة' : 'Hourly'}</option>
                    <option value="daily">{isAr ? 'باليوم' : 'Daily'}</option>
                    <option value="negotiable">{isAr ? 'حسب الاتفاق' : 'Negotiable'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Condition Field (Applicable for Cars, Electronics, Tools) */}
            {(category === 'cars' || category === 'electronics' || category === 'tools') && (
              <div className="pt-2 border-t border-deumah-gray-200/50">
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">
                  ✨ {isAr ? 'حالة السلعة' : 'Item Condition'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['new', 'like_new', 'good', 'fair'].map((cond) => {
                    const labelMap: Record<string, { en: string; ar: string }> = {
                      new: { en: 'New', ar: 'جديد' },
                      like_new: { en: 'Like New', ar: 'شبه جديد' },
                      good: { en: 'Good', ar: 'جيد' },
                      fair: { en: 'Fair', ar: 'مقبول' }
                    };
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setItemCondition(cond)}
                        className={`py-2 rounded-deumah-sm font-bold text-xs border text-center transition ${
                          itemCondition === cond
                            ? 'bg-deumah-green-700 text-white border-deumah-green-700 shadow-sm'
                            : 'bg-white text-deumah-gray-700 border-deumah-gray-200 hover:border-deumah-gray-300'
                        }`}
                      >
                        {isAr ? labelMap[cond].ar : labelMap[cond].en}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Media File Uploader */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">
                📸 {isAr ? 'معرض الصور والفيديو (الحد الأقصى ١٠ صور وفيديو واحد)' : 'Photo & Video Gallery (Max 10 photos & 1 video)'}
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Photo Dropzone */}
                <div className="border-2 border-dashed border-deumah-gray-200 rounded-deumah p-6 text-center hover:border-deumah-green-700 transition relative cursor-pointer flex flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg className="size-8 text-deumah-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-bold text-deumah-navy-950">{isAr ? 'اضغط لرفع الصور' : 'Click to Upload Photos'}</p>
                  <p className="text-[10px] text-deumah-gray-400 mt-1">{isAr ? 'تنسيق JPG, PNG, HEIC حتى ١٠ صور' : 'Formats: JPG, PNG, HEIC (Max 10)'}</p>
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
                  <p className="text-[10px] text-deumah-gray-400 mt-1">{isAr ? '(اختياري) الحد الأقصى 50 ميجابايت' : 'Optional (Max 50MB)'}</p>
                </div>
              </div>
            </div>

            {/* Uploaded Gallery Grid with reordering and cover indicator */}
            {(photosList.length > 0 || videoFile) && (
              <div className="bg-deumah-gray-50 border border-deumah-gray-200 rounded-deumah p-4 space-y-3">
                <p className="text-[11px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                  {isAr ? 'معرض المرفقات' : 'Attachments Gallery'}
                </p>
                
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {/* Photo tiles */}
                  {photosList.map((photo, index) => {
                    const isCover = index === 0;
                    return (
                      <div 
                        key={photo.id} 
                        className={`relative rounded border overflow-hidden bg-white shadow-sm flex flex-col group transition ${
                          isCover ? 'border-deumah-green-700 ring-2 ring-deumah-green-700/20' : 'border-deumah-gray-200'
                        }`}
                      >
                        {/* Image view */}
                        <div className="relative aspect-video bg-deumah-gray-100 flex-1">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          {isCover && (
                            <span className="absolute top-2 left-2 bg-deumah-green-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                              ★ {isAr ? 'الصورة الرئيسية' : 'Cover Image'}
                            </span>
                          )}
                        </div>

                        {/* Controls Toolbar */}
                        <div className="bg-white p-2 border-t border-deumah-gray-100 flex items-center justify-between gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="text-red-600 font-bold hover:text-red-800 transition"
                          >
                            🗑️ {isAr ? 'حذف' : 'Delete'}
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => movePhotoLeft(index)}
                              className="px-1.5 py-0.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 disabled:opacity-30 disabled:pointer-events-none"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              disabled={index === photosList.length - 1}
                              onClick={() => movePhotoRight(index)}
                            >
                              ▶
                            </button>
                            {!isCover && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  makePhotoCover(index);
                                }}
                                className="px-2 py-0.5 border border-deumah-green-700 bg-deumah-green-50 text-deumah-green-700 rounded font-extrabold hover:bg-deumah-green-700 hover:text-white transition cursor-pointer"
                              >
                                {isAr ? 'تعيين كغلاف' : 'Make Cover'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Video Tile */}
                  {videoFile && (
                    <div className="relative aspect-video rounded border border-deumah-gray-200 p-3.5 bg-deumah-navy-950 text-white flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">🎥</span>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full size-5 flex items-center justify-center text-xs font-bold transition shadow"
                        >
                          ✕
                        </button>
                      </div>
                      <div>
                        <div className="truncate text-xs font-semibold text-white/90">{videoFile.name}</div>
                        <div className="text-[10px] text-white/50">{videoFile.size}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Basic Info */}
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
              {/* Pricing Method */}
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'طريقة السعر' : 'Pricing Method'}
                </label>
                <select
                  value={globalPricingMethod}
                  onChange={e => setGlobalPricingMethod(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-3 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold"
                >
                  <option value="fixed">{isAr ? 'سعر ثابت' : 'Fixed Price'}</option>
                  <option value="negotiable">{isAr ? 'قابل للتفاوض' : 'Negotiable'}</option>
                  <option value="contact">{isAr ? 'تواصل لمعرفة السعر' : 'Contact for Price'}</option>
                </select>
              </div>

              {/* Price */}
              {globalPricingMethod !== 'contact' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                    {isAr ? 'السعر' : 'Price'} {globalPricingMethod === 'fixed' ? '*' : (isAr ? '(اختياري)' : '(Optional)')}
                  </label>
                  <input
                    type="number"
                    placeholder={globalPricingMethod === 'fixed' ? "e.g. 150" : ""}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                    required={globalPricingMethod === 'fixed'}
                  />
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'العملة' : 'Currency'}
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-3 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold"
                >
                  <option value="USD">{isAr ? 'دولار أمريكي' : 'USD ($)'}</option>
                  <option value="YER">{isAr ? 'ريال يمني' : 'YER'}</option>
                  <option value="SAR">{isAr ? 'ريال سعودي' : 'SAR'}</option>
                </select>
              </div>

              {/* Billing Period (Only if Rent selected) */}
              {transactionType === 'rent' && (
                <div>
                  <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                    {isAr ? 'فترة الدفع' : 'Billing Period'}
                  </label>
                  <select
                    value={billingPeriod}
                    onChange={e => setBillingPeriod(e.target.value)}
                    className="w-full text-sm border rounded-deumah-sm px-3 py-3 outline-none transition cursor-pointer font-semibold bg-white border-deumah-gray-200 focus:border-deumah-green-600"
                  >
                    <option value="none">{isAr ? 'لا ينطبق' : 'Not Applicable'}</option>
                    <option value="hour">{isAr ? 'لكل ساعة' : 'Per Hour'}</option>
                    <option value="day">{isAr ? 'لكل يوم' : 'Per Day'}</option>
                    <option value="week">{isAr ? 'لكل أسبوع' : 'Per Week'}</option>
                    <option value="month">{isAr ? 'لكل شهر' : 'Per Month'}</option>
                    <option value="year">{isAr ? 'لكل سنة' : 'Per Year'}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Governorates */}
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'المحافظة' : 'Governorate'} *
                </label>
                <select
                  value={governorate}
                  onChange={e => setGovernorate(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-3 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold"
                >
                  <option value="sanaa_city">{isAr ? 'أمانة العاصمة' : "Sana'a City"}</option>
                  <option value="sanaa">{isAr ? 'صنعاء' : 'Sana\'a'}</option>
                  <option value="aden">{isAr ? 'عدن' : 'Aden'}</option>
                  <option value="taiz">{isAr ? 'تعز' : 'Taiz'}</option>
                  <option value="hadhramaut">{isAr ? 'حضرموت' : 'Hadhramaut'}</option>
                  <option value="al_hudaydah">{isAr ? 'الحديدة' : 'Al Hudaydah'}</option>
                  <option value="ibb">{isAr ? 'إب' : 'Ibb'}</option>
                  <option value="amran">{isAr ? 'عمران' : 'Amran'}</option>
                  <option value="dhamar">{isAr ? 'ذمار' : 'Dhamar'}</option>
                  <option value="al_jawf">{isAr ? 'الجوف' : 'Al Jawf'}</option>
                  <option value="hajjah">{isAr ? 'حجة' : 'Hajjah'}</option>
                  <option value="shabwah">{isAr ? 'شبوة' : 'Shabwah'}</option>
                  <option value="marib">{isAr ? 'مأرب' : 'Marib'}</option>
                  <option value="al_bayda">{isAr ? 'البيضاء' : 'Al Bayda'}</option>
                  <option value="saadah">{isAr ? 'صعدة' : 'Saadah'}</option>
                  <option value="al_mahrah">{isAr ? 'المهرة' : 'Al Mahrah'}</option>
                  <option value="abyan">{isAr ? 'أبين' : 'Abyan'}</option>
                  <option value="lahij">{isAr ? 'لحج' : 'Lahij'}</option>
                  <option value="al_dhale">{isAr ? 'الضالع' : 'Al Dhale'}</option>
                  <option value="al_mahwit">{isAr ? 'المحويت' : 'Al Mahwit'}</option>
                  <option value="raymah">{isAr ? 'ريمة' : 'Raymah'}</option>
                  <option value="socotra">{isAr ? 'سقطرى' : 'Socotra'}</option>
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'المديرية / المنطقة' : 'District / Area'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hadda"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'الوصف التفصيلي' : 'Detailed Description'} *
              </label>
              <textarea
                placeholder={isAr ? 'اكتب شروط ومميزات وتفاصيل الإعلان هنا...' : 'Describe specifications, conditions, and highlights here...'}
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
                <span>{isAr ? 'اتصال مباشر' : 'Direct Call'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-deumah-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactChat}
                  onChange={e => setContactChat(e.target.checked)}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'دردشة دومه الداخلية' : 'Deumah Chat'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-deumah-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactWhatsApp}
                  onChange={e => setContactWhatsApp(e.target.checked)}
                  className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                />
                <span>{isAr ? 'رسائل واتساب' : 'WhatsApp Message'}</span>
              </label>
            </div>
            
            {/* Conditional Phone Inputs */}
            {(contactCall || contactWhatsApp) && (
              <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-4 border-t border-deumah-gray-100">
                {contactCall && (
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'رقم الاتصال المباشر' : 'Direct Call Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder={isAr ? 'مثال: 777123456' : 'e.g. 777123456'}
                      value={contactPhoneNum}
                      onChange={e => setContactPhoneNum(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                    />
                  </div>
                )}
                {contactWhatsApp && (
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'رقم الواتساب' : 'WhatsApp Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder={isAr ? 'مثال: 967777123456' : 'e.g. 967777123456'}
                      value={contactWhatsAppNum}
                      onChange={e => setContactWhatsAppNum(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-3 outline-none focus:border-deumah-green-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Terms & Agreement Checkbox */}
          <div className="bg-deumah-gray-50 p-4 rounded-deumah border border-deumah-gray-200/50">
            <label className="flex items-start gap-3 cursor-pointer text-xs font-semibold text-deumah-gray-700">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
              />
              <span>
                {isAr 
                  ? 'أوافق على اتفاقية شروط الاستخدام، سياسة الخصوصية وقواعد النشر الخاصة بمنصة دومه.' 
                  : 'I agree to the Terms of Use, Privacy Policy, and listing rules of the Deumah platform.'}
              </span>
            </label>
          </div>

          {/* Action buttons (Save Draft, Preview & Publish) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="sm:w-1/3 bg-white hover:bg-deumah-gray-50 text-deumah-gray-700 border border-deumah-gray-300 font-bold py-3.5 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer text-center text-xs sm:text-sm"
            >
              💾 {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="sm:w-1/3 bg-white hover:bg-deumah-gray-50 text-deumah-navy-950 border border-deumah-gray-300 font-bold py-3.5 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer text-center text-xs sm:text-sm"
            >
              👁️ {isAr ? 'معاينة الإعلان' : 'Preview Ad'}
            </button>
            <button
              type="submit"
              className="sm:w-1/3 bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3.5 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer text-center text-xs sm:text-sm"
            >
              🚀 {isAr ? 'انشر الإعلان الآن' : 'Publish Ad Now'}
            </button>
          </div>

        </form>

      </main>

      {/* 1. AD PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-deumah max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-deumah-gray-200 flex flex-col justify-between">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-deumah-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="font-extrabold text-sm text-deumah-navy-950 uppercase tracking-wider">
                👁️ {isAr ? 'معاينة الإعلان قبل النشر' : 'Preview Ad Before Publishing'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-deumah-gray-400 hover:text-deumah-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Preview Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Photo cover preview */}
              <div className="aspect-video w-full rounded border border-deumah-gray-200 overflow-hidden bg-deumah-gray-50 relative">
                {photosList.length > 0 ? (
                  <img src={photosList[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-deumah-gray-400 text-xs font-semibold">
                    <span>📸 {isAr ? 'لا يوجد صور مرفوعة حالياً' : 'No photos uploaded yet'}</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-deumah-green-700 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {transactionType === 'rent' ? (isAr ? 'تأجير' : 'Rent') : (isAr ? 'بيع' : 'Sell')}
                </span>
              </div>

              {/* Title & Price */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xl font-bold text-deumah-navy-950 font-heading">
                    {title || (isAr ? 'عنوان تجريبي للإعلان' : 'Draft Ad Title')}
                  </h4>
                  <p className="text-xs font-medium text-deumah-gray-500 mt-1">
                    📍 {isAr ? (
                      `${governorate === 'sanaa_city' ? 'أمانة العاصمة' : governorate === 'sanaa' ? 'صنعاء' : governorate === 'aden' ? 'عدن' : governorate === 'taiz' ? 'تعز' : governorate === 'hadhramaut' ? 'حضرموت' : governorate === 'al_hudaydah' ? 'الحديدة' : governorate === 'ibb' ? 'إب' : governorate === 'amran' ? 'عمران' : governorate === 'dhamar' ? 'ذمار' : governorate === 'al_jawf' ? 'الجوف' : governorate === 'hajjah' ? 'حجة' : governorate === 'shabwah' ? 'شبوة' : governorate === 'marib' ? 'مأرب' : governorate === 'al_bayda' ? 'البيضاء' : governorate === 'saadah' ? 'صعدة' : governorate === 'al_mahrah' ? 'المهرة' : governorate === 'abyan' ? 'أبين' : governorate === 'lahij' ? 'لحج' : governorate === 'al_dhale' ? 'الضالع' : governorate === 'al_mahwit' ? 'المحويت' : governorate === 'raymah' ? 'ريمة' : governorate === 'socotra' ? 'سقطرى' : governorate} ${area ? `• ${area}` : ''}`
                    ) : (
                      `${governorate === 'sanaa_city' ? "Sana'a City" : governorate === 'sanaa' ? "Sana'a" : governorate === 'aden' ? 'Aden' : governorate === 'taiz' ? 'Taiz' : governorate === 'hadhramaut' ? 'Hadhramaut' : governorate === 'al_hudaydah' ? 'Al Hudaydah' : governorate === 'ibb' ? 'Ibb' : governorate === 'amran' ? 'Amran' : governorate === 'dhamar' ? 'Dhamar' : governorate === 'al_jawf' ? 'Al Jawf' : governorate === 'hajjah' ? 'Hajjah' : governorate === 'shabwah' ? 'Shabwah' : governorate === 'marib' ? 'Marib' : governorate === 'al_bayda' ? 'Al Bayda' : governorate === 'saadah' ? 'Saadah' : governorate === 'al_mahrah' ? 'Al Mahrah' : governorate === 'abyan' ? 'Abyan' : governorate === 'lahij' ? 'Lahij' : governorate === 'al_dhale' ? 'Al Dhale' : governorate === 'al_mahwit' ? 'Al Mahwit' : governorate === 'raymah' ? 'Raymah' : governorate === 'socotra' ? 'Socotra' : governorate} ${area ? `• ${area}` : ''}`
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-deumah-green-700">
                    {currency === 'USD' ? '$' : 'YER '}{price ? Number(price).toLocaleString() : '0'}
                  </span>
                  {transactionType === 'rent' && (
                    <span className="text-[10px] text-deumah-gray-500 font-bold block mt-0.5">
                      / {billingPeriod === 'day' ? (isAr ? 'يوم' : 'Day') : (isAr ? 'شهر' : 'Month')}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Specs table based on selected category */}
              <div className="bg-deumah-gray-50 p-4 rounded-deumah border border-deumah-gray-200/50">
                <h5 className="text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider mb-2.5">
                  📋 {isAr ? 'تفاصيل ومواصفات السلعة' : 'Specifications & Details'}
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-deumah-gray-500 block">{isAr ? 'الفئة' : 'Category'}</span>
                    <strong className="text-deumah-navy-950 uppercase">{category}</strong>
                  </div>
                  <div>
                    <span className="text-deumah-gray-500 block">{isAr ? 'الحالة' : 'Condition'}</span>
                    <strong className="text-deumah-navy-950 uppercase">{itemCondition}</strong>
                  </div>
                  
                  {category === 'cars' && (
                    <>
                      <div>
                        <span className="text-deumah-gray-500 block">{isAr ? 'الماركة' : 'Brand'}</span>
                        <strong className="text-deumah-navy-950">{carBrand || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-deumah-gray-500 block">{isAr ? 'الموديل' : 'Model'}</span>
                        <strong className="text-deumah-navy-950">{carModel || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-deumah-gray-500 block">{isAr ? 'سنة الصنع' : 'Year'}</span>
                        <strong className="text-deumah-navy-950">{carYear || '-'}</strong>
                      </div>
                    </>
                  )}
                  
                  {category === 'properties' && (
                    <>
                      <div>
                        <span className="text-deumah-gray-500 block">{isAr ? 'النوع' : 'Property Type'}</span>
                        <strong className="text-deumah-navy-950">{propType || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-deumah-gray-500 block">{isAr ? 'مفروش' : 'Furnished'}</span>
                        <strong className="text-deumah-navy-950">{propFurnished || '-'}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider">
                  📝 {isAr ? 'الوصف' : 'Description'}
                </h5>
                <p className="text-xs text-deumah-gray-700 leading-relaxed whitespace-pre-line">
                  {description || (isAr ? 'لا يوجد وصف حالياً...' : 'No description provided...')}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-deumah-gray-50 border-t border-deumah-gray-100 p-4 text-right">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 bg-deumah-navy-950 hover:bg-deumah-navy-900 text-white font-bold text-xs rounded-deumah transition shadow-sm"
              >
                {isAr ? 'رجوع لتعديل الإعلان' : 'Back to Editing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS PUBLISHED DIALOG & MODERATION STATUS */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-deumah max-w-md w-full p-6 text-center shadow-2xl relative border border-deumah-gray-200 space-y-4">
            
            <div className="mx-auto w-12 h-12 bg-deumah-green-50 rounded-full flex items-center justify-center text-deumah-green-700 text-xl font-bold">
              ✓
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-deumah-navy-950 font-heading">
                {isAr ? 'تم إرسال إعلانك للمراجعة!' : 'Ad Submitted for Review!'}
              </h3>
              <p className="text-xs text-deumah-gray-500">
                {isAr 
                  ? 'تم تسجيل إعلانك بنجاح في قاعدة البيانات وهو قيد المراجعة حالياً من قبل الإشراف.' 
                  : 'Your ad has been successfully registered and is undergoing safety audit checks.'}
              </p>
            </div>

            {/* Moderation Status Widget card */}
            <div className="bg-deumah-gray-50 border border-deumah-gray-200/60 rounded-deumah p-3 flex justify-between items-center text-xs font-semibold">
              <span className="text-deumah-gray-500">{isAr ? 'حالة المراجعة' : 'Moderation Status'}</span>
              <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                ⏳ {isAr ? 'قيد المراجعة' : 'Pending Review'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/listings');
              }}
              className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-2.5 rounded-deumah text-xs transition shadow-sm"
            >
              {isAr ? 'انتقل إلى صفحة الإعلانات' : 'Go to Listings Directory'}
            </button>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function PostAdPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-deumah-gray-50 flex items-center justify-center">Loading...</div>}>
      <PostAdForm />
    </Suspense>
  );
}
