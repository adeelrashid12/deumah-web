'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Tabs navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'settings'>('overview');

  // Profile Details State
  const [fullName, setFullName] = useState(isAr ? 'أحمد علي' : 'Ahmed Ali');
  const [phone, setPhone] = useState('771234567');
  const [email, setEmail] = useState('ahmed@example.com');
  const [governorate, setGovernorate] = useState('sanaa_city');

  // Toasts and alerts
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg(isAr ? 'تم حفظ التعديلات بنجاح!' : 'Profile settings saved successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col justify-between">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-deumah-navy-950 tracking-tight font-heading">
            {isAr ? 'لوحة التحكم الشخصية' : 'User Dashboard'}
          </h1>
          <p className="text-sm text-deumah-gray-500 mt-1 font-medium">
            {isAr ? 'أدر إعلاناتك، حجوزاتك، وتفاصيل حسابك الشخصي' : 'Manage your listings, bookings, and profile settings'}
          </p>
        </div>

        {/* Dashboard grid layout */}
        <div className="grid gap-6 md:grid-cols-[240px_1fr] items-start">
          
          {/* Dashboard Sidebar / Mobile tabs */}
          <aside className="bg-white rounded-deumah border border-deumah-gray-200 p-4 shadow-sm flex flex-row overflow-x-auto md:flex-col gap-2 scrollbar-none snap-x snap-mandatory">
            {[
              { id: 'overview', labelEn: '📊 Overview', labelAr: '📊 الإحصائيات' },
              { id: 'listings', labelEn: '🚗 My Listings', labelAr: '🚗 إعلاناتي' },
              { id: 'bookings', labelEn: '📅 My Bookings', labelAr: '📅 حجوزاتي' },
              { id: 'settings', labelEn: '⚙️ Profile Settings', labelAr: '⚙️ الملف الشخصي' }
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

          {/* Core Panel Content */}
          <div className="bg-white rounded-deumah border border-deumah-gray-200 p-6 shadow-sm min-h-[400px]">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'ملخص الحساب' : 'Account Summary'}
                </h2>

                {/* Info Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="border border-deumah-gray-200 rounded-deumah p-5 space-y-1">
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                      💰 {isAr ? 'إجمالي الأرباح' : 'Total Earnings'}
                    </span>
                    <p className="text-2xl font-extrabold text-deumah-green-700">$2,450</p>
                  </div>
                  <div className="border border-deumah-gray-200 rounded-deumah p-5 space-y-1">
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                      🚗 {isAr ? 'إعلاناتي النشطة' : 'Active Listings'}
                    </span>
                    <p className="text-2xl font-extrabold text-deumah-navy-950">3</p>
                  </div>
                  <div className="border border-deumah-gray-200 rounded-deumah p-5 space-y-1">
                    <span className="text-[10px] font-bold text-deumah-gray-400 uppercase tracking-wider">
                      ⏳ {isAr ? 'الحجوزات المعلقة' : 'Pending Bookings'}
                    </span>
                    <p className="text-2xl font-extrabold text-yellow-600">1</p>
                  </div>
                </div>

                {/* Notifications Log */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider">
                    🔔 {isAr ? 'آخر التنبيهات والنشاطات' : 'Recent Notifications'}
                  </h3>
                  <div className="border border-deumah-gray-100 rounded-deumah divide-y divide-deumah-gray-100 text-xs">
                    <div className="p-4 flex gap-3 items-center">
                      <span className="size-5 rounded-full bg-deumah-green-50 text-deumah-green-700 flex items-center justify-center font-bold">✓</span>
                      <div>
                        <p className="font-semibold text-deumah-navy-950">
                          {isAr ? 'تمت الموافقة على إعلانك "كاميرا Canon 80D"' : 'Your listing "Canon 80D Camera" has been approved!'}
                        </p>
                        <span className="text-[10px] text-deumah-gray-400">2 hours ago</span>
                      </div>
                    </div>
                    <div className="p-4 flex gap-3 items-center">
                      <span className="size-5 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold">⏳</span>
                      <div>
                        <p className="font-semibold text-deumah-navy-950">
                          {isAr ? 'تلقيت طلب حجز جديد لـ "فيلا شارع السبعين"' : 'New booking request received for "Villa in Al-Sabeen Street"'}
                        </p>
                        <span className="text-[10px] text-deumah-gray-400">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* MY LISTINGS PANEL */}
            {activeTab === 'listings' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                    {isAr ? 'إعلاناتي المعروضة' : 'My Published Listings'}
                  </h2>
                </div>

                {/* Listings List Table */}
                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden">
                  <div className="divide-y divide-deumah-gray-200">
                    {[
                      { id: '1', titleEn: 'Toyota Land Cruiser 2021', titleAr: 'تويوتا لاند كروزر 2021', price: '$85/Day', category: 'Cars', status: 'approved' },
                      { id: '2', titleEn: 'Villa in Al-Sabeen Street', titleAr: 'فيلا في شارع السبعين', price: '$950/Month', category: 'Properties', status: 'pending' },
                      { id: '3', titleEn: 'Canon 80D Camera', titleAr: 'كاميرا Canon 80D', price: '$450', category: 'Electronics', status: 'approved' }
                    ].map(item => (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-deumah-navy-950">
                            {isAr ? item.titleAr : item.titleEn}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-deumah-gray-400">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="text-deumah-green-700">{item.price}</span>
                          </div>
                        </div>

                        {/* Badges and Actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            item.status === 'approved'
                              ? 'bg-deumah-green-50 text-deumah-green-700 border-deumah-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {item.status === 'approved' ? (isAr ? 'مقبول' : 'Approved') : (isAr ? 'قيد المراجعة' : 'Pending Review')}
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <button className="px-3 py-1 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-gray-700">
                              {isAr ? 'تعديل' : 'Edit'}
                            </button>
                            <button className="px-3 py-1 border border-red-200 rounded hover:bg-red-50 text-red-600">
                              {isAr ? 'حذف' : 'Delete'}
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* MY BOOKINGS PANEL */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'سجل الحجوزات والمعاملات' : 'My Rental Bookings'}
                </h2>

                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden">
                  <div className="divide-y divide-deumah-gray-200">
                    {[
                      { id: 'b1', titleEn: 'Villa in Al-Sabeen Street', titleAr: 'فيلا في شارع السبعين', dates: 'Aug 01 - Aug 31, 2026', cost: '$950', role: 'Owner', status: 'pending' },
                      { id: 'b2', titleEn: 'Toyota Land Cruiser 2021', titleAr: 'تويوتا لاند كروزر 2021', dates: 'Jul 15 - Jul 18, 2026', cost: '$255', role: 'Customer', status: 'completed' }
                    ].map(booking => (
                      <div key={booking.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-deumah-navy-950">
                              {isAr ? booking.titleAr : booking.titleEn}
                            </h3>
                            <span className="text-[9px] font-extrabold px-2 bg-deumah-gray-100 text-deumah-gray-600 rounded">
                              {booking.role === 'Owner' ? (isAr ? 'بائع' : 'Owner') : (isAr ? 'مستأجر' : 'Renter')}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-deumah-gray-400">
                            {booking.dates} • <strong className="text-deumah-navy-950">{booking.cost}</strong>
                          </p>
                        </div>

                        {/* Booking Status badges */}
                        <div className="self-end sm:self-center">
                          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                            booking.status === 'completed'
                              ? 'bg-deumah-green-50 text-deumah-green-700 border-deumah-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {booking.status === 'completed' ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'طلب معلق' : 'Pending Request')}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PROFILE SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <form onSubmit={handleProfileSave} className="space-y-5">
                <h2 className="text-lg font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'إعدادات الحساب الشخصي' : 'Profile Settings'}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-4 py-2.5 outline-none focus:border-deumah-green-600 bg-deumah-gray-50 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-1.5">
                      {isAr ? 'المحافظة' : 'Governorate'}
                    </label>
                    <select
                      value={governorate}
                      onChange={e => setGovernorate(e.target.value)}
                      className="w-full text-sm border border-deumah-gray-200 rounded-deumah-sm px-3.5 py-2.5 outline-none focus:border-deumah-green-600 bg-white transition cursor-pointer font-semibold text-deumah-gray-700"
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
                  className="w-full bg-deumah-green-700 hover:bg-deumah-green-600 text-white font-bold py-3 rounded-deumah font-heading tracking-wide transition shadow-sm cursor-pointer"
                >
                  {isAr ? 'حفظ التغيرات' : 'Save Changes'}
                </button>

              </form>
            )}

          </div>

        </div>

      </main>

      {/* Success Notification Toast Popup */}
      {showToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-deumah-navy-950 border border-white/10 text-white px-5 py-3 rounded-deumah shadow-deumah-search flex items-center gap-3 animate-slide-in font-medium">
          <span className="size-5 rounded-full bg-deumah-green-700 text-white flex items-center justify-center font-bold text-xs">✓</span>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
