'use client';
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { arSA } from 'date-fns/locale';

registerLocale('ar', arSA);
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

import { ListingItem } from '@/data/listings';

const toArabicNumerals = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, w => arabicDigits[+w]);
};

const formatPriceWithCurrency = (price: number | string, currency: string | undefined, isAr: boolean): string => {
  const numWithCommas = Number(price).toLocaleString('en-US');
  const numPrice = isAr ? toArabicNumerals(numWithCommas) : numWithCommas;
  const curr = (currency || 'USD').toUpperCase().trim();
  if (curr === 'YER') return isAr ? `${numPrice} ريال يمني` : `${numPrice} YER`;
  if (curr === 'SAR') return isAr ? `${numPrice} ريال سعودي` : `${numPrice} SAR`;
  return isAr ? `${numPrice} دولار` : `$${numPrice}`;
};

interface ClientProps {
  item: ListingItem;
  locale: string;
}

export function ListingDetailsClient({ item, locale }: ClientProps) {
  const isAr = locale === 'ar';
  const t = useTranslations('DetailsPage');
  const listT = useTranslations('Listings');

  // Media selection state
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Message Form state
  const [messageText, setMessageText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showChatForm, setShowChatForm] = useState(false);

  // Offer Form State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState(item.price.toString());
  const [offerMessage, setOfferMessage] = useState('');
  const [offerToast, setOfferToast] = useState(false);

  const contact = (item.owner as any)?.contact || { chat: true };

  const [isSaved, setIsSaved] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let active = true;

    // Increment Views
    supabase.rpc('increment_listing_views', { listing_id: item.id }).then(({ error }) => {
      if (error) console.error(error);
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && user) {
        setCurrentUser(user);
        
        // Check if saved
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', item.id)
          .single()
          .then(({ data }) => {
            if (data && active) setIsSaved(true);
          });
          
        // Check blocks
        const ownerId = (item as any).owner_id || (item as any).ownerId;
        if (ownerId) {
          supabase.from('user_blocks').select('id')
            .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${ownerId}),and(blocker_id.eq.${ownerId},blocked_id.eq.${user.id})`)
            .then(({ data }) => {
              if (data && data.length > 0 && active) setIsBlocked(true);
            });
        }
      }
    });

    return () => { active = false; };
  }, [item.id]);

  const handleToggleSave = async () => {
    if (!currentUser) return alert(isAr ? 'يرجى تسجيل الدخول' : 'Please log in first');
    try {
      if (isSaved) {
        setIsSaved(false);
        const { error } = await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('listing_id', item.id);
        if (error) {
          setIsSaved(true);
          throw error;
        }
      } else {
        setIsSaved(true);
        const { error } = await supabase.from('favorites').insert({ user_id: currentUser.id, listing_id: item.id });
        if (error) {
          setIsSaved(false);
          throw error;
        }
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error saving listing');
    }
  };

  const isOwner = currentUser && (currentUser.id === (item as any).ownerId || currentUser.id === (item as any).owner_id);

  // Booking Calendar Scheduler state (for Rent items)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Calculate rental cost dynamically in real-time
  const rentalDetails = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = startDate;
    const end = endDate;
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff <= 0) return null;

    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalCost = daysCount * item.price;
    return { daysCount, totalCost };
  }, [startDate, endDate, item.price]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      if (currentUser) {
        const { error } = await supabase.from('messages').insert({
          listing_id: item.id,
          sender_id: currentUser.id,
          receiver_id: (item as any).owner_id || (item as any).ownerId || null,
          message: messageText
        });

        if (error) {
          alert(`Database Error: ${error.message}`);
          throw error;
        }
      }
    } catch (err) {
      console.error('Message error:', err);
      return; // Stop here if there's an error
    }
    
    setShowToast(true);
    setMessageText('');
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) return;

    if (!currentUser) {
      alert(isAr ? 'يجب تسجيل الدخول لتقديم عرض' : 'You must be logged in to make an offer');
      return;
    }

    try {
      const { error } = await supabase.from('offers').insert({
        listing_id: item.id,
        buyer_id: currentUser.id,
        seller_id: (item as any).owner_id || (item as any).ownerId,
        amount: amount,
        message: offerMessage
      });

      if (error) throw error;
      
      // Send notification to the seller
      const sellerId = (item as any).owner_id || (item as any).ownerId;
      if (sellerId) {
        const formattedAmountAr = formatPriceWithCurrency(amount, (item as any).currency, true);
        const formattedAmountEn = formatPriceWithCurrency(amount, (item as any).currency, false);
        await supabase.from('notifications').insert({
          user_id: sellerId,
          type: 'offer',
          title_en: 'New Offer Received!',
          title_ar: 'تم تلقي عرض جديد!',
          message_en: `You received a new offer of ${formattedAmountEn} for your listing.`,
          message_ar: `لقد تلقيت عرضاً جديداً بقيمة ${formattedAmountAr} لإعلانك.`,
          listing_id: item.id,
          read: false
        });
      }
      
      setOfferToast(true);
      setShowOfferModal(false);
      setTimeout(() => setOfferToast(false), 3000);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex justify-between items-center">
          <Link 
            href="/listings" 
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-deumah-green-700 hover:text-deumah-green-600 transition"
          >
            <svg className="size-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </Link>

          <button 
            onClick={handleToggleSave}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition font-bold text-sm shadow-sm ${
              isSaved 
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                : 'bg-white text-deumah-gray-500 border-deumah-gray-200 hover:bg-deumah-gray-50'
            }`}
          >
            {isSaved ? '❤️' : '🤍'} {isSaved ? (isAr ? 'تم الحفظ' : 'Saved') : (isAr ? 'حفظ' : 'Save')}
          </button>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          {/* Left Column: Media & Product Info */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Premium Media Gallery Container */}
            <div className="bg-white rounded-deumah border border-deumah-gray-200 overflow-hidden shadow-sm">
              
              {/* Media Display Area */}
              <div className="relative aspect-video bg-deumah-navy-950 flex items-center justify-center">
                {activeMediaTab === 'photos' ? (
                  <img
                    src={item.images[activePhotoIdx]}
                    alt={isAr ? item.titleAr : item.titleEn}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                    onClick={() => setIsGalleryOpen(true)}
                  />
                ) : (
                  item.video && (
                    <video 
                      src={item.video} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    />
                  )
                )}

                {/* Tags on Card */}
                {item.verified && (
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-deumah-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    ✓ {t('verifiedSeller')}
                  </span>
                )}
              </div>

              {/* Media Selection Tabs */}
              <div className="border-t border-deumah-gray-200 px-4 py-3 bg-deumah-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveMediaTab('photos')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                      activeMediaTab === 'photos'
                        ? 'bg-deumah-green-700 text-white'
                        : 'bg-white text-deumah-gray-700 border border-deumah-gray-200 hover:border-deumah-gray-300'
                    }`}
                  >
                    📷 {t('photos')} ({item.images.length})
                  </button>

                  {item.video && (
                    <button
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        activeMediaTab === 'video'
                          ? 'bg-deumah-green-700 text-white'
                          : 'bg-white text-deumah-gray-700 border border-deumah-gray-200 hover:border-deumah-gray-300'
                      }`}
                    >
                      🎥 {t('video')}
                    </button>
                  )}
                </div>

                <div className="text-xs text-deumah-gray-500 font-semibold">
                  {activeMediaTab === 'photos' 
                    ? `${isAr ? toArabicNumerals(activePhotoIdx + 1) : activePhotoIdx + 1} / ${isAr ? toArabicNumerals(item.images.length) : item.images.length}`
                    : t('viewVideo')}
                </div>
              </div>

              {/* Photo Slider Thumbnails */}
              {activeMediaTab === 'photos' && (
                <div className="p-4 flex gap-2.5 overflow-x-auto border-t border-deumah-gray-100 bg-white">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative size-20 rounded-deumah-sm overflow-hidden shrink-0 border-2 transition ${
                        activePhotoIdx === idx 
                          ? 'border-deumah-green-700' 
                          : 'border-transparent hover:border-deumah-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title, Prices, Description */}
            <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-deumah-navy-950 sm:text-3xl font-heading">
                    {isAr ? item.titleAr : item.titleEn}
                  </h1>
                  <p className="mt-1.5 text-sm text-deumah-gray-500 font-medium">
                    📍 {isAr ? item.locationAr : item.locationEn}
                  </p>
                </div>

                <div className="text-start sm:text-end shrink-0">
                  <div className="text-3xl font-extrabold text-deumah-green-700">
                    {formatPriceWithCurrency(item.price, (item as any).currency, isAr)}
                    {item.periodEn && (
                      <span className="text-sm font-semibold text-deumah-gray-500">
                        {isAr ? ` / ${item.periodAr}` : ` / ${item.periodEn}`}
                      </span>
                    )}
                  </div>
                  {item.negotiable && (
                    <span className="mt-1 inline-block bg-deumah-green-100 text-deumah-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                      {isAr ? 'قابل للتفاوض' : 'Negotiable'}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-deumah-gray-100 pt-4">
                <h2 className="font-bold text-deumah-navy-950 mb-2">{isAr ? 'الوصف' : 'Description'}</h2>
                <p className="text-deumah-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {isAr ? item.descriptionAr : item.descriptionEn}
                </p>
              </div>
            </div>

            {/* Specifications Details */}
            {item.specs && Array.isArray(item.specs) && item.specs.length > 0 && (
              <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-deumah-navy-950 mb-4 pb-2 border-b border-deumah-gray-100">
                  ⚙️ {t('specs')}
                </h2>
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {item.specs.map((spec, i) => (
                    <div key={i} className="p-3 bg-deumah-gray-50 rounded-deumah-sm border border-deumah-gray-100">
                      <div className="text-xs text-deumah-gray-500 font-bold uppercase mb-1">
                        {isAr ? spec.labelAr : spec.labelEn}
                      </div>
                      <div className="text-sm font-bold text-deumah-navy-950">
                        {isAr ? spec.valueAr : spec.valueEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Placeholder Location */}
            <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-deumah-navy-950 mb-4 pb-2 border-b border-deumah-gray-100">
                🗺️ {t('locationMap')}
              </h2>
              <div className="relative aspect-video rounded-deumah-sm overflow-hidden bg-deumah-gray-100 border border-deumah-gray-200 flex flex-col items-center justify-center p-4">
                <svg className="size-16 text-deumah-green-700/60 mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-center">
                  <p className="font-bold text-deumah-navy-950">{isAr ? item.locationAr : item.locationEn}</p>
                  <p className="text-xs text-deumah-gray-500 font-semibold mt-1">
                    {isAr ? 'خريطة اليمن التفاعلية (صنعاء، عدن، تعز، والمزيد)' : 'Interactive Map for Yemen cities'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Pricing, Booking & Contact Forms */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
            
            {/* Rent Dynamic Calendar Scheduler Panel */}
            {item.type === 'rent' ? (
              <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-deumah-navy-950">
                  📅 {t('calendarTitle')}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase mb-1">{t('startDate')}</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      locale={isAr ? "ar" : "en-US"}
                      dateFormat="yyyy/MM/dd"
                      minDate={new Date()}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2.5 outline-none focus:border-deumah-green-600 bg-transparent transition"
                      placeholderText={isAr ? "اختر تاريخ البداية" : "Select start date"}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase mb-1">{t('endDate')}</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      locale={isAr ? "ar" : "en-US"}
                      dateFormat="yyyy/MM/dd"
                      minDate={startDate || new Date()}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2.5 outline-none focus:border-deumah-green-600 bg-transparent transition"
                      placeholderText={isAr ? "اختر تاريخ النهاية" : "Select end date"}
                    />
                  </div>
                </div>

                {/* Calculate Dynamic Price */}
                {rentalDetails ? (
                  <div className="pt-3 border-t border-deumah-gray-100 bg-deumah-green-100/50 p-3 rounded-deumah-sm border border-deumah-green-200/50">
                    <div className="text-xs text-deumah-green-700 font-bold uppercase">
                      {t('totalPrice')} ({isAr ? toArabicNumerals(rentalDetails.daysCount) : rentalDetails.daysCount} {t('days')})
                    </div>
                    <div className="text-2xl font-extrabold text-deumah-green-700 mt-1">
                      {formatPriceWithCurrency(rentalDetails.totalCost, (item as any).currency, isAr)}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-deumah-gray-400 font-semibold italic text-center">
                    {isAr ? 'يرجى تحديد تواريخ صالحة لحساب السعر التلقائي' : 'Select dates to automatically calculate total cost'}
                  </p>
                )}

                <button 
                  disabled={!rentalDetails}
                  onClick={async () => {
                    if (!rentalDetails) return;
                    if (!currentUser) {
                      alert(isAr ? 'يجب تسجيل الدخول لتقديم طلب حجز' : 'You must be logged in to request a booking');
                      return;
                    }
                    
                    const amount = rentalDetails.totalCost;
                    const formattedAmount = formatPriceWithCurrency(amount, (item as any).currency, isAr);
                    const startStr = startDate ? startDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '';
                    const endStr = endDate ? endDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '';
                    const msg = isAr 
                      ? `طلب حجز تأجير من ${startStr} إلى ${endStr} (${rentalDetails.daysCount} أيام) بإجمالي ${formattedAmount}.`
                      : `Rental booking request from ${startStr} to ${endStr} (${rentalDetails.daysCount} days) for a total of ${formattedAmount}.`;
                    
                    try {
                      const sellerId = (item as any).owner_id || (item as any).ownerId;
                      const { error } = await supabase.from('offers').insert({
                        listing_id: item.id,
                        buyer_id: currentUser.id,
                        seller_id: sellerId,
                        amount: amount,
                        message: msg
                      });

                      if (error) throw error;
                      
                      if (sellerId) {
                        await supabase.from('notifications').insert({
                          user_id: sellerId,
                          type: 'offer',
                          title_en: 'New Rental Booking Request!',
                          title_ar: 'طلب حجز تأجير جديد!',
                          message_en: msg,
                          message_ar: msg,
                          listing_id: item.id,
                          read: false
                        });
                      }
                      
                      setOfferToast(true);
                      setTimeout(() => setOfferToast(false), 3000);
                    } catch (err: any) {
                      alert(`Error: ${err.message}`);
                    }
                  }}
                  className={`w-full py-3 rounded-deumah-sm font-bold text-sm text-center transition ${
                    rentalDetails 
                      ? 'bg-deumah-green-700 text-white hover:bg-deumah-green-600 cursor-pointer shadow-sm'
                      : 'bg-deumah-gray-200 text-deumah-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAr ? 'إرسال طلب حجز' : 'Request Booking'}
                </button>
              </div>
            ) : (
              /* Sell absolute Inquiry Block */
              <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-deumah-navy-950">
                  🏷️ {t('purchaseInquiry')}
                </h3>
                <p className="text-xs text-deumah-gray-500 font-semibold leading-relaxed">
                  {isAr 
                    ? 'هذا الإعلان معروض للبيع المطلق. تواصل مع البائع مباشرة للحصول على السعر النهائي أو التفاوض.' 
                    : 'This item is available for absolute sale. Contact the seller directly to negotiate or complete purchase.'}
                </p>
                <div className="p-3 bg-deumah-gray-50 border border-deumah-gray-100 rounded-deumah-sm">
                  <div className="text-xs text-deumah-gray-500 font-bold uppercase">{isAr ? 'سعر البيع' : 'Selling Price'}</div>
                  <div className="text-2xl font-extrabold text-deumah-green-700 mt-1">
                    {formatPriceWithCurrency(item.price, (item as any).currency, isAr)}
                  </div>
                </div>
                <button 
                  onClick={() => setShowOfferModal(true)}
                  className="w-full bg-deumah-green-700 text-white hover:bg-deumah-green-600 py-3 rounded-deumah-sm font-bold text-sm text-center transition shadow-sm cursor-pointer"
                >
                  {isAr ? 'طلب شراء فوري' : 'Submit Buying Offer'}
                </button>
              </div>
            )}

            {/* Owner Info & Messaging Section */}
            <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-deumah-gray-500 uppercase tracking-wider">
                👤 {t('contactOwner')}
              </h3>

              {/* Profile details */}
              <div className="flex items-center gap-3">
                <img 
                  src={item.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt="" 
                  className="size-12 rounded-full object-cover border border-deumah-gray-200" 
                />
                <div>
                  <div className="font-bold text-deumah-navy-950 hover:text-deumah-green-700 transition">
                    {isOwner
                      ? (currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || (isAr ? 'أنت (صاحب الإعلان)' : 'You (Owner)'))
                      : (isAr ? (item.owner?.nameAr || 'بائع موثق') : (item.owner?.nameEn || 'Verified Seller'))}
                  </div>
                  <div className="text-xs text-deumah-gray-400 font-medium">
                    {t('membersince')}: {isAr ? (item.owner?.memberSinceAr || '٢٠٢٤') : (item.owner?.memberSinceEn || '2024')}
                  </div>
                </div>
              </div>

              {/* Quick stats details */}
              <div className="grid grid-cols-2 gap-2 text-center border-y border-deumah-gray-100 py-2.5">
                <div>
                  <div className="text-xs text-deumah-gray-400 font-bold uppercase">{t('responserate')}</div>
                  <div className="text-sm font-bold text-deumah-green-700 mt-0.5">{item.owner?.responseRate || '98%'}</div>
                </div>
                <div>
                  <div className="text-xs text-deumah-gray-400 font-bold uppercase">{isAr ? 'التحقق' : 'Status'}</div>
                  <div className="text-sm font-bold text-deumah-green-700 mt-0.5">✓ {isAr ? 'موثق' : 'Verified'}</div>
                </div>
              </div>

              {/* Message form or Owner Management Box */}
              {isBlocked ? (
                <div className="bg-red-50 p-6 rounded-deumah border border-red-200 shadow-sm text-center">
                  <div className="text-4xl mb-3 opacity-80">🚫</div>
                  <h3 className="text-sm font-bold text-red-700 mb-2">
                    {isAr ? 'لا يمكنك التفاعل مع هذا المستخدم' : 'You cannot interact with this user'}
                  </h3>
                  <p className="text-[11px] text-red-600/80 font-bold">
                    {isAr ? 'تم تقييد التفاعل بسبب الحظر المتبادل.' : 'Interaction is restricted due to a block.'}
                  </p>
                </div>
              ) : isOwner ? (
                <div className="bg-deumah-navy-950 text-white p-4 rounded-deumah-sm space-y-2.5 border border-white/10 shadow-xs">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold text-deumah-gold-500 uppercase tracking-wider">
                    <span>⭐ {isAr ? 'إعلانك الخاص' : 'YOUR OWN LISTING'}</span>
                  </div>
                  <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                    {isAr 
                      ? 'أنت صاحب هذا الإعلان. يمكنك إدارة حالة الإعلان، إيقافه، تعديله، أو رؤية استفسارات المشترين من لوحة التحكم.'
                      : 'You are the owner of this ad listing. Manage status, edit info, pause/delete, or view buyer messages in your dashboard.'}
                  </p>
                  <Link 
                    href="/dashboard"
                    className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white text-center py-2 rounded-deumah-sm font-bold text-xs transition block shadow-xs"
                  >
                    ⚙️ {isAr ? 'الانتقال للوحة التحكم وإدارة الإعلان' : 'Manage Ad in My Dashboard'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {contact.whatsapp && (
                    <a 
                      href={`https://wa.me/${(contact.whatsappNumber || '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#128C7E] py-2.5 rounded-deumah-sm font-bold text-xs transition shadow-sm"
                    >
                      💬 {isAr ? 'تواصل عبر واتساب' : 'WhatsApp Message'}
                    </a>
                  )}
                  
                  {contact.call && (
                    <a 
                      href={`tel:${contact.phoneNumber || ''}`}
                      className="w-full flex items-center justify-center gap-2 bg-deumah-navy-950 text-white hover:bg-deumah-navy-900 py-2.5 rounded-deumah-sm font-bold text-xs transition shadow-sm"
                    >
                      📞 {isAr ? 'اتصال مباشر' : 'Direct Call'}
                    </a>
                  )}

                  {contact.chat && (
                    <>
                      {(!contact.whatsapp && !contact.call) || showChatForm ? (
                        <form onSubmit={handleSendMessage} className="space-y-3 animate-fade-in mt-2 border-t border-deumah-gray-100 pt-3">
                          <textarea
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            placeholder={t('messagePlaceholder')}
                            rows={3}
                            className="w-full text-xs border border-deumah-gray-200 rounded-deumah-sm p-3 outline-none focus:border-deumah-green-600 bg-transparent transition resize-none"
                            required
                          />
                          <button
                            type="submit"
                            className="w-full bg-deumah-navy-950 text-white hover:bg-deumah-navy-900 py-2.5 rounded-deumah-sm font-bold text-xs transition cursor-pointer"
                          >
                            ✉️ {t('sendMessage')}
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowChatForm(true)}
                          className="w-full flex items-center justify-center gap-2 bg-deumah-gray-100 text-deumah-navy-950 hover:bg-deumah-gray-200 py-2.5 rounded-deumah-sm font-bold text-xs transition"
                        >
                          ✉️ {isAr ? 'رسالة عبر المنصة' : 'Deumah Chat'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Message Success Toast Popup */}
      {showToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs">✓</span>
          <span className="text-xs font-semibold">{t('messageSuccess')}</span>
        </div>
      )}

      <Footer />

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-deumah-gray-100 bg-deumah-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-deumah-navy-950 text-lg">
                {isAr ? 'تقديم عرض شراء' : 'Make an Offer'}
              </h3>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="text-deumah-gray-400 hover:text-deumah-navy-950 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleMakeOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase mb-1">
                  {isAr ? 'مبلغ العرض ($)' : 'Offer Amount ($)'}
                </label>
                <input 
                  type="number" 
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  className="w-full border-2 border-deumah-gray-200 rounded-deumah-sm px-4 py-3 text-lg font-bold text-deumah-navy-950 focus:border-deumah-green-500 focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-deumah-gray-500 uppercase mb-1">
                  {isAr ? 'رسالة (اختياري)' : 'Message (Optional)'}
                </label>
                <textarea 
                  value={offerMessage}
                  onChange={e => setOfferMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب رسالة للبائع...' : 'Write a message to the seller...'}
                  className="w-full border-2 border-deumah-gray-200 rounded-deumah-sm px-4 py-3 text-sm text-deumah-navy-950 focus:border-deumah-green-500 focus:outline-none transition min-h-[100px]"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-deumah-green-700 text-white font-bold py-3 rounded-deumah-sm hover:bg-deumah-green-600 transition shadow-sm mt-2 cursor-pointer"
              >
                {isAr ? 'تأكيد العرض' : 'Submit Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Toast */}
      {offerToast && (
        <div className="fixed bottom-4 right-4 bg-deumah-green-700 text-white px-6 py-3 rounded-deumah-sm font-bold shadow-xl animate-fade-in z-50">
          {isAr ? '✅ تم إرسال العرض بنجاح!' : '✅ Offer submitted successfully!'}
        </div>
      )}

      {/* Full Screen Image Gallery */}
      <Lightbox
        open={isGalleryOpen}
        close={() => setIsGalleryOpen(false)}
        index={activePhotoIdx}
        slides={item.images.map(src => ({ src }))}
        plugins={[Zoom, Counter]}
        on={{
          view: ({ index }) => setActivePhotoIdx(index)
        }}
      />
    </div>
  );
}
