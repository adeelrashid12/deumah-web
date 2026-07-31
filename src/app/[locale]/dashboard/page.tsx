'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';

interface ListingItem {
  id: string;
  titleEn: string;
  titleAr: string;
  price: string;
  category: string;
  type: 'sale' | 'rent';
  status: 'active' | 'paused' | 'sold' | 'rented';
  views: number;
  favorites: number;
}

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Tabs navigation state: My Listings, Messages, Saved Listings, Profile, Settings
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'saved' | 'profile' | 'settings'>('listings');

  // Listings State
  const [listingsList, setListingsList] = useState<ListingItem[]>([
    { id: '1', titleEn: 'Toyota Land Cruiser 2021', titleAr: 'تويوتا لاند كروزر 2021', price: '$85/Day', category: 'Cars', type: 'rent', status: 'active', views: 342, favorites: 28 },
    { id: '2', titleEn: 'Villa in Al-Sabeen Street', titleAr: 'فيلا في شارع السبعين', price: '$950/Month', category: 'Properties', type: 'rent', status: 'paused', views: 189, favorites: 14 },
    { id: '3', titleEn: 'Canon 80D Camera', titleAr: 'كاميرا Canon 80D', price: '$450', category: 'Electronics', type: 'sale', status: 'active', views: 567, favorites: 42 }
  ]);

  // Profile Details State
  const [fullName, setFullName] = useState(isAr ? 'أحمد علي' : 'Ahmed Ali');
  const [phone, setPhone] = useState('771234567');
  const [email, setEmail] = useState('ahmed@example.com');
  const [governorate, setGovernorate] = useState('sanaa_city');

  // App settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);

  // Toasts and alerts
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Actions handlers
  const handleTogglePause = (id: string) => {
    setListingsList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'paused' ? 'active' : 'paused';
        triggerToast(
          isAr 
            ? (nextStatus === 'active' ? 'تم استئناف الإعلان بنجاح!' : 'تم إيقاف الإعلان مؤقتاً!') 
            : (nextStatus === 'active' ? 'Listing resumed successfully!' : 'Listing paused successfully!')
        );
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleMarkComplete = (id: string, type: 'sale' | 'rent') => {
    setListingsList(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = type === 'sale' ? 'sold' : 'rented';
        triggerToast(
          isAr 
            ? (type === 'sale' ? 'تم تمييز الإعلان كمباع!' : 'تم تمييز الإعلان كمؤجر!') 
            : (type === 'sale' ? 'Listing marked as Sold!' : 'Listing marked as Rented!')
        );
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleRenew = (id: string) => {
    setListingsList(prev => prev.map(item => {
      if (item.id === id) {
        triggerToast(isAr ? 'تم إعادة نشر وتجديد الإعلان بنجاح!' : 'Listing renewed & republished successfully!');
        return { ...item, status: 'active' };
      }
      return item;
    }));
  };

  const handleDelete = (id: string) => {
    setListingsList(prev => prev.filter(item => item.id !== id));
    triggerToast(isAr ? 'تم حذف الإعلان بنجاح!' : 'Listing deleted successfully!');
  };

  const handleDuplicate = (item: ListingItem) => {
    const duplicated: ListingItem = {
      ...item,
      id: Date.now().toString(),
      titleEn: `${item.titleEn} (Copy)`,
      titleAr: `${item.titleAr} (نسخة)`,
      status: 'active',
      views: 0,
      favorites: 0
    };
    setListingsList(prev => [...prev, duplicated]);
    triggerToast(isAr ? 'تم تكرار الإعلان بنجاح كنسخة جديدة!' : 'Listing duplicated successfully as a new copy!');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(isAr ? 'تم حفظ بيانات الملف الشخصي بنجاح!' : 'Profile settings saved successfully!');
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(isAr ? 'تم تحديث الإعدادات بنجاح!' : 'App settings updated successfully!');
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-deumah-navy-950 tracking-tight font-heading">
              {isAr ? 'لوحة التحكم الشخصية' : 'User Dashboard'}
            </h1>
            <p className="text-xs text-deumah-gray-500 mt-1 font-medium">
              {isAr ? 'أدر إعلاناتك، تواصل مع المشترين، وحدث ملفك الشخصي' : 'Manage your listings, chat with buyers, and update your profile'}
            </p>
          </div>
          <Link href="/post-ad" className="self-start sm:self-center bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold px-5 py-2.5 rounded-deumah text-xs transition shadow-sm">
            ➕ {isAr ? 'نشر إعلان جديد' : 'Post New Ad'}
          </Link>
        </div>

        {/* COMPACT STATISTICS GRID */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5 mb-6">
          {[
            { label: isAr ? 'الإعلانات النشطة' : 'Active Listings', value: listingsList.filter(l => l.status === 'active').length, icon: '🚗' },
            { label: isAr ? 'المشاهدات' : 'Total Views', value: listingsList.reduce((acc, l) => acc + l.views, 0), icon: '👁️' },
            { label: isAr ? 'المفضلة' : 'Favorites', value: listingsList.reduce((acc, l) => acc + l.favorites, 0), icon: '⭐' },
            { label: isAr ? 'الرسائل الواردة' : 'Inbox Messages', value: 4, icon: '💬' },
            { label: isAr ? 'طلبات معلقة' : 'Pending Requests', value: 1, icon: '⏳' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-deumah-gray-200 rounded-deumah p-3 flex items-center gap-3 shadow-xs">
              <span className="text-xl shrink-0">{stat.icon}</span>
              <div>
                <span className="block text-[9px] font-bold text-deumah-gray-400 uppercase tracking-wider leading-none mb-1">
                  {stat.label}
                </span>
                <p className="text-sm font-black text-deumah-navy-950 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
          
          {/* Sidebar Tabs */}
          <aside className="bg-white rounded-deumah border border-deumah-gray-200 p-3 shadow-sm flex flex-row overflow-x-auto md:flex-col gap-1.5 scrollbar-none snap-x snap-mandatory">
            {[
              { id: 'listings', labelEn: '🚗 My Listings', labelAr: '🚗 إعلاناتي' },
              { id: 'messages', labelEn: '💬 Messages', labelAr: '💬 الرسائل' },
              { id: 'saved', labelEn: '⭐ Saved Listings', labelAr: '⭐ المحفوظات' },
              { id: 'profile', labelEn: '👤 Profile Info', labelAr: '👤 الملف الشخصي' },
              { id: 'settings', labelEn: '⚙️ App Settings', labelAr: '⚙️ الإعدادات' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as never)}
                className={`w-full text-left rtl:text-right shrink-0 md:w-auto px-4 py-2.5 rounded-deumah-sm text-xs font-bold transition flex items-center gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-deumah-green-700 text-white shadow-sm'
                    : 'bg-transparent text-deumah-gray-700 hover:bg-deumah-gray-50'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </aside>

          {/* Main Dashboard Canvas Panel */}
          <div className="bg-white rounded-deumah border border-deumah-gray-200 p-5 shadow-sm min-h-[420px]">
            
            {/* MY LISTINGS TAB */}
            {activeTab === 'listings' && (
              <div className="space-y-4">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'إعلاناتي المعروضة' : 'My Listings Control Center'}
                </h2>

                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden divide-y divide-deumah-gray-200">
                  {listingsList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-deumah-gray-400 font-medium">
                      {isAr ? 'لا يوجد لديك إعلانات حالياً.' : 'You have no listings yet.'}
                    </div>
                  ) : (
                    listingsList.map(item => (
                      <div key={item.id} className="p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-deumah-navy-950">
                              {isAr ? item.titleAr : item.titleEn}
                            </h3>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              item.status === 'active'
                                ? 'bg-deumah-green-50 text-deumah-green-700 border-deumah-green-200'
                                : item.status === 'paused'
                                ? 'bg-deumah-gray-50 text-deumah-gray-500 border-deumah-gray-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {item.status === 'active' && (isAr ? 'نشط' : 'Active')}
                              {item.status === 'paused' && (isAr ? 'موقوف مؤقتاً' : 'Paused')}
                              {item.status === 'sold' && (isAr ? 'مباع' : 'Sold')}
                              {item.status === 'rented' && (isAr ? 'مؤجر' : 'Rented')}
                            </span>
                            <span className="text-[9px] font-bold bg-deumah-navy-50 text-deumah-navy-900 px-2 py-0.5 rounded">
                              {item.type === 'sale' ? (isAr ? 'للبيع' : 'For Sale') : (isAr ? 'للإيجار' : 'For Rent')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-deumah-gray-400">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="text-deumah-green-700 font-bold">{item.price}</span>
                            <span>•</span>
                            <span>👁️ {item.views} {isAr ? 'مشاهدة' : 'views'}</span>
                          </div>
                        </div>

                        {/* Interactive Listing Action Buttons Toolbar */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-extrabold self-stretch lg:self-auto justify-end">
                          <button 
                            type="button"
                            className="px-2.5 py-1.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-gray-700 cursor-pointer"
                          >
                            ✏️ {isAr ? 'تعديل' : 'Edit'}
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => handleTogglePause(item.id)}
                            className="px-2.5 py-1.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-navy-950 cursor-pointer"
                          >
                            {item.status === 'paused' ? (isAr ? '▶️ استئناف' : '▶️ Resume') : (isAr ? '⏸️ إيقاف مؤقت' : '⏸️ Pause')}
                          </button>

                          {item.status === 'active' && (
                            <button 
                              type="button"
                              onClick={() => handleMarkComplete(item.id, item.type)}
                              className="px-2.5 py-1.5 border border-deumah-green-200 bg-deumah-green-50 text-deumah-green-700 rounded hover:bg-deumah-green-100 cursor-pointer"
                            >
                              ✓ {item.type === 'sale' ? (isAr ? 'تم البيع' : 'Mark Sold') : (isAr ? 'تم التأجير' : 'Mark Rented')}
                            </button>
                          )}

                          {(item.status === 'sold' || item.status === 'rented' || item.status === 'paused') && (
                            <button 
                              type="button"
                              onClick={() => handleRenew(item.id)}
                              className="px-2.5 py-1.5 border border-deumah-green-200 bg-deumah-green-50 text-deumah-green-700 rounded hover:bg-deumah-green-100 cursor-pointer"
                            >
                              🔁 {isAr ? 'إعادة النشر' : 'Republish'}
                            </button>
                          )}

                          <button 
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="px-2.5 py-1.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-gray-700 cursor-pointer"
                          >
                            📋 {isAr ? 'تكرار' : 'Duplicate'}
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="px-2.5 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 cursor-pointer"
                          >
                            🗑️ {isAr ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'رسائل ودردشات المشترين' : 'Direct Messages Inbox'}
                </h2>
                
                {/* Mock Chat Layout */}
                <div className="border border-deumah-gray-200 rounded-deumah h-[320px] grid grid-cols-[200px_1fr] overflow-hidden">
                  
                  {/* Left Threads Column */}
                  <div className="border-r rtl:border-r-0 rtl:border-l border-deumah-gray-200 bg-deumah-gray-50/50 overflow-y-auto divide-y divide-deumah-gray-100">
                    {[
                      { user: isAr ? 'صالح محمد' : 'Saleh Mohammed', lastMsg: isAr ? 'هل السيارة متوفرة اليوم؟' : 'Is the car available today?', active: true },
                      { user: isAr ? 'رائد علي' : 'Raeed Ali', lastMsg: isAr ? 'أريد حجز الصالة الأسبوع القادم' : 'I want to book the hall next week', active: false }
                    ].map((thread, idx) => (
                      <div key={idx} className={`p-3 cursor-pointer text-left rtl:text-right transition ${thread.active ? 'bg-white border-l-4 rtl:border-l-0 rtl:border-r-4 border-deumah-green-700' : 'hover:bg-deumah-gray-100'}`}>
                        <h4 className="text-xs font-extrabold text-deumah-navy-950">{thread.user}</h4>
                        <p className="text-[10px] text-deumah-gray-400 font-semibold truncate mt-0.5">{thread.lastMsg}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Chat panel */}
                  <div className="flex flex-col justify-between p-4 bg-white">
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      <div className="bg-deumah-gray-100 p-3 rounded-deumah-sm max-w-[80%] self-start text-[11px] font-semibold text-deumah-gray-700">
                        {isAr ? 'مرحباً، هل السيارة تويوتا لاندكروزر متوفرة للإيجار غداً؟' : 'Hello, is the Toyota Land Cruiser available for rent tomorrow?'}
                      </div>
                      <div className="bg-deumah-green-50 text-deumah-green-800 p-3 rounded-deumah-sm max-w-[80%] ms-auto text-right text-[11px] font-semibold">
                        {isAr ? 'نعم أهلاً بك، متوفرة وجاهزة للاستلام.' : 'Yes, welcome! It is available and ready for pickup.'}
                      </div>
                    </div>
                    
                    {/* Chat inputs */}
                    <div className="mt-4 flex gap-2 border-t border-deumah-gray-100 pt-3">
                      <input 
                        type="text" 
                        placeholder={isAr ? 'اكتب رسالة هنا...' : 'Type message here...'} 
                        className="flex-grow text-xs border border-deumah-gray-200 rounded px-3 py-2 outline-none focus:border-deumah-green-600"
                      />
                      <button className="bg-deumah-green-700 text-white font-bold text-xs px-4 py-2 rounded cursor-pointer hover:bg-deumah-green-600 transition">
                        {isAr ? 'إرسال' : 'Send'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SAVED LISTINGS TAB */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'الإعلانات المحفوظة' : 'My Saved Listings & Wishlist'}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: '10', titleEn: 'Yamaha R6 Motorcycle', titleAr: 'دراجة ياماها R6 نارية', price: '$25/Day', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop&q=80' },
                    { id: '11', titleEn: 'Modern Chalet with Private Pool', titleAr: 'شاليه حديث مع مسبح خاص', price: '$120/Day', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300&auto=format&fit=crop&q=80' }
                  ].map(saved => (
                    <div key={saved.id} className="border border-deumah-gray-200 rounded-deumah overflow-hidden flex shadow-xs">
                      <img src={saved.image} alt={saved.titleEn} className="w-20 object-cover" />
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-deumah-navy-950">{isAr ? saved.titleAr : saved.titleEn}</h4>
                          <span className="text-[10px] text-deumah-green-700 font-extrabold">{saved.price}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <Link href={`/listings/${saved.id}`} className="text-[10px] font-bold text-deumah-green-700 hover:underline">
                            {isAr ? 'عرض الإعلان' : 'View Ad'}
                          </Link>
                          <button className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer">
                            {isAr ? 'إزالة' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'بيانات الحساب الشخصي' : 'Personal Profile Information'}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider mb-1.5">
                      {isAr ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full text-xs border border-deumah-gray-200 rounded px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider mb-1.5">
                      {isAr ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs border border-deumah-gray-200 rounded px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-xs border border-deumah-gray-200 rounded px-3 py-2 outline-none bg-deumah-gray-50 text-deumah-gray-400 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-deumah-gray-400 uppercase tracking-wider mb-1.5">
                      {isAr ? 'المحافظة' : 'Governorate'}
                    </label>
                    <select
                      value={governorate}
                      onChange={e => setGovernorate(e.target.value)}
                      className="w-full text-xs border border-deumah-gray-200 rounded px-2.5 py-2 outline-none focus:border-deumah-green-600 bg-white cursor-pointer font-bold text-deumah-gray-700"
                    >
                      <option value="sanaa_city">{isAr ? 'أمانة العاصمة / مدينة صنعاء' : "Sana'a City (Amanat Al Asimah)"}</option>
                      <option value="sanaa">{isAr ? 'محافظة صنعاء' : 'Sana\'a Governorate'}</option>
                      <option value="aden">{isAr ? 'عدن' : 'Aden'}</option>
                      <option value="taiz">{isAr ? 'تعز' : 'Taiz'}</option>
                      <option value="ibb">{isAr ? 'إب' : 'Ibb'}</option>
                      <option value="hadhramaut">{isAr ? 'حضرموت' : 'Hadhramaut'}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-2.5 rounded text-xs transition cursor-pointer"
                >
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSettingsSave} className="space-y-5">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'إعدادات الحساب والتنبيهات' : 'App Settings & Notifications'}
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-deumah-gray-700">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={e => setNotificationsEnabled(e.target.checked)}
                      className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                    />
                    <span>{isAr ? 'تمكين تنبيهات البريد والدردشة الواردة' : 'Enable email and chat notifications'}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-deumah-gray-700">
                    <input
                      type="checkbox"
                      checked={newsletterEnabled}
                      onChange={e => setNewsletterEnabled(e.target.checked)}
                      className="rounded border-deumah-gray-200 accent-deumah-green-700 size-4 cursor-pointer"
                    />
                    <span>{isAr ? 'الاشتراك في النشرة الإخبارية وعروض ديومة' : 'Subscribe to Deumah newsletters and deals'}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-2.5 rounded text-xs transition cursor-pointer"
                >
                  {isAr ? 'تحديث الإعدادات' : 'Update Settings'}
                </button>
              </form>
            )}

          </div>

        </div>

      </main>

      {/* Success Notification Toast Popup */}
      {showToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs font-heading">✓</span>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
