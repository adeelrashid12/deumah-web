'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';

interface AdminListing {
  id: string;
  title_en: string;
  title_ar: string;
  price: number;
  currency: string;
  category: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paused';
  governorate: string;
  images: string[];
  created_at: string;
  owner_id: string;
}

interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  phone: string;
  governorate: string;
  updated_at: string;
}

export default function AdminPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Comprehensive Admin Tabs
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'blocked_users' | 'analytics' | 'support' | 'settings'>('listings');

  // Listings State
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Fetch all listings
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setListings(data);
    } catch (e: any) {
      console.error('Fetch listings error:', e);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (e: any) {
      console.error('Fetch users error:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSyncAllData = async () => {
    setLoadingListings(true);
    setLoadingUsers(true);
    try {
      await Promise.all([fetchListings(), fetchUsers()]);
      triggerToast(isAr ? 'تمت مزامنة وتحديث كافة بيانات المنصة بنجاح! 🔄' : '✓ All database records synchronized successfully!');
    } catch (err: any) {
      triggerToast(err.message || (isAr ? 'فشلت المزامنة' : 'Sync failed'));
    }
  };

  useEffect(() => {
    fetchListings();
    fetchUsers();
  }, []);

  // Update listing moderation status
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      triggerToast(newStatus === 'approved' 
        ? (isAr ? 'تم قبول ونشر الإعلان بنجاح!' : 'Listing approved & published!')
        : (isAr ? 'تم رفض الإعلان!' : 'Listing rejected!'));
    } catch (err: any) {
      triggerToast(err.message || 'Error updating status');
    }
  };

  // Delete listing
  const handleDeleteListing = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت تأكد من حذف هذا الإعلان نهائياً؟' : 'Are you sure you want to delete this listing permanently?')) return;
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings(prev => prev.filter(l => l.id !== id));
      triggerToast(isAr ? 'تم حذف الإعلان بنجاح!' : 'Listing deleted successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error deleting listing');
    }
  };

  // User profiles lookup map
  const usersMap = new Map(users.map(u => [u.id, u]));

  // Filter listings based on active tab and search query
  const filteredListings = listings.filter(item => {
    // 1. Status Filter
    if (activeFilter !== 'all') {
        if (activeFilter === 'pending' && item.status !== 'pending') return false;
        if (activeFilter === 'approved' && item.status !== 'approved' && item.status !== 'active') return false;
        if (activeFilter === 'rejected' && item.status !== 'rejected') return false;
    }

    // 2. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchEn = item.title_en?.toLowerCase().includes(q);
      const matchAr = item.title_ar?.includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchEn && !matchAr && !matchCat) return false;
    }

    return true;
  });

  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const approvedCount = listings.filter(l => l.status === 'approved' || l.status === 'active').length;
  const rejectedCount = listings.filter(l => l.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      {/* Standalone Master Admin Header Bar */}
      <header className="bg-deumah-navy-950 text-white border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition bg-white/10 px-3 py-1.5 rounded-deumah-sm border border-white/10">
              <span>←</span>
              <span>{isAr ? 'العودة للموقع الرئيسي' : 'Back to Marketplace'}</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />
            <span className="font-extrabold text-sm tracking-wider font-heading flex items-center gap-2">
              <span className="size-2 rounded-full bg-deumah-green-500 animate-pulse" />
              <span>{isAr ? 'مركز التحكم والتحقيق الإداري ⚡' : 'DEUMAH MASTER CONTROL CENTER ⚡'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin" locale={isAr ? 'en' : 'ar'} className="text-xs font-bold px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition">
              {isAr ? 'English' : 'العربية'}
            </Link>
            <span className="text-xs bg-deumah-green-700 text-white font-extrabold px-3 py-1.5 rounded-deumah-sm flex items-center gap-1.5 shadow-xs">
              🛡️ {isAr ? 'مدير منصة دومه' : 'Super Admin'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Master Admin Header Banner */}
        <div className="bg-deumah-navy-950 text-white rounded-deumah p-6 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="bg-deumah-green-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                ⚡ MASTER ADMIN COMMAND CENTER
              </span>
              <span className="text-xs font-semibold text-deumah-gold-500">
                ● Live Database Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              {isAr ? 'لوحة تحكم وإدارة منصة دومه' : 'Deumah Master Enterprise Admin'}
            </h1>
            <p className="text-xs text-white/70 font-medium">
              {isAr ? 'مراجعة وقبول الإعلانات، تتبع الناشرين، وإدارة أصحاب الحسابات المسجلة' : 'Review and approve ad listings, inspect publisher profiles, and manage registered user accounts'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllData}
              className="bg-deumah-green-700 hover:bg-deumah-green-600 border border-white/20 text-white font-bold px-4 py-2.5 rounded-deumah text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              🔄 {isAr ? 'مزامنة وتحديث كافة البيانات' : 'Sync All Data'}
            </button>
          </div>
        </div>

        {/* COMPACT TOP SYSTEM METRICS */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-6">
          <div className="bg-white border border-deumah-gray-200 rounded-deumah p-3.5 flex items-center gap-3 shadow-xs">
            <span className="text-2xl p-2 bg-yellow-50 rounded-deumah-sm">⏳</span>
            <div>
              <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-0.5">
                {isAr ? 'طلبات بانتظار الموافقة' : 'Pending Ads'}
              </span>
              <p className="text-base font-black text-deumah-navy-950">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white border border-deumah-gray-200 rounded-deumah p-3.5 flex items-center gap-3 shadow-xs">
            <span className="text-2xl p-2 bg-deumah-green-50 rounded-deumah-sm">✅</span>
            <div>
              <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-0.5">
                {isAr ? 'الإعلانات النشطة المقبولة' : 'Approved Ads'}
              </span>
              <p className="text-base font-black text-deumah-navy-950">{approvedCount}</p>
            </div>
          </div>

          <div className="bg-white border border-deumah-gray-200 rounded-deumah p-3.5 flex items-center gap-3 shadow-xs">
            <span className="text-2xl p-2 bg-red-50 rounded-deumah-sm">❌</span>
            <div>
              <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-0.5">
                {isAr ? 'الإعلانات المرفوضة' : 'Rejected Ads'}
              </span>
              <p className="text-base font-black text-deumah-navy-950">{rejectedCount}</p>
            </div>
          </div>

          <div className="bg-white border border-deumah-gray-200 rounded-deumah p-3.5 flex items-center gap-3 shadow-xs">
            <span className="text-2xl p-2 bg-deumah-navy-50 rounded-deumah-sm">👥</span>
            <div>
              <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-0.5">
                {isAr ? 'المستخدمون المسجلون' : 'Total Users'}
              </span>
              <p className="text-base font-black text-deumah-navy-950">{users.length}</p>
            </div>
          </div>
        </div>

        {/* ADMIN WORKSPACE GRID LAYOUT */}
        <div className="grid gap-6 md:grid-cols-[240px_1fr] items-start">
          
          {/* Sidebar Tabs */}
          <aside className="bg-white rounded-deumah border border-deumah-gray-200 p-3 shadow-sm flex flex-row overflow-x-auto md:flex-col gap-1.5 scrollbar-none snap-x snap-mandatory">
            {[
              { id: 'listings', labelEn: `📢 Ads Moderation (${listings.length})`, labelAr: `📢 مراجعة الإعلانات (${listings.length})` },
              { id: 'users', labelEn: `👥 User Accounts (${users.length})`, labelAr: `👥 مستخدمو المنصة (${users.length})` },
              { id: 'blocked_users', labelEn: `🚫 Blocked Users (0)`, labelAr: `🚫 المحظورين (0)` },
              { id: 'analytics', labelEn: `📈 Reports & Analytics`, labelAr: `📈 التقارير والإحصائيات` },
              { id: 'support', labelEn: `💬 Support Tickets (0)`, labelAr: `💬 تذاكر الدعم (0)` },
              { id: 'settings', labelEn: `⚙️ System Settings`, labelAr: `⚙️ إعدادات النظام` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left rtl:text-right shrink-0 md:w-auto px-4 py-3 rounded-deumah-sm text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-deumah-green-700 text-white shadow-sm'
                    : 'bg-transparent text-deumah-gray-700 hover:bg-deumah-gray-50'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            ))}
          </aside>

          {/* MAIN ADMIN WORKSPACE CANVAS */}
          <div className="bg-white rounded-deumah border border-deumah-gray-200 p-6 shadow-sm min-h-[500px]">
            
            {/* 1. LISTINGS MODERATION TAB */}
            {activeTab === 'listings' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'إدارة ومراجعة إعلانات المنصة' : 'Listings Moderation Queue'}
                  </h2>

                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder={isAr ? 'بحث بالإعلان أو الفئة...' : 'Search listings by title...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 text-xs border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 outline-none focus:border-deumah-green-600 bg-white"
                  />
                </div>

                {/* Moderation Filter Chips */}
                <div className="flex gap-2 border-b border-deumah-gray-100 pb-3 overflow-x-auto">
                  {[
                    { id: 'all', labelEn: `📋 All (${listings.length})`, labelAr: `📋 الكل (${listings.length})` },
                    { id: 'pending', labelEn: `⏳ Pending Approval (${pendingCount})`, labelAr: `⏳ بانتظار الموافقة (${pendingCount})` },
                    { id: 'approved', labelEn: `✅ Approved & Active (${approvedCount})`, labelAr: `✅ مقبول ونشط (${approvedCount})` },
                    { id: 'rejected', labelEn: `❌ Rejected (${rejectedCount})`, labelAr: `❌ مرفوض (${rejectedCount})` }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as any)}
                      className={`py-1.5 px-3 rounded text-xs font-bold transition cursor-pointer ${
                        activeFilter === filter.id
                          ? 'bg-deumah-navy-950 text-white shadow-xs'
                          : 'bg-deumah-gray-50 text-deumah-gray-600 hover:bg-deumah-gray-100'
                      }`}
                    >
                      {isAr ? filter.labelAr : filter.labelEn}
                    </button>
                  ))}
                </div>

                {/* Moderation Items Table */}
                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden divide-y divide-deumah-gray-200">
                  {loadingListings ? (
                    <div className="p-12 text-center text-xs text-deumah-gray-400 font-semibold flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-deumah-green-700 border-t-transparent rounded-full animate-spin"></span>
                      <span>{isAr ? 'جاري جلب الإعلانات...' : 'Loading listings...'}</span>
                    </div>
                  ) : filteredListings.length === 0 ? (
                    <div className="p-12 text-center text-xs text-deumah-gray-400 font-semibold">
                      {isAr ? 'لا توجد إعلانات مطابقة لهذه التصفية.' : 'No listings found for this filter.'}
                    </div>
                  ) : (
                    filteredListings.map(item => {
                      const poster = item.owner_id ? usersMap.get(item.owner_id) : null;
                      return (
                        <div key={item.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-deumah-gray-50/50 transition">
                          
                          {/* Summary & Image */}
                          <div className="flex items-center gap-4">
                            <div className="size-16 rounded-deumah-sm bg-deumah-gray-100 overflow-hidden shrink-0 border border-deumah-gray-200">
                              <img 
                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80'} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-extrabold text-deumah-navy-950">
                                  {isAr ? item.title_ar || item.title_en : item.title_en}
                                </h3>

                                {/* Status Badge */}
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                  item.status === 'pending'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : item.status === 'approved' || item.status === 'active'
                                    ? 'bg-deumah-green-50 text-deumah-green-700 border-deumah-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {item.status === 'pending' && (isAr ? 'بانتظار الموافقة' : 'Pending Review')}
                                  {(item.status === 'approved' || item.status === 'active') && (isAr ? 'مقبول ونشط' : 'Approved')}
                                  {item.status === 'rejected' && (isAr ? 'مرفوض' : 'Rejected')}
                                </span>

                                <span className="text-[9px] font-bold bg-deumah-navy-50 text-deumah-navy-900 px-2 py-0.5 rounded">
                                  {item.type === 'rent' ? (isAr ? 'للإيجار' : 'For Rent') : (isAr ? 'للبيع' : 'For Sale')}
                                </span>
                              </div>

                              {/* POSTER DETAILED INFO */}
                              <div className="flex flex-col gap-1 mt-1.5">
                                <div className="text-[10px] font-semibold text-deumah-gray-500 flex items-center gap-2 flex-wrap">
                                  <span>👤 <strong className="text-deumah-navy-950">{poster?.full_name || (isAr ? 'مستخدم' : 'Anonymous')}</strong></span>
                                  <span>•</span>
                                  <span>✉️ {poster?.email || (isAr ? 'بدون بريد' : 'No email')}</span>
                                  <span>•</span>
                                  <span>📱 {poster?.phone || (isAr ? 'بدون رقم' : 'No phone')}</span>
                                  <span>•</span>
                                  <span>📍 {poster?.governorate || item.governorate}</span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] font-semibold text-deumah-gray-500 flex-wrap">
                                  <span>🏷️ {item.category}</span>
                                  <span>•</span>
                                  <span className="text-deumah-green-700 font-extrabold">{item.price} {item.currency || 'USD'}</span>
                                  <span>•</span>
                                  <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Toolbar */}
                          <div className="flex items-center gap-2 shrink-0 text-xs font-bold mt-3 md:mt-0">
                            <Link
                              href={`/listings/${item.id}`}
                              target="_blank"
                              className="px-3 py-1.5 border border-deumah-gray-200 text-deumah-gray-700 rounded hover:bg-deumah-gray-100 transition"
                            >
                              👁️ {isAr ? 'معاينة' : 'Preview'}
                            </Link>

                            {item.status !== 'approved' && item.status !== 'active' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                className="px-3.5 py-1.5 bg-deumah-green-700 hover:bg-deumah-green-600 text-white rounded transition cursor-pointer shadow-xs"
                              >
                                ✓ {isAr ? 'موافقة ونشر' : 'Approve & Publish'}
                              </button>
                            )}

                            {item.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded transition cursor-pointer"
                              >
                                ✕ {isAr ? 'رفض الإعلان' : 'Reject Ad'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteListing(item.id)}
                              className="px-3 py-1.5 border border-deumah-gray-200 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            >
                              🗑️ {isAr ? 'حذف' : 'Delete'}
                            </button>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 2. USER ACCOUNTS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'مستخدمو المنصة وأصحاب الإعلانات' : 'Registered Platform Users & Publishers'}
                  </h2>
                  <span className="text-xs font-bold text-deumah-gray-400">
                    {isAr ? `إجمالي المستخدمين: ${users.length}` : `Total Users: ${users.length}`}
                  </span>
                </div>

                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden divide-y divide-deumah-gray-200">
                  {loadingUsers ? (
                    <div className="p-8 text-center text-xs text-deumah-gray-400">
                      {isAr ? 'جاري تحميل قائمة المستخدمين...' : 'Loading user records...'}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-xs text-deumah-gray-400">
                      {isAr ? 'لا يوجد مستخدمون مسجلون حالياً.' : 'No registered users found.'}
                    </div>
                  ) : (
                    users.map(u => (
                      <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-deumah-navy-950 text-white font-extrabold flex items-center justify-center text-sm">
                            {u.full_name?.substring(0, 1) || 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-deumah-navy-950">{u.full_name || (isAr ? 'مستخدم مجهول' : 'Anonymous User')}</h4>
                            <p className="text-[10px] text-deumah-gray-500 font-medium">✉️ {u.email || (isAr ? 'بدون بريد' : 'No email')} • 📱 {u.phone || (isAr ? 'بدون رقم' : 'No phone')} • 📍 {u.governorate || 'Sana\'a'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-deumah-green-50 text-deumah-green-700 text-[10px] font-bold px-2.5 py-1 rounded border border-deumah-green-200">
                            ✓ {isAr ? 'نشط' : 'Active Account'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. BLOCKED USERS TAB */}
            {activeTab === 'blocked_users' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'المستخدمون المحظورون' : 'Blocked & Banned Users'}
                  </h2>
                </div>
                <div className="p-12 text-center border border-deumah-gray-200 rounded-deumah bg-deumah-gray-50 flex flex-col items-center justify-center gap-3 shadow-inner">
                  <span className="text-4xl">🚫</span>
                  <p className="text-sm font-bold text-deumah-navy-950">
                    {isAr ? 'لا يوجد مستخدمون محظورون حالياً' : 'No blocked users currently'}
                  </p>
                  <p className="text-xs text-deumah-gray-500 max-w-sm mx-auto">
                    {isAr ? 'ستظهر هنا قائمة الحسابات التي تم تعليقها أو حظرها من استخدام المنصة.' : 'Accounts that have been suspended or banned from using the platform will appear here.'}
                  </p>
                </div>
              </div>
            )}

            {/* 4. REPORTS & ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'التقارير والإحصائيات' : 'Platform Reports & Analytics'}
                  </h2>
                </div>
                <div className="p-12 text-center border border-deumah-gray-200 rounded-deumah bg-deumah-gray-50 flex flex-col items-center justify-center gap-3 shadow-inner">
                  <span className="text-4xl">📈</span>
                  <p className="text-sm font-bold text-deumah-navy-950">
                    {isAr ? 'جاري تجميع البيانات الإحصائية' : 'Aggregating Analytical Data'}
                  </p>
                  <p className="text-xs text-deumah-gray-500 max-w-sm mx-auto">
                    {isAr ? 'سيتم عرض الرسوم البيانية لأداء المنصة والمبيعات قريباً.' : 'Platform performance charts, growth metrics, and detailed analytics will be displayed here soon.'}
                  </p>
                </div>
              </div>
            )}

            {/* 5. SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'تذاكر الدعم الفني' : 'Customer Support Tickets'}
                  </h2>
                </div>
                <div className="p-12 text-center border border-deumah-gray-200 rounded-deumah bg-deumah-gray-50 flex flex-col items-center justify-center gap-3 shadow-inner">
                  <span className="text-4xl">💬</span>
                  <p className="text-sm font-bold text-deumah-navy-950">
                    {isAr ? 'لا توجد تذاكر دعم جديدة' : 'No new support tickets'}
                  </p>
                  <p className="text-xs text-deumah-gray-500 max-w-sm mx-auto">
                    {isAr ? 'سيتم إدراج شكاوى المستخدمين واستفسارات الدعم الفني هنا.' : 'User complaints, technical issues, and general support inquiries will be listed here.'}
                  </p>
                </div>
              </div>
            )}

            {/* 6. SYSTEM SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'إعدادات النظام المتقدمة' : 'Advanced System Settings'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '⚙️', titleEn: 'General Configuration', titleAr: 'الإعدادات العامة', descEn: 'Manage platform name, logo, and contact details.', descAr: 'إدارة اسم المنصة والشعار وبيانات الاتصال.' }
                  ].map((setting, idx) => (
                    <div key={idx} className="p-4 border border-deumah-gray-200 rounded-deumah flex items-start gap-3 hover:border-deumah-green-500 hover:shadow-sm transition cursor-pointer bg-white">
                      <span className="text-2xl">{setting.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-deumah-navy-950 mb-0.5">{isAr ? setting.titleAr : setting.titleEn}</h4>
                        <p className="text-xs text-deumah-gray-500">{isAr ? setting.descAr : setting.descEn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
    </div>
  );
}
