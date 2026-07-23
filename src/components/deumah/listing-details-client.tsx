'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';

import { ListingItem } from '@/data/listings';

const toArabicNumerals = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, w => arabicDigits[+w]);
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

  // Booking Calendar Scheduler state (for Rent items)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate rental cost dynamically in real-time
  const rentalDetails = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    if (timeDiff <= 0) return null;

    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalCost = daysCount * item.price;
    return { daysCount, totalCost };
  }, [startDate, endDate, item.price]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    setShowToast(true);
    setMessageText('');
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link 
            href="/listings" 
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-deumah-green-700 hover:text-deumah-green-600 transition"
          >
            <svg className="size-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </Link>
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
                    className="w-full h-full object-cover"
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
                    {isAr ? `${toArabicNumerals(item.price)} دولار` : `$${item.price}`}
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
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2.5 outline-none focus:border-deumah-green-600 bg-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase mb-1">{t('endDate')}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3 py-2.5 outline-none focus:border-deumah-green-600 bg-transparent transition"
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
                      {isAr ? `${toArabicNumerals(rentalDetails.totalCost)} دولار` : `$${rentalDetails.totalCost}`}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-deumah-gray-400 font-semibold italic text-center">
                    {isAr ? 'يرجى تحديد تواريخ صالحة لحساب السعر التلقائي' : 'Select dates to automatically calculate total cost'}
                  </p>
                )}

                <button 
                  disabled={!rentalDetails}
                  className={`w-full py-3 rounded-deumah-sm font-bold text-sm text-center transition ${
                    rentalDetails 
                      ? 'bg-deumah-green-700 text-white hover:bg-deumah-green-600 cursor-pointer shadow-sm'
                      : 'bg-deumah-gray-200 text-deumah-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAr ? 'احجز الآن' : 'Book Rental Now'}
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
                    {isAr ? `${toArabicNumerals(item.price)} دولار` : `$${item.price}`}
                  </div>
                </div>
                <button className="w-full bg-deumah-green-700 text-white hover:bg-deumah-green-600 py-3 rounded-deumah-sm font-bold text-sm text-center transition shadow-sm">
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
                <img src={item.owner.avatar} alt="" className="size-12 rounded-full object-cover border border-deumah-gray-200" />
                <div>
                  <div className="font-bold text-deumah-navy-950 hover:text-deumah-green-700 transition">
                    {isAr ? item.owner.nameAr : item.owner.nameEn}
                  </div>
                  <div className="text-xs text-deumah-gray-400 font-medium">
                    {t('membersince')}: {isAr ? item.owner.memberSinceAr : item.owner.memberSinceEn}
                  </div>
                </div>
              </div>

              {/* Quick stats details */}
              <div className="grid grid-cols-2 gap-2 text-center border-y border-deumah-gray-100 py-2.5">
                <div>
                  <div className="text-xs text-deumah-gray-400 font-bold uppercase">{t('responserate')}</div>
                  <div className="text-sm font-bold text-deumah-green-700 mt-0.5">{item.owner.responseRate}</div>
                </div>
                <div>
                  <div className="text-xs text-deumah-gray-400 font-bold uppercase">{isAr ? 'التحقق' : 'Status'}</div>
                  <div className="text-sm font-bold text-deumah-green-700 mt-0.5">✓ {isAr ? 'موثق' : 'Verified'}</div>
                </div>
              </div>

              {/* Message form */}
              <form onSubmit={handleSendMessage} className="space-y-3">
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
                  className="w-full bg-deumah-navy-950 text-white hover:bg-deumah-navy-900 py-2.5 rounded-deumah-sm font-bold text-xs transition"
                >
                  ✉️ {t('sendMessage')}
                </button>
              </form>
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
    </div>
  );
}
