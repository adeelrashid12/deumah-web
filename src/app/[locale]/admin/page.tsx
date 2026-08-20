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
  views?: number;
}

interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  phone: string;
  governorate: string;
  updated_at: string;
  account_status?: 'active' | 'suspended' | 'banned';
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
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userAnalytics, setUserAnalytics] = useState({ adsCount: 0, activeAdsCount: 0 });

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

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [adminActiveTicket, setAdminActiveTicket] = useState<any | null>(null);
  const [adminTicketMessages, setAdminTicketMessages] = useState<any[]>([]);
  const [adminTicketReply, setAdminTicketReply] = useState('');
  
  const fetchSupportTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase.rpc('admin_get_all_tickets');
      if (error) throw error;
      if (data) setSupportTickets(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSyncAllData = async () => {
    setLoadingListings(true);
    setLoadingUsers(true);
    try {
      await Promise.all([fetchListings(), fetchUsers(), fetchSupportTickets()]);
      triggerToast(isAr ? 'تمت مزامنة وتحديث كافة بيانات المنصة بنجاح! 🔄' : '✓ All database records synchronized successfully!');
    } catch (err: any) {
      triggerToast(err.message || (isAr ? 'فشلت المزامنة' : 'Sync failed'));
    }
  };

  useEffect(() => {
    fetchListings();
    fetchUsers();
    fetchSupportTickets();
  }, []);

  // Update listing moderation status
  const handleUpdateStatus = async (id: string, action: 'approved' | 'rejected') => {
    const newStatus = action === 'approved' ? 'approved' : 'rejected';
    try {
      const { error } = await supabase.rpc('admin_update_listing_status', { 
        target_listing_id: id, 
        new_status: newStatus 
      });

      if (error) throw error;

      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      triggerToast(newStatus === 'approved' 
        ? (isAr ? 'تم قبول ونشر الإعلان بنجاح!' : 'Listing approved & published!')
        : (isAr ? 'تم رفض الإعلان!' : 'Listing rejected!'));
    } catch (e: any) {
      console.error(e);
      triggerToast('Error updating status');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('admin_update_user_status', { target_user_id: userId, new_status: newStatus });
      if (error) throw error;
      triggerToast(isAr ? 'تم تحديث حالة المستخدم بنجاح' : 'User status updated successfully');
      setUsers(users.map(u => u.id === userId ? { ...u, account_status: newStatus as any } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, account_status: newStatus as any });
      }
    } catch (e: any) {
      triggerToast(e.message || 'Error updating user status');
    }
  };

  const openUserDetails = async (u: UserProfile) => {
    setSelectedUser(u);
    setIsUserModalOpen(true);
    setUserAnalytics({ adsCount: 0, activeAdsCount: 0 }); // reset
    
    try {
      const { count: adsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('owner_id', u.id);
      const { count: activeAdsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('owner_id', u.id).eq('status', 'active');
      setUserAnalytics({ adsCount: adsCount || 0, activeAdsCount: activeAdsCount || 0 });
    } catch (e) {
      console.error('Error fetching analytics:', e);
    }
  };

  // --- Analytics Calculations ---
  const totalViews = listings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalValue = listings
    .filter(item => item.status === 'active' || item.status === 'approved')
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  
  const categoryCounts = listings.reduce((acc, item) => {
    const cat = item.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusCounts = listings.reduce((acc, item) => {
    const st = item.status || 'unknown';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Delete listing
  const handleDeleteListing = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت تأكد من حذف هذا الإعلان نهائياً؟' : 'Are you sure you want to delete this listing permanently?')) return;
    try {
      const { error } = await supabase.rpc('admin_delete_listing', {
        target_listing_id: id
      });

      if (error) {
        if (error.message.includes('foreign key constraint')) {
          alert(isAr 
            ? 'لا يمكن حذف هذا الإعلان نهائياً (لأنه مرتبط برسائل أو عروض نشطة). يرجى استخدام زر "رفض الإعلان" بدلاً من ذلك لإخفائه.' 
            : 'Cannot permanently delete this listing (it is tied to active messages or offers). Please use "Reject Ad" instead to hide it.');
          return;
        }
        throw error;
      }

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
                                  <span className="text-deumah-green-700 font-extrabold">
                                    {(() => {
                                      const c = (item.currency || 'USD').toUpperCase().trim();
                                      let cStr = isAr ? 'دولار' : '$';
                                      if (c === 'YER') cStr = isAr ? 'ريال يمني' : 'YER';
                                      if (c === 'SAR') cStr = isAr ? 'ريال سعودي' : 'SAR';
                                      
                                      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
                                      const numWithCommas = Number(item.price).toLocaleString('en-US');
                                      const numStr = isAr ? numWithCommas.replace(/[0-9]/g, w => arabicDigits[+w]) : numWithCommas;
                                      
                                      return isAr ? `${numStr} ${cStr}` : `${cStr === '$' ? '$' : ''}${numStr} ${cStr !== '$' ? cStr : ''}`.trim();
                                    })()}
                                  </span>
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
                              onClick={() => {
                                if(confirm(isAr ? 'هل أنت متأكد من حظر هذا المستخدم؟' : 'Are you sure you want to ban this user?')) {
                                  handleUpdateUserStatus(item.owner_id, 'banned');
                                  handleUpdateStatus(item.id, 'rejected');
                                }
                              }}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition cursor-pointer shadow-xs font-bold"
                            >
                              🚫 {isAr ? 'حظر المستخدم' : 'Ban User'}
                            </button>

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
                      <div key={u.id} className="p-4 border border-deumah-gray-200 rounded-deumah flex items-center justify-between bg-white hover:bg-deumah-gray-50 transition shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-deumah-navy-950 text-white flex items-center justify-center font-bold text-lg font-heading uppercase">
                            {u.full_name ? u.full_name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-deumah-navy-950 flex items-center gap-2">
                              {u.full_name || (isAr ? 'مستخدم مجهول' : 'Anonymous User')}
                              {u.account_status === 'banned' && (
                                <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded uppercase">{isAr ? 'محظور' : 'Banned'}</span>
                              )}
                              {u.account_status === 'suspended' && (
                                <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded uppercase">{isAr ? 'معلق' : 'Suspended'}</span>
                              )}
                            </h4>
                            <p className="text-[10px] text-deumah-gray-500 font-medium mt-1">✉️ {u.email || (isAr ? 'بدون بريد' : 'No email')} • 📱 {u.phone || (isAr ? 'بدون رقم' : 'No phone')} • 📍 {u.governorate || 'Sana\'a'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => openUserDetails(u)}
                            className="text-xs font-bold bg-deumah-navy-50 text-deumah-navy-950 hover:bg-deumah-navy-100 px-3 py-1.5 rounded transition cursor-pointer"
                          >
                            {isAr ? 'عرض التفاصيل' : 'View Full Details'}
                          </button>
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
                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden divide-y divide-deumah-gray-200">
                  {users.filter(u => u.account_status === 'banned' || u.account_status === 'suspended').length === 0 ? (
                    <div className="p-12 text-center border border-deumah-gray-200 rounded-deumah bg-deumah-gray-50 flex flex-col items-center justify-center gap-3 shadow-inner">
                      <span className="text-4xl">🚫</span>
                      <p className="text-sm font-bold text-deumah-navy-950">
                        {isAr ? 'لا يوجد مستخدمون محظورون حالياً' : 'No blocked users currently'}
                      </p>
                      <p className="text-xs text-deumah-gray-500 max-w-sm mx-auto">
                        {isAr ? 'ستظهر هنا قائمة الحسابات التي تم تعليقها أو حظرها من استخدام المنصة.' : 'Accounts that have been suspended or banned from using the platform will appear here.'}
                      </p>
                    </div>
                  ) : (
                    users.filter(u => u.account_status === 'banned' || u.account_status === 'suspended').map(u => (
                      <div key={u.id} className="p-4 border border-deumah-gray-200 rounded-deumah flex items-center justify-between bg-white hover:bg-deumah-gray-50 transition shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg font-heading uppercase">
                            {u.full_name ? u.full_name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-deumah-navy-950 flex items-center gap-2">
                              {u.full_name || (isAr ? 'مستخدم مجهول' : 'Anonymous User')}
                              {u.account_status === 'banned' && (
                                <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded uppercase">{isAr ? 'محظور' : 'Banned'}</span>
                              )}
                              {u.account_status === 'suspended' && (
                                <span className="bg-yellow-100 text-yellow-700 text-[9px] px-1.5 py-0.5 rounded uppercase">{isAr ? 'معلق' : 'Suspended'}</span>
                              )}
                            </h4>
                            <p className="text-[10px] text-deumah-gray-500 font-medium mt-1">✉️ {u.email || (isAr ? 'بدون بريد' : 'No email')} • 📱 {u.phone || (isAr ? 'بدون رقم' : 'No phone')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if(confirm(isAr ? 'هل أنت متأكد من إلغاء حظر هذا المستخدم؟' : 'Are you sure you want to unban this user?')) {
                                handleUpdateUserStatus(u.id, 'active');
                              }
                            }}
                            className="text-xs font-bold bg-deumah-green-700 text-white hover:bg-deumah-green-600 px-4 py-2 rounded transition cursor-pointer shadow-sm"
                          >
                            🔄 {isAr ? 'إلغاء الحظر (تنشيط)' : 'Unban User'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. REPORTS & ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'التقارير والإحصائيات' : 'Platform Reports & Analytics'}
                  </h2>
                </div>
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-deumah border border-deumah-gray-200 shadow-sm flex flex-col justify-between">
                    <span className="text-3xl mb-3">👥</span>
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">{isAr ? 'إجمالي المستخدمين' : 'Total Registered Users'}</span>
                    <span className="text-2xl font-black text-deumah-navy-950 mt-1">{users.length}</span>
                  </div>
                  <div className="bg-white p-5 rounded-deumah border border-deumah-gray-200 shadow-sm flex flex-col justify-between">
                    <span className="text-3xl mb-3">👁️</span>
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">{isAr ? 'إجمالي المشاهدات' : 'Total Platform Views'}</span>
                    <span className="text-2xl font-black text-deumah-navy-950 mt-1">{totalViews.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-5 rounded-deumah border border-deumah-gray-200 shadow-sm flex flex-col justify-between">
                    <span className="text-3xl mb-3">📦</span>
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">{isAr ? 'إجمالي الإعلانات' : 'Total Listings'}</span>
                    <span className="text-2xl font-black text-deumah-navy-950 mt-1">{listings.length}</span>
                  </div>
                  <div className="bg-deumah-navy-950 p-5 rounded-deumah border border-white/10 shadow-sm flex flex-col justify-between text-white">
                    <span className="text-3xl mb-3">💰</span>
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{isAr ? 'القيمة التقديرية للإعلانات' : 'Total Active Ad Value'}</span>
                    <span className="text-2xl font-black text-deumah-gold-500 mt-1">${totalValue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Secondary Analytics */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Category Breakdown */}
                  <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm">
                    <h3 className="text-sm font-black text-deumah-navy-950 mb-4">{isAr ? 'توزيع الإعلانات حسب الأقسام' : 'Listings by Category'}</h3>
                    <div className="space-y-4">
                      {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count], idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-deumah-gray-700 w-24 truncate capitalize">{cat}</span>
                          <div className="flex-1 bg-deumah-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-deumah-green-700 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${(count / listings.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-deumah-navy-950 w-8 text-right">{count}</span>
                        </div>
                      ))}
                      {Object.keys(categoryCounts).length === 0 && (
                        <p className="text-xs text-deumah-gray-400 font-medium italic">{isAr ? 'لا توجد بيانات' : 'No data available'}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white p-6 rounded-deumah border border-deumah-gray-200 shadow-sm">
                    <h3 className="text-sm font-black text-deumah-navy-950 mb-4">{isAr ? 'حالة الإعلانات الحالية' : 'Listing Status Distribution'}</h3>
                    <div className="space-y-4">
                      {['active', 'pending', 'rejected', 'paused'].map(status => {
                        const count = statusCounts[status] || 0;
                        const percentage = listings.length > 0 ? (count / listings.length) * 100 : 0;
                        const colors: Record<string, string> = {
                          active: 'bg-deumah-green-700',
                          pending: 'bg-yellow-500',
                          rejected: 'bg-red-500',
                          paused: 'bg-deumah-gray-400'
                        };
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-deumah-gray-700 w-24 truncate capitalize">{status}</span>
                            <div className="flex-1 bg-deumah-gray-100 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`${colors[status]} h-full rounded-full transition-all duration-1000`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-deumah-navy-950 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'تذاكر الدعم الفني' : 'Customer Support Tickets'}
                  </h2>
                  {adminActiveTicket && (
                    <button 
                      onClick={() => setAdminActiveTicket(null)}
                      className="text-sm font-bold text-deumah-gray-500 hover:text-deumah-navy-950"
                    >
                      {isAr ? '← العودة للقائمة' : '← Back to List'}
                    </button>
                  )}
                </div>

                {!adminActiveTicket ? (
                  <div className="bg-white rounded-deumah border border-deumah-gray-200 overflow-hidden shadow-sm">
                    {loadingTickets ? (
                      <div className="p-8 text-center text-sm font-bold text-deumah-gray-500">Loading tickets...</div>
                    ) : supportTickets.length === 0 ? (
                      <div className="p-12 text-center text-sm font-bold text-deumah-gray-500">No support tickets found.</div>
                    ) : (
                      <div className="divide-y divide-deumah-gray-200">
                        {supportTickets.map(ticket => (
                          <div 
                            key={ticket.id} 
                            onClick={async () => {
                              setAdminActiveTicket(ticket);
                              const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
                              if (data) setAdminTicketMessages(data);
                            }}
                            className="p-4 flex items-center justify-between hover:bg-deumah-gray-50 transition cursor-pointer"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-deumah-navy-950">{ticket.subject}</h4>
                              <p className="text-xs text-deumah-gray-500 mt-1">From: <span className="font-bold">{ticket.user_name || ticket.user_email}</span> • {new Date(ticket.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              ticket.status === 'open' ? 'bg-deumah-green-100 text-deumah-green-700' : 
                              ticket.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-deumah-gray-200 text-deumah-gray-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-deumah-gray-200 rounded-deumah flex flex-col h-[600px] overflow-hidden bg-white shadow-sm">
                    {/* Header */}
                    <div className="bg-deumah-navy-950 p-5 text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{adminActiveTicket.subject}</h3>
                        <p className="text-xs text-white/60 mt-1">Ticket #{adminActiveTicket.id.split('-')[0]} • From: {adminActiveTicket.user_name || adminActiveTicket.user_email}</p>
                      </div>
                      {adminActiveTicket.status !== 'closed' && (
                        <button 
                          onClick={async () => {
                            if (!confirm(isAr ? 'هل أنت متأكد من إغلاق هذه التذكرة؟' : 'Are you sure you want to close this ticket?')) return;
                            try {
                              const { error } = await supabase.rpc('admin_close_ticket', { target_ticket_id: adminActiveTicket.id });
                              if (error) throw error;
                              triggerToast(isAr ? 'تم إغلاق التذكرة' : 'Ticket closed');
                              setSupportTickets(prev => prev.map(t => t.id === adminActiveTicket.id ? { ...t, status: 'closed' } : t));
                              setAdminActiveTicket({ ...adminActiveTicket, status: 'closed' });
                            } catch (e: any) { triggerToast(e.message); }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          {isAr ? 'إغلاق التذكرة' : 'Close Ticket'}
                        </button>
                      )}
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-deumah-gray-50">
                      {adminTicketMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-4 rounded-xl text-sm shadow-sm ${
                            msg.is_admin ? 'bg-deumah-green-700 text-white rounded-tr-none' : 'bg-white border border-deumah-gray-200 text-deumah-navy-950 rounded-tl-none'
                          }`}>
                            <div className="font-bold mb-2 flex justify-between gap-6">
                              <span>{msg.is_admin ? 'You (Admin)' : (adminActiveTicket.user_name || adminActiveTicket.user_email)}</span>
                              <span className="text-[10px] opacity-70">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input */}
                    {adminActiveTicket.status !== 'closed' ? (
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!adminTicketReply.trim()) return;
                          try {
                            const { data: { user } } = await supabase.auth.getUser();
                            const { error } = await supabase.rpc('admin_reply_to_ticket', { 
                              target_ticket_id: adminActiveTicket.id, 
                              admin_id: user?.id, 
                              reply_text: adminTicketReply 
                            });
                            if (error) throw error;
                            setAdminTicketReply('');
                            
                            const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', adminActiveTicket.id).order('created_at', { ascending: true });
                            if (data) setAdminTicketMessages(data);
                          } catch (err: any) {
                            triggerToast(err.message);
                          }
                        }}
                        className="p-4 border-t border-deumah-gray-200 bg-white flex gap-3"
                      >
                        <input
                          type="text"
                          value={adminTicketReply}
                          onChange={e => setAdminTicketReply(e.target.value)}
                          placeholder={isAr ? 'اكتب ردك للمستخدم...' : 'Type your reply to the user...'}
                          className="flex-1 bg-deumah-gray-50 border border-deumah-gray-200 rounded-lg p-3 outline-none focus:border-deumah-green-600"
                        />
                        <button type="submit" className="bg-deumah-green-700 text-white px-6 rounded-lg font-bold hover:bg-deumah-green-600 transition">
                          {isAr ? 'إرسال' : 'Send Reply'}
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 text-center text-sm font-bold text-deumah-gray-500 bg-deumah-gray-100 border-t border-deumah-gray-200">
                        {isAr ? 'هذه التذكرة مغلقة ولا يمكن الرد عليها.' : 'This ticket is closed and cannot be replied to.'}
                      </div>
                    )}
                  </div>
                )}
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium whitespace-nowrap">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs font-heading">✓</span>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-deumah-navy-950 p-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-black text-2xl uppercase border-2 border-white/20">
                  {selectedUser.full_name ? selectedUser.full_name.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">
                    {selectedUser.full_name || (isAr ? 'مستخدم مجهول' : 'Anonymous User')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      selectedUser.account_status === 'banned' ? 'bg-red-500/20 text-red-300' :
                      selectedUser.account_status === 'suspended' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-deumah-green-500/20 text-deumah-green-300'
                    }`}>
                      {selectedUser.account_status === 'banned' ? (isAr ? 'محظور نهائياً' : 'Banned') :
                       selectedUser.account_status === 'suspended' ? (isAr ? 'معلق مؤقتاً' : 'Suspended') :
                       (isAr ? 'نشط' : 'Active')}
                    </span>
                    <span className="text-[10px] text-white/50">• {selectedUser.id.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="text-white/50 hover:text-white transition bg-white/5 rounded-full p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-deumah-gray-50 p-3 rounded border border-deumah-gray-100">
                  <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-1">✉️ {isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                  <span className="text-xs font-bold text-deumah-navy-950">{selectedUser.email || '-'}</span>
                </div>
                <div className="bg-deumah-gray-50 p-3 rounded border border-deumah-gray-100">
                  <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-1">📱 {isAr ? 'رقم الهاتف' : 'Phone Number'}</span>
                  <span className="text-xs font-bold text-deumah-navy-950">{selectedUser.phone || '-'}</span>
                </div>
                <div className="bg-deumah-gray-50 p-3 rounded border border-deumah-gray-100">
                  <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-1">📍 {isAr ? 'المدينة/المحافظة' : 'Location'}</span>
                  <span className="text-xs font-bold text-deumah-navy-950">{selectedUser.governorate || '-'}</span>
                </div>
                <div className="bg-deumah-gray-50 p-3 rounded border border-deumah-gray-100">
                  <span className="block text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider mb-1">📅 {isAr ? 'تاريخ الانضمام' : 'Joined Date'}</span>
                  <span className="text-xs font-bold text-deumah-navy-950">{new Date(selectedUser.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="border-t border-deumah-gray-100 pt-4">
                <h4 className="text-[11px] font-black text-deumah-navy-950 uppercase tracking-wider mb-3">
                  📊 {isAr ? 'إحصائيات المستخدم' : 'Platform Activity Analytics'}
                </h4>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white border-2 border-deumah-gray-100 rounded-lg p-3 text-center">
                    <span className="text-2xl font-black text-deumah-navy-950 block">{userAnalytics.adsCount}</span>
                    <span className="text-[10px] font-bold text-deumah-gray-500 uppercase">{isAr ? 'إجمالي الإعلانات' : 'Total Listings'}</span>
                  </div>
                  <div className="flex-1 bg-deumah-green-50 border-2 border-deumah-green-100 rounded-lg p-3 text-center">
                    <span className="text-2xl font-black text-deumah-green-700 block">{userAnalytics.activeAdsCount}</span>
                    <span className="text-[10px] font-bold text-deumah-green-700 uppercase">{isAr ? 'إعلانات نشطة' : 'Active Listings'}</span>
                  </div>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="border-t border-deumah-gray-100 pt-4">
                <h4 className="text-[11px] font-black text-deumah-navy-950 uppercase tracking-wider mb-3">
                  🛡️ {isAr ? 'إجراءات الإدارة' : 'Moderation Actions'}
                </h4>
                
                {selectedUser.account_status === 'banned' ? (
                  <button 
                    onClick={() => handleUpdateUserStatus(selectedUser.id, 'active')}
                    className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3 rounded text-sm transition shadow-sm cursor-pointer"
                  >
                    🔄 {isAr ? 'إلغاء الحظر (تنشيط الحساب)' : 'Reinstate User Account'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateUserStatus(selectedUser.id, 'suspended')}
                      className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-3 rounded text-sm transition cursor-pointer border border-yellow-200"
                    >
                      ⏳ {isAr ? 'تعليق مؤقت' : 'Suspend Temporarily'}
                    </button>
                    <button 
                      onClick={() => handleUpdateUserStatus(selectedUser.id, 'banned')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-sm transition shadow-sm cursor-pointer"
                    >
                      🚫 {isAr ? 'حظر نهائي' : 'Ban User Permanently'}
                    </button>
                  </div>
                )}
                <p className="text-[9px] text-deumah-gray-400 text-center mt-2 font-medium">
                  {isAr ? 'تنبيه: حظر المستخدم سيقوم تلقائياً بإيقاف جميع إعلاناته النشطة لحماية المشترين.' : 'Warning: Banning a user will automatically pause all their active listings to protect buyers.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
