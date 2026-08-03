'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

interface ListingItem {
  id: string;
  titleEn: string;
  titleAr: string;
  price: string;
  category: string;
  type: 'sale' | 'rent';
  status: 'active' | 'paused' | 'sold' | 'rented' | 'approved' | 'pending' | 'rejected';
  views: number;
  favorites: number;
}

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Tabs navigation state: My Listings, Messages, Saved Listings, Profile, Settings
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'saved' | 'profile' | 'settings'>('listings');

  // Listings State
  const [listingsList, setListingsList] = useState<ListingItem[]>([]);

  // Profile Details State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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

  // Fetch live user listings and profile details
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setEmail(user.email || '');

        // 1. Fetch user profile settings from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setGovernorate(profile.governorate || 'sanaa_city');
        }

        // 2. Fetch user's listings
        const { data: listings } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (listings) {
          setListingsList(listings.map(item => ({
            id: item.id,
            titleEn: item.title_en,
            titleAr: item.title_ar,
            price: `${item.price} ${item.currency}`,
            category: item.category,
            type: item.type,
            status: item.status,
            views: item.views || 0,
            favorites: item.favorites || 0
          })));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDashboardData();
  }, []);

  // Edit Listing Modal State
  const [editingItem, setEditingItem] = useState<ListingItem | null>(null);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const openEditModal = (item: ListingItem) => {
    setEditingItem(item);
    setEditTitleEn(item.titleEn || '');
    setEditTitleAr(item.titleAr || '');
    setEditPrice(item.price ? item.price.toString().replace(/[^0-9.]/g, '') : '');
    setEditCategory(item.category || 'cars');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({
          title_en: editTitleEn,
          title_ar: editTitleAr,
          price: Number(editPrice),
          category: editCategory
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setListingsList(prev => prev.map(l => l.id === editingItem.id ? {
        ...l,
        titleEn: editTitleEn,
        titleAr: editTitleAr,
        price: `${editPrice} USD`,
        category: editCategory
      } : l));

      setEditingItem(null);
      triggerToast(isAr ? 'تم تعديل تفاصيل الإعلان بنجاح!' : 'Listing details updated successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error updating listing');
    }
  };

  // Action handlers wired to Supabase API
  const handleTogglePause = async (id: string) => {
    const item = listingsList.find(l => l.id === id);
    if (!item) return;
    const nextStatus = item.status === 'paused' ? 'approved' : 'paused';

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      setListingsList(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus } : l));
      triggerToast(
        isAr 
          ? (nextStatus === 'approved' ? 'تم استئناف الإعلان بنجاح ونشره!' : 'تم إيقاف الإعلان مؤقتاً!') 
          : (nextStatus === 'approved' ? 'Listing resumed & published live!' : 'Listing paused successfully!')
      );
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleMarkComplete = async (id: string, type: 'sale' | 'rent') => {
    const nextStatus = type === 'sale' ? 'sold' : 'rented';

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      setListingsList(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus } : l));
      triggerToast(
        isAr 
          ? (type === 'sale' ? 'تم تمييز الإعلان كمباع!' : 'تم تمييز الإعلان كمؤجر!') 
          : (type === 'sale' ? 'Listing marked as Sold!' : 'Listing marked as Rented!')
      );
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;

      setListingsList(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l));
      triggerToast(isAr ? 'تم إعادة نشر وتجديد الإعلان بنجاح!' : 'Listing renewed & republished successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListingsList(prev => prev.filter(l => l.id !== id));
      triggerToast(isAr ? 'تم حذف الإعلان بنجاح!' : 'Listing deleted successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleDuplicate = async (item: ListingItem) => {
    try {
      // 1. Fetch original record details to replicate
      const { data: original, error: fetchErr } = await supabase
        .from('listings')
        .select('*')
        .eq('id', item.id)
        .single();

      if (fetchErr || !original) throw fetchErr || new Error('Could not retrieve original listing details');

      // 2. Insert duplicated copy
      const { data: newRecord, error: insertErr } = await supabase
        .from('listings')
        .insert({
          owner_id: original.owner_id,
          title_en: `${original.title_en} (Copy)`,
          title_ar: `${original.title_ar} (نسخة)`,
          description_en: original.description_en,
          description_ar: original.description_ar,
          price: original.price,
          currency: original.currency,
          category: original.category,
          type: original.type,
          governorate: original.governorate,
          images: original.images,
          video_url: original.video_url,
          specifications: original.specifications,
          condition: original.condition,
          status: 'active'
        })
        .select()
        .single();

      if (insertErr || !newRecord) throw insertErr || new Error('Failed to save duplicated copy');

      setListingsList(prev => [
        {
          id: newRecord.id,
          titleEn: newRecord.title_en,
          titleAr: newRecord.title_ar,
          price: `${newRecord.price} ${newRecord.currency}`,
          category: newRecord.category,
          type: newRecord.type,
          status: newRecord.status,
          views: 0,
          favorites: 0
        },
        ...prev
      ]);

      triggerToast(isAr ? 'تم تكرار الإعلان بنجاح كنسخة جديدة!' : 'Listing duplicated successfully as a new copy!');
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          governorate: governorate
        })
        .eq('id', user.id);

      if (error) throw error;

      triggerToast(isAr ? 'تم حفظ بيانات الملف الشخصي بنجاح!' : 'Profile settings saved successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error saving profile');
    }
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
                            onClick={() => openEditModal(item)}
                            className="px-2.5 py-1.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-gray-700 cursor-pointer transition shadow-xs"
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

      {/* Edit Listing Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-deumah max-w-lg w-full p-6 shadow-deumah-search space-y-4 animate-slide-in">
            <div className="flex justify-between items-center pb-3 border-b border-deumah-gray-100">
              <h3 className="font-extrabold text-deumah-navy-950 text-base font-heading">
                ✏️ {isAr ? 'تعديل تفاصيل الإعلان' : 'Edit Listing Details'}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-deumah-gray-400 hover:text-deumah-navy-950 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-deumah-gray-600 mb-1">{isAr ? 'عنوان الإعلان (بالإنجليزية)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={editTitleEn}
                  onChange={e => setEditTitleEn(e.target.value)}
                  className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-deumah-green-600"
                  required
                />
              </div>

              <div>
                <label className="block text-deumah-gray-600 mb-1">{isAr ? 'عنوان الإعلان (بالعربية)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={editTitleAr}
                  onChange={e => setEditTitleAr(e.target.value)}
                  className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-deumah-green-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-deumah-gray-600 mb-1">{isAr ? 'السعر (USD)' : 'Price (USD)'}</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-deumah-green-600 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-deumah-gray-600 mb-1">{isAr ? 'الفئة' : 'Category'}</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-deumah-green-600 bg-white font-bold"
                  >
                    <option value="cars">{isAr ? 'سيارات مركبات' : 'Cars & Vehicles'}</option>
                    <option value="properties">{isAr ? 'عقارات ومباني' : 'Real Estate'}</option>
                    <option value="electronics">{isAr ? 'إلكترونيات' : 'Electronics'}</option>
                    <option value="furniture_home">{isAr ? 'أثاث ومنزل' : 'Furniture & Home'}</option>
                    <option value="services">{isAr ? 'خدمات' : 'Services'}</option>
                    <option value="tools">{isAr ? 'معدات وأدوات' : 'Tools'}</option>
                    <option value="fashion">{isAr ? 'أزياء وموضة' : 'Fashion'}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/2 border border-deumah-gray-200 py-2.5 rounded font-bold text-deumah-gray-700 hover:bg-deumah-gray-50 transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-deumah-green-700 hover:bg-deumah-green-600 text-white py-2.5 rounded font-bold transition shadow-xs cursor-pointer"
                >
                  ✓ {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
