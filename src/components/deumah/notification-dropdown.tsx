'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string;
  read: boolean;
  created_at: string;
}

export function NotificationDropdown({ userId }: { userId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (data) setNotifications(data);
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  };

  const clearAllNotifications = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications([]);
    
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
  };

  const handleToggle = () => {
    if (!open) {
      markAllAsRead();
    }
    setOpen(!open);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'message': return '💬';
      case 'approval': return '✅';
      case 'rejection': return '❌';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-white/10 transition flex items-center justify-center group cursor-pointer" 
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-white/80 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-deumah-navy-950 animate-pulse ring-2 ring-red-500/20"></span>
        )}
      </button>

      {open && (
        <div className={`absolute top-full ${isAr ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-xl shadow-xl border border-deumah-gray-200 overflow-hidden z-50`}>
          <div className="p-4 border-b border-deumah-gray-100 bg-deumah-gray-50 flex justify-between items-center">
            <h3 className="font-extrabold text-deumah-navy-950 text-sm flex items-center justify-between w-full">
              <span>{isAr ? 'الإشعارات' : 'Notifications'}</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="bg-deumah-green-100 text-deumah-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} {isAr ? 'جديد' : 'New'}
                  </span>
                )}
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[10px] text-deumah-gray-400 hover:text-red-500 transition font-bold cursor-pointer"
                  >
                    {isAr ? 'مسح الكل' : 'Clear All'}
                  </button>
                )}
              </div>
            </h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto divide-y divide-deumah-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-deumah-gray-400">
                <span className="text-4xl opacity-20 block mb-2">🔕</span>
                <p className="text-xs font-semibold">{isAr ? 'لا توجد إشعارات' : 'No notifications yet'}</p>
              </div>
            ) : (
              notifications.map(notif => {
                const redirectLink = notif.type === 'offer' ? '/dashboard?tab=offers' : notif.type === 'message' ? '/dashboard?tab=messages' : notif.link || '/dashboard';
                return (
                  <Link 
                    href={redirectLink} 
                    key={notif.id}
                    onClick={() => setOpen(false)}
                    className={`block p-4 hover:bg-deumah-gray-50 transition ${!notif.read ? 'bg-deumah-green-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                    <div className="text-xl shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                    <div>
                      <h4 className="text-xs font-extrabold text-deumah-navy-950">{notif.title}</h4>
                      <p className="text-[11px] text-deumah-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.content}
                      </p>
                      <span className="text-[9px] font-bold text-deumah-gray-400 mt-2 block">
                        {new Date(notif.created_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
