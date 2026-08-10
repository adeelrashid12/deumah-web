'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
  type: 'sell' | 'rent';
  status: 'active' | 'paused' | 'sold' | 'rented' | 'approved' | 'pending' | 'rejected';
  views: number;
  favorites: number;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
}

export interface ChatThread {
  id: string;
  listing_id: string;
  listing_title: string;
  other_user_id: string;
  other_user_name: string;
  messages: ChatMessage[];
  last_message: ChatMessage;
}

export interface OfferItem {
  id: string;
  listing_id: string;
  listing_title?: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
}

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const catT: Record<string, string> = {
    cars: 'سيارات',
    properties: 'عقارات',
    electronics: 'إلكترونيات',
    furniture: 'أثاث منزلي',
    services: 'خدمات',
    tools: 'معدات',
    fashion: 'أزياء',
    kids: 'أطفال',
    hobbies: 'هوايات',
    wedding_halls: 'قاعات أفراح',
    chalets: 'شاليهات'
  };

  const formatPrice = (priceStr: string, isAr: boolean) => {
    const parts = priceStr.split(' ');
    if (parts.length < 2) return priceStr;
    const val = parts[0];
    const curr = parts[1];
    const num = Number(val);
    if (isNaN(num)) return priceStr;
    
    if (isAr) {
      const formattedNum = num.toLocaleString('ar-EG');
      const currencyAr = curr === 'YER' ? 'ر.ي' : curr === 'SAR' ? 'ر.س' : curr === 'USD' ? '$' : curr;
      return `${formattedNum} ${currencyAr}`;
    }
    return `${num.toLocaleString('en-US')} ${curr}`;
  };

  // Tabs navigation state
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'listings' | 'messages' | 'offers' | 'saved' | 'support' | 'profile' | 'settings'>('listings');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['listings', 'messages', 'offers', 'saved', 'support', 'profile', 'settings'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Persist active tab to URL so that refreshes don't lose position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab);
        window.history.replaceState(null, '', url.toString());
      }
    }
  }, [activeTab]);

  // Offers State
  const [offersList, setOffersList] = useState<OfferItem[]>([]);

  // Listings State
  const [listingsList, setListingsList] = useState<ListingItem[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);

  // Messaging State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockedByUsers, setBlockedByUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [threads, activeThreadId]);

  // Support Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketReply, setTicketReply] = useState('');

  useEffect(() => {
    if (activeThreadId && currentUser && threads.length > 0) {
      const thread = threads.find(t => t.id === activeThreadId);
      if (thread) {
        supabase
          .from('messages')
          .update({ read: true })
          .eq('listing_id', thread.listing_id)
          .eq('receiver_id', currentUser.id)
          .eq('sender_id', thread.other_user_id)
          .eq('read', false)
          .then();
      }
    }
  }, [activeThreadId, currentUser, threads]);

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
        // 0. Parallelize initial basic data fetching
        const [
          { data: myBlocks },
          { data: blockedMe },
          { data: myMutes },
          { data: profile },
          { data: listings },
          { data: sentMessages },
          { data: receivedMessages },
          { data: offersData },
          { data: favData },
          { data: supportTicketsData }
        ] = await Promise.all([
          supabase.from('user_blocks').select('blocked_id').eq('blocker_id', user.id),
          supabase.from('user_blocks').select('blocker_id').eq('blocked_id', user.id),
          supabase.from('user_mutes').select('muted_id').eq('muter_id', user.id),
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('listings').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').eq('sender_id', user.id),
          supabase.from('messages').select('*').eq('receiver_id', user.id),
          supabase.from('offers').select('*').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).order('created_at', { ascending: false }),
          supabase.from('favorites').select('listing_id, listings(id, title_en, title_ar, price, currency, images, type)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        if (myBlocks) setBlockedUsers(myBlocks.map(b => b.blocked_id));
        if (blockedMe) setBlockedByUsers(blockedMe.map(b => b.blocker_id));
        if (myMutes) setMutedUsers(myMutes.map(m => m.muted_id));

        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setGovernorate(profile.governorate || 'sanaa_city');
        }

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

        // 3. Process messages into threads
        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        const threadMap = new Map<string, ChatThread>();
        
        // Collect all IDs for bulk fetch
        const listingIdsToFetch = new Set<string>();
        const userIdsToFetch = new Set<string>();

        for (const msg of allMessages) {
          const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (!otherUserId) continue;
          const threadId = `${msg.listing_id}_${otherUserId}`;
          
          if (!threadMap.has(threadId)) {
            listingIdsToFetch.add(msg.listing_id);
            userIdsToFetch.add(otherUserId);
            threadMap.set(threadId, {
              id: threadId,
              listing_id: msg.listing_id,
              listing_title: 'Ad', // Placeholder
              other_user_id: otherUserId,
              other_user_name: 'User', // Placeholder
              messages: [],
              last_message: msg
            });
          }
          const thread = threadMap.get(threadId)!;
          thread.messages.push(msg);
          thread.last_message = msg;
        }

        if (offersData && offersData.length > 0) {
          for (const off of offersData) {
            listingIdsToFetch.add(off.listing_id);
            const otherUserId = off.buyer_id === user.id ? off.seller_id : off.buyer_id;
            userIdsToFetch.add(otherUserId);
          }
        }

        // Bulk Fetch Details
        const [ { data: fetchedListings }, { data: fetchedProfiles } ] = await Promise.all([
          listingIdsToFetch.size > 0 ? supabase.from('listings').select('id, title_en, title_ar').in('id', Array.from(listingIdsToFetch)) : Promise.resolve({ data: [] }),
          userIdsToFetch.size > 0 ? supabase.from('profiles').select('id, full_name, email').in('id', Array.from(userIdsToFetch)) : Promise.resolve({ data: [] })
        ]);

        const listingDict = new Map((fetchedListings || []).map(l => [l.id, l]));
        const profileDict = new Map((fetchedProfiles || []).map(p => [p.id, p]));

        // Hydrate Threads
        const threadArray = Array.from(threadMap.values()).map(thread => {
          const lData = listingDict.get(thread.listing_id);
          const pData = profileDict.get(thread.other_user_id);
          thread.listing_title = lData ? (isAr ? lData.title_ar : lData.title_en) : 'Ad';
          thread.other_user_name = pData ? (pData.full_name || pData.email.split('@')[0]) : 'User';
          return thread;
        }).sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());
        
        setThreads(threadArray);

        // Hydrate Offers
        if (offersData && offersData.length > 0) {
          const processedOffers = offersData.map(off => {
            const lData = listingDict.get(off.listing_id);
            const otherUserId = off.buyer_id === user.id ? off.seller_id : off.buyer_id;
            const pData = profileDict.get(otherUserId);
            
            return {
              ...off,
              listing_title: lData ? (isAr ? lData.title_ar : lData.title_en) : 'Ad',
              buyer_name: off.buyer_id === user.id ? (isAr ? 'أنت' : 'You') : (pData ? (pData.full_name || pData.email.split('@')[0]) : 'Buyer'),
              seller_name: off.seller_id === user.id ? (isAr ? 'أنت' : 'You') : (pData ? (pData.full_name || pData.email.split('@')[0]) : 'Seller')
            };
          });
          setOffersList(processedOffers);
        }

        if (favData) {
          setSavedListings(favData.map(f => ({
            id: f.listing_id,
            titleEn: (f.listings as any).title_en,
            titleAr: (f.listings as any).title_ar,
            price: `${(f.listings as any).price} ${(f.listings as any).currency || 'USD'}`,
            image: ((f.listings as any).images && (f.listings as any).images.length > 0) ? (f.listings as any).images[0] : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80',
            type: (f.listings as any).type
          })));
        }

        if (supportTicketsData) {
          setTickets(supportTicketsData);
        }
        
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      }
    }
    loadDashboardData();

    let channel: any;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase.channel('realtime:chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.receiver_id === user.id || newMsg.sender_id === user.id) {
            setThreads(prev => {
              const otherUserId = newMsg.sender_id === user.id ? newMsg.receiver_id : newMsg.sender_id;
              const threadId = `${newMsg.listing_id}_${otherUserId}`;
              const exists = prev.find(t => t.id === threadId);
              if (exists) {
                return prev.map(t => {
                  if (t.id === threadId) {
                    if (t.messages.find((m: any) => m.id === newMsg.id)) return t;
                    return { ...t, messages: [...t.messages, newMsg], last_message: newMsg };
                  }
                  return t;
                }).sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());
              } else {
                loadDashboardData(); 
                return prev;
              }
            });
          }
        })
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleToggleBlock = async (userIdToBlock: string) => {
    try {
      if (blockedUsers.includes(userIdToBlock)) {
        await supabase.from('user_blocks').delete().eq('blocker_id', currentUser.id).eq('blocked_id', userIdToBlock);
        setBlockedUsers(prev => prev.filter(id => id !== userIdToBlock));
        triggerToast(isAr ? 'تم إلغاء الحظر' : 'User unblocked');
      } else {
        await supabase.from('user_blocks').insert({ blocker_id: currentUser.id, blocked_id: userIdToBlock });
        setBlockedUsers(prev => [...prev, userIdToBlock]);
        triggerToast(isAr ? 'تم حظر المستخدم' : 'User blocked');
      }
    } catch (e) {
      console.error(e);
      triggerToast(isAr ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleToggleMute = async (userIdToMute: string) => {
    try {
      if (mutedUsers.includes(userIdToMute)) {
        await supabase.from('user_mutes').delete().eq('muter_id', currentUser.id).eq('muted_id', userIdToMute);
        setMutedUsers(prev => prev.filter(id => id !== userIdToMute));
        triggerToast(isAr ? 'تم إلغاء الكتم' : 'User unmuted');
      } else {
        await supabase.from('user_mutes').insert({ muter_id: currentUser.id, muted_id: userIdToMute });
        setMutedUsers(prev => [...prev, userIdToMute]);
        triggerToast(isAr ? 'تم كتم إشعارات المستخدم' : 'User muted');
      }
    } catch (e) {
      console.error(e);
      triggerToast(isAr ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !currentUser) return;
    
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    try {
      await supabase.from('user_reports').insert({
        reporter_id: currentUser.id,
        reported_id: thread.other_user_id,
        reason: reportReason,
        details: reportDetails
      });
      triggerToast(isAr ? 'تم إرسال البلاغ للإدارة بنجاح' : 'Report sent successfully');
      setReportModalOpen(false);
      setReportDetails('');
    } catch (e) {
      console.error(e);
      triggerToast(isAr ? 'فشل إرسال البلاغ' : 'Failed to send report');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyText.trim() || !currentUser) return;

    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) return;

    if (blockedUsers.includes(thread.other_user_id)) {
      triggerToast(isAr ? 'لقد قمت بحظر هذا المستخدم.' : 'You have blocked this user.');
      return;
    }
    if (blockedByUsers.includes(thread.other_user_id)) {
      triggerToast(isAr ? 'لا يمكنك إرسال رسائل لهذا المستخدم.' : 'You cannot send messages to this user.');
      return;
    }

    try {
      const { data, error } = await supabase.from('messages').insert({
        listing_id: thread.listing_id,
        sender_id: currentUser.id,
        receiver_id: thread.other_user_id,
        message: replyText
      }).select().single();

      if (error) throw error;
      if (data) {
        // Optimistically update UI
        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: [...t.messages, data as unknown as ChatMessage],
              last_message: data as unknown as ChatMessage
            };
          }
          return t;
        }).sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()));
        setReplyText('');
      }
    } catch (e) {
      console.error(e);
      triggerToast(isAr ? 'فشل إرسال الرسالة.' : 'Failed to send message.');
    }
  };

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

  const handleMarkComplete = async (id: string, type: 'sell' | 'rent') => {
    const nextStatus = type === 'sell' ? 'sold' : 'rented';

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      setListingsList(prev => prev.map(l => l.id === id ? { ...l, status: nextStatus } : l));
      triggerToast(
        isAr 
          ? (type === 'sell' ? 'تم تمييز الإعلان كمباع!' : 'تم تمييز الإعلان كمؤجر!') 
          : (type === 'sell' ? 'Listing marked as Sold!' : 'Listing marked as Rented!')
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
          status: 'pending'
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

  const handleUpdateOfferStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('offers')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      triggerToast(
        isAr 
          ? (newStatus === 'accepted' ? 'تم قبول العرض!' : 'تم رفض العرض!') 
          : (newStatus === 'accepted' ? 'Offer Accepted!' : 'Offer Rejected!')
      );
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleMessageOfferUser = (offer: OfferItem) => {
    const otherUserId = offer.buyer_id === currentUser?.id ? offer.seller_id : offer.buyer_id;
    const threadId = `${offer.listing_id}_${otherUserId}`;
    
    if (!threads.find(t => t.id === threadId)) {
      const newThread: ChatThread = {
        id: threadId,
        listing_id: offer.listing_id,
        listing_title: offer.listing_title || 'Ad',
        other_user_id: otherUserId,
        other_user_name: offer.buyer_id === currentUser?.id ? (offer.seller_name || 'Seller') : (offer.buyer_name || 'Buyer'),
        messages: [],
        last_message: { created_at: new Date().toISOString(), message: '' } as any
      };
      setThreads(prev => [newThread, ...prev]);
    }
    
    setActiveTab('messages');
    setActiveThreadId(threadId);
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
      triggerToast(isAr ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred');
    }
  };

  const handleRemoveSavedListing = async (listingId: string) => {
    if (!currentUser) return;
    try {
      setSavedListings(prev => prev.filter(s => s.id !== listingId));
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('listing_id', listingId);
      triggerToast(isAr ? 'تم إزالة الإعلان من المحفوظات' : 'Listing removed from saved items');
    } catch (e) {
      console.error(e);
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
            { id: 'listings', label: isAr ? 'الإعلانات النشطة' : 'Active Listings', value: listingsList.filter(l => l.status === 'active' || l.status === 'approved').length, icon: '🚗' },
            { id: 'listings', label: isAr ? 'المشاهدات' : 'Total Views', value: listingsList.reduce((acc, l) => acc + l.views, 0), icon: '👁️' },
            { id: 'saved', label: isAr ? 'المفضلة' : 'Favorites', value: savedListings.length, icon: '⭐' },
            { id: 'messages', label: isAr ? 'الرسائل الواردة' : 'Inbox Messages', value: threads.length, icon: '💬' },
            { id: 'offers', label: isAr ? 'طلبات معلقة' : 'Pending Requests', value: offersList.filter(o => o.status === 'pending').length, icon: '⏳' }
          ].map((stat, idx) => (
            <button key={idx} type="button" onClick={() => setActiveTab(stat.id as never)} className="bg-white border border-deumah-gray-200 rounded-deumah p-3 flex items-center gap-3 shadow-xs hover:border-deumah-green-500 transition cursor-pointer text-left rtl:text-right w-full">
              <span className="text-xl shrink-0">{stat.icon}</span>
              <div>
                <span className="block text-[9px] font-bold text-deumah-gray-400 uppercase tracking-wider leading-none mb-1">
                  {stat.label}
                </span>
                <p className="text-sm font-black text-deumah-navy-950 leading-none">{stat.value}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
          
          {/* Sidebar Tabs */}
          <aside className="bg-white rounded-deumah border border-deumah-gray-200 p-3 shadow-sm flex flex-row overflow-x-auto md:flex-col gap-1.5 scrollbar-none snap-x snap-mandatory">
            {[
              { id: 'listings', labelEn: '🚗 My Listings', labelAr: '🚗 إعلاناتي' },
              { id: 'messages', labelEn: '💬 Messages', labelAr: '💬 الرسائل' },
              { id: 'offers', labelEn: '🤝 Offers', labelAr: '🤝 العروض' },
              { id: 'saved', labelEn: '⭐ Saved Listings', labelAr: '⭐ المحفوظات' },
              { id: 'support', labelEn: '💬 Support Tickets', labelAr: '💬 تذاكر الدعم' },
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
                            <Link href={`/listings/${item.id}`} className="hover:underline">
                              <h3 className="text-sm font-extrabold text-deumah-navy-950">
                                {isAr ? item.titleAr : item.titleEn}
                              </h3>
                            </Link>
                            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                              item.status === 'active' || item.status === 'approved'
                                ? 'bg-deumah-green-50 text-deumah-green-700 border-deumah-green-200'
                                : item.status === 'paused'
                                ? 'bg-deumah-gray-50 text-deumah-gray-500 border-deumah-gray-200'
                                : item.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {(item.status === 'active' || item.status === 'approved') && (isAr ? 'نشط' : 'Active')}
                              {item.status === 'paused' && (isAr ? 'موقوف مؤقتاً' : 'Paused')}
                              {item.status === 'sold' && (isAr ? 'مباع' : 'Sold')}
                              {item.status === 'rented' && (isAr ? 'مؤجر' : 'Rented')}
                              {item.status === 'pending' && (isAr ? 'قيد المراجعة' : 'Pending Approval')}
                              {item.status === 'rejected' && (isAr ? 'مرفوض' : 'Rejected')}
                            </span>
                            <span className="text-[9px] font-bold bg-deumah-navy-50 text-deumah-navy-900 px-2 py-0.5 rounded">
                              {item.type === 'sell' ? (isAr ? 'للبيع' : 'For Sale') : (isAr ? 'للإيجار' : 'For Rent')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-semibold text-deumah-gray-400">
                            <span>{isAr ? (catT[item.category] || item.category) : item.category}</span>
                            <span>•</span>
                            <span className="text-deumah-green-700 font-bold">{formatPrice(item.price, isAr)}</span>
                            <span>•</span>
                            <span>👁️ {item.views} {isAr ? 'مشاهدة' : 'views'}</span>
                          </div>
                        </div>

                        {/* Interactive Listing Action Buttons Toolbar */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-extrabold self-stretch lg:self-auto justify-end">
                          <Link 
                            href={`/listings/${item.id}`}
                            className="px-2.5 py-1.5 border border-deumah-gray-200 rounded hover:bg-deumah-gray-50 text-deumah-gray-700 transition shadow-xs flex items-center gap-1"
                          >
                            👁️ {isAr ? 'عرض' : 'View'}
                          </Link>
                          
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
                              ✓ {item.type === 'sell' ? (isAr ? 'تم البيع' : 'Mark Sold') : (isAr ? 'تم التأجير' : 'Mark Rented')}
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
                
                {/* Dynamic Chat Layout */}
                <div className="border border-deumah-gray-200 rounded-2xl h-[600px] grid grid-cols-1 md:grid-cols-[320px_1fr] overflow-hidden shadow-sm bg-white">
                  
                  {/* Left Threads Column */}
                  <div className={`border-r rtl:border-r-0 rtl:border-l border-deumah-gray-200 bg-deumah-gray-50/30 flex flex-col ${activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-deumah-gray-200 bg-white">
                      <h3 className="font-extrabold text-deumah-navy-950 text-sm">{isAr ? 'المحادثات' : 'Conversations'}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
                      {threads.length === 0 ? (
                        <div className="p-8 text-center text-xs text-deumah-gray-400 font-semibold flex flex-col items-center gap-3">
                          <span className="text-4xl opacity-20">💬</span>
                          {isAr ? 'لا توجد رسائل بعد.' : 'No messages yet.'}
                        </div>
                      ) : (
                        threads.map(thread => {
                          const isActive = activeThreadId === thread.id;
                          return (
                            <div 
                              key={thread.id} 
                              onClick={() => setActiveThreadId(thread.id)}
                              className={`p-3 cursor-pointer rounded-xl transition-all flex items-start gap-3 ${
                                isActive 
                                ? 'bg-white shadow-sm ring-1 ring-deumah-green-600/20' 
                                : 'hover:bg-deumah-gray-100/50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-deumah-navy-50 flex items-center justify-center shrink-0 border border-deumah-navy-100 font-extrabold text-deumah-navy-900 shadow-inner">
                                {thread.other_user_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <h4 className={`text-xs font-extrabold truncate ${isActive ? 'text-deumah-green-700' : 'text-deumah-navy-950'}`}>
                                    {thread.other_user_name}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-deumah-gray-500 font-bold truncate mb-1 bg-deumah-gray-100/80 inline-block px-1.5 py-0.5 rounded">
                                  {thread.listing_title}
                                </p>
                                <p className="text-[11px] text-deumah-gray-500 font-medium truncate">
                                  {thread.last_message.message}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Chat panel */}
                  <div className={`flex flex-col bg-[#F8F9FA] relative h-[600px] ${!activeThreadId ? 'hidden md:flex' : 'flex'}`}>
                    {!activeThreadId ? (
                      <div className="flex flex-col items-center justify-center h-full text-deumah-gray-400 space-y-4">
                        <div className="w-20 h-20 bg-deumah-gray-100 rounded-full flex items-center justify-center shadow-inner">
                          <span className="text-3xl opacity-50">✉️</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wider">
                          {isAr ? 'اختر محادثة للبدء' : 'Select a conversation'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Chat Header */}
                        {threads.find(t => t.id === activeThreadId) && (
                          <div className="h-16 bg-white border-b border-deumah-gray-200 flex justify-between items-center px-4 sm:px-6 shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setActiveThreadId(null)}
                                className="md:hidden w-8 h-8 flex items-center justify-center bg-deumah-gray-100 rounded-full text-deumah-gray-600"
                              >
                                <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-deumah-green-600 to-deumah-green-400 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white">
                                {threads.find(t => t.id === activeThreadId)?.other_user_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-extrabold text-deumah-navy-950 text-sm">
                                  {threads.find(t => t.id === activeThreadId)?.other_user_name}
                                </h3>
                                <p className="text-[10px] text-deumah-green-700 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-deumah-green-500 animate-pulse"></span>
                                  {threads.find(t => t.id === activeThreadId)?.listing_title}
                                </p>
                                </div>
                              </div>
                              <div className="relative">
                                <button
                                  onClick={() => setActiveDropdownId(activeDropdownId === activeThreadId ? null : activeThreadId)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-deumah-gray-100 text-deumah-gray-600 transition"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </button>
                                
                                {activeDropdownId === activeThreadId && (
                                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white border border-deumah-gray-200 rounded-deumah shadow-lg z-50 overflow-hidden">
                                    <button
                                      onClick={() => {
                                        handleToggleMute(threads.find(t => t.id === activeThreadId)?.other_user_id!);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-left rtl:text-right px-4 py-3 text-sm text-deumah-navy-900 hover:bg-deumah-gray-50 flex items-center gap-2 font-bold transition border-b border-deumah-gray-100 cursor-pointer"
                                    >
                                      🔇 {mutedUsers.includes(threads.find(t => t.id === activeThreadId)?.other_user_id || '') ? (isAr ? 'إلغاء كتم الإشعارات' : 'Unmute User') : (isAr ? 'كتم الإشعارات' : 'Mute User')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const id = threads.find(t => t.id === activeThreadId)?.other_user_id;
                                        if (id) handleToggleBlock(id);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-left rtl:text-right px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold transition border-b border-deumah-gray-100 cursor-pointer"
                                    >
                                      🚫 {blockedUsers.includes(threads.find(t => t.id === activeThreadId)?.other_user_id || '') ? (isAr ? 'إلغاء الحظر' : 'Unblock User') : (isAr ? 'حظر المستخدم' : 'Block User')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReportModalOpen(true);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-left rtl:text-right px-4 py-3 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 font-bold transition cursor-pointer"
                                    >
                                      ⚠️ {isAr ? 'إبلاغ عن المستخدم' : 'Report User'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                        )}

                        {/* Chat Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
                          {threads.find(t => t.id === activeThreadId)?.messages.map((msg, idx, arr) => {
                            const isMe = msg.sender_id === currentUser?.id;
                            const showAvatar = !isMe && (idx === 0 || arr[idx - 1].sender_id !== msg.sender_id);
                            
                            return (
                              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${showAvatar ? 'bg-deumah-navy-100 text-deumah-navy-700 font-bold text-[10px]' : 'bg-transparent'}`}>
                                    {showAvatar ? threads.find(t => t.id === activeThreadId)?.other_user_name.charAt(0).toUpperCase() : ''}
                                  </div>
                                )}
                                
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                                  <div 
                                    className={`px-4 py-2.5 text-[13px] font-medium leading-relaxed shadow-sm ${
                                      isMe 
                                        ? 'bg-deumah-green-700 text-white rounded-2xl rounded-br-sm rtl:rounded-br-2xl rtl:rounded-bl-sm' 
                                        : 'bg-white text-deumah-navy-950 border border-deumah-gray-200 rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                  </div>
                                  <span className={`text-[9px] font-bold mt-1.5 text-deumah-gray-400 ${isMe ? 'mr-1 rtl:mr-0 rtl:ml-1' : 'ml-1 rtl:ml-0 rtl:mr-1'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Chat Input */}
                        <div className="bg-white p-3 sm:p-4 border-t border-deumah-gray-200 shrink-0">
                          {blockedUsers.includes(threads.find(t => t.id === activeThreadId)?.other_user_id || '') ? (
                            <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                              🚫 {isAr ? 'لقد قمت بحظر هذا المستخدم. لا يمكنك إرسال رسائل إليه.' : 'You have blocked this user. Unblock to send messages.'}
                            </div>
                          ) : blockedByUsers.includes(threads.find(t => t.id === activeThreadId)?.other_user_id || '') ? (
                            <div className="text-center p-4 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-gray-200">
                              🔒 {isAr ? 'لا يمكنك إرسال رسائل لهذا المستخدم.' : 'You cannot send messages to this user.'}
                            </div>
                          ) : (
                            <>
                              <form onSubmit={handleSendReply} className="flex items-end gap-2 sm:gap-3 max-w-4xl mx-auto">
                                <div className="flex-1 bg-deumah-gray-50 border border-deumah-gray-200 rounded-xl flex items-end p-1 shadow-inner focus-within:ring-2 focus-within:ring-deumah-green-600/20 focus-within:border-deumah-green-600 transition-all">
                                  <textarea 
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder={isAr ? 'اكتب رسالة هنا...' : 'Type a message...'} 
                                    className="w-full text-sm bg-transparent border-none outline-none resize-none px-3 py-2.5 max-h-32 min-h-[44px]"
                                    rows={1}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendReply(e as any);
                                      }
                                    }}
                                  />
                                </div>
                                <button 
                                  type="submit"
                                  disabled={!replyText.trim()}
                                  className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] bg-deumah-green-700 text-white rounded-xl flex items-center justify-center hover:bg-deumah-green-600 transition disabled:opacity-40 disabled:hover:bg-deumah-green-700 shadow-md shrink-0 cursor-pointer"
                                >
                                  <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </button>
                              </form>
                              <div className="text-center mt-2 hidden sm:block">
                                <p className="text-[10px] text-deumah-gray-400 font-medium">
                                  {isAr ? 'اضغط Enter للإرسال' : 'Press Enter to send'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* OFFERS TAB */}
            {activeTab === 'offers' && (
              <div className="space-y-4">
                <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                  {isAr ? 'عروض الشراء والتفاوض' : 'Offers & Negotiations'}
                </h2>

                <div className="border border-deumah-gray-200 rounded-deumah overflow-hidden divide-y divide-deumah-gray-200 bg-[#F8F9FA]">
                  {offersList.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                      <span className="text-4xl opacity-20 mb-3 block">🤝</span>
                      <p className="text-xs text-deumah-gray-400 font-bold uppercase tracking-wider">
                        {isAr ? 'لا توجد عروض حالياً' : 'No offers available yet'}
                      </p>
                    </div>
                  ) : (
                    offersList.map(offer => {
                      const isOutgoing = offer.buyer_id === currentUser?.id;
                      return (
                        <div key={offer.id} className="p-4 sm:p-5 bg-white hover:bg-deumah-gray-50 transition flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                offer.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                offer.status === 'accepted' ? 'bg-deumah-green-100 text-deumah-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {isAr ? (
                                  offer.status === 'pending' ? 'معلق' : offer.status === 'accepted' ? 'مقبول' : 'مرفوض'
                                ) : offer.status}
                              </span>
                              <span className="text-xs text-deumah-gray-400 font-bold">
                                {new Date(offer.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                              </span>
                            </div>
                            
                            <h3 className="text-sm font-extrabold text-deumah-navy-950">
                              {offer.listing_title}
                            </h3>
                            
                            <p className="text-xs text-deumah-gray-500 font-medium flex items-center gap-1.5">
                              {isOutgoing ? (
                                <><span>↗️</span> {isAr ? 'أنت قدمت عرضاً إلى' : 'You made an offer to'} <span className="font-bold">{offer.seller_name}</span></>
                              ) : (
                                <><span>↙️</span> <span className="font-bold">{offer.buyer_name}</span> {isAr ? 'قدم عرضاً' : 'made an offer'}</>
                              )}
                            </p>

                            {offer.message && (
                              <div className="mt-2 text-xs italic text-deumah-gray-600 bg-deumah-gray-100 p-2 rounded-deumah-sm border-l-2 border-deumah-gray-300">
                                "{offer.message}"
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:items-end gap-2 shrink-0">
                            <div className="text-xl font-black text-deumah-green-700">
                              ${offer.amount.toLocaleString()}
                            </div>
                            
                            {!isOutgoing && offer.status === 'pending' && (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => handleMessageOfferUser(offer)}
                                  className="flex-1 sm:flex-none bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-deumah-sm text-xs font-bold transition cursor-pointer"
                                >
                                  {isAr ? 'رسالة' : 'Message'}
                                </button>
                                <button 
                                  onClick={() => handleUpdateOfferStatus(offer.id, 'accepted')}
                                  className="flex-1 sm:flex-none bg-deumah-green-700 hover:bg-deumah-green-600 text-white px-4 py-2 rounded-deumah-sm text-xs font-bold transition shadow-sm cursor-pointer"
                                >
                                  {isAr ? 'قبول' : 'Accept'}
                                </button>
                                <button 
                                  onClick={() => handleUpdateOfferStatus(offer.id, 'rejected')}
                                  className="flex-1 sm:flex-none bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-deumah-sm text-xs font-bold transition cursor-pointer"
                                >
                                  {isAr ? 'رفض' : 'Reject'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
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
                  {savedListings.length === 0 ? (
                    <div className="p-8 text-center text-deumah-gray-400 col-span-2">
                      {isAr ? 'لا توجد إعلانات محفوظة.' : 'No saved listings yet.'}
                    </div>
                  ) : (
                    savedListings.map(saved => (
                      <div key={saved.id} className="border border-deumah-gray-200 rounded-deumah overflow-hidden flex shadow-xs bg-white hover:bg-deumah-gray-50 transition">
                        <img src={saved.image} alt={saved.titleEn} className="w-24 object-cover" />
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-extrabold text-deumah-navy-950 text-xs line-clamp-2">
                              {isAr ? saved.titleAr : saved.titleEn}
                            </h3>
                            <p className="text-[11px] font-black text-deumah-green-700 mt-1">
                              {saved.price}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Link href={`/listings/${saved.id}`} className="text-[10px] font-bold text-deumah-green-700 hover:underline">
                              {isAr ? 'عرض الإعلان' : 'View Ad'}
                            </Link>
                            <button 
                              onClick={() => handleRemoveSavedListing(saved.id)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer transition"
                            >
                              {isAr ? 'إزالة' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                    <span>{isAr ? 'الاشتراك في النشرة الإخبارية وعروض دومه' : 'Subscribe to Deumah newsletters and deals'}</span>
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

            {/* SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                  <h2 className="text-md font-bold text-deumah-navy-950 font-heading">
                                    {isAr ? 'تذاكر الدعم الفني' : 'Customer Support Tickets'}
                                  </h2>
                                  {activeTicket && (
                                    <button 
                                      onClick={() => setActiveTicket(null)}
                                      className="text-xs font-bold text-deumah-gray-500 hover:text-deumah-navy-950"
                                    >
                                      {isAr ? '← العودة للقائمة' : '← Back to List'}
                                    </button>
                                  )}
                                </div>

                                {!activeTicket ? (
                                  <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Create Ticket Form */}
                                    <div className="bg-deumah-gray-50 p-5 rounded-deumah border border-deumah-gray-200 h-fit">
                                      <h3 className="text-sm font-bold text-deumah-navy-950 mb-4">{isAr ? 'فتح تذكرة جديدة' : 'Open a New Ticket'}</h3>
                                      <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!newTicketSubject.trim() || !newTicketMessage.trim()) return triggerToast(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
                                        
                                        try {
                                          const { data: ticket, error: ticketError } = await supabase.from('support_tickets').insert({ user_id: currentUser.id, subject: newTicketSubject }).select().single();
                                          if (ticketError) throw ticketError;
                                          
                                          const { error: msgError } = await supabase.from('ticket_messages').insert({ ticket_id: ticket.id, sender_id: currentUser.id, message: newTicketMessage });
                                          if (msgError) throw msgError;
                                          
                                          setNewTicketSubject('');
                                          setNewTicketMessage('');
                                          setTickets([ticket, ...tickets]);
                                          triggerToast(isAr ? 'تم فتح التذكرة بنجاح' : 'Ticket opened successfully');
                                        } catch (err: any) {
                                          triggerToast(err.message);
                                        }
                                      }} className="space-y-3">
                                        <input 
                                          type="text" 
                                          placeholder={isAr ? 'الموضوع (مثال: مشكلة في الإعلان)' : 'Subject (e.g. Issue with my ad)'}
                                          value={newTicketSubject}
                                          onChange={(e) => setNewTicketSubject(e.target.value)}
                                          className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none text-xs font-semibold focus:border-deumah-green-700"
                                          required
                                        />
                                        <textarea 
                                          placeholder={isAr ? 'اشرح مشكلتك بالتفصيل...' : 'Describe your issue in detail...'}
                                          value={newTicketMessage}
                                          onChange={(e) => setNewTicketMessage(e.target.value)}
                                          className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none text-xs h-24 resize-none focus:border-deumah-green-700"
                                          required
                                        />
                                        <button type="submit" className="w-full bg-deumah-navy-950 hover:bg-deumah-navy-900 text-white font-bold text-xs py-2.5 rounded transition">
                                          {isAr ? 'إرسال التذكرة' : 'Submit Ticket'}
                                        </button>
                                      </form>
                                    </div>

                                    {/* Past Tickets List */}
                                    <div className="space-y-3">
                                      <h3 className="text-sm font-bold text-deumah-navy-950 mb-2">{isAr ? 'تذاكري' : 'My Tickets'}</h3>
                                      {tickets.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-deumah-gray-400 font-medium border border-dashed border-deumah-gray-300 rounded-deumah">
                                          {isAr ? 'لا توجد تذاكر دعم سابقة' : 'No past support tickets'}
                                        </div>
                                      ) : (
                                        tickets.map(t => (
                                          <div 
                                            key={t.id} 
                                            onClick={async () => {
                                              setActiveTicket(t);
                                              const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at', { ascending: true });
                                              if (data) setTicketMessages(data);
                                            }}
                                            className="p-4 border border-deumah-gray-200 rounded-deumah hover:bg-deumah-gray-50 transition cursor-pointer flex justify-between items-center"
                                          >
                                            <div>
                                              <h4 className="text-xs font-extrabold text-deumah-navy-950">{t.subject}</h4>
                                              <p className="text-[10px] text-deumah-gray-400 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                              t.status === 'open' ? 'bg-deumah-green-100 text-deumah-green-700' : 
                                              t.status === 'resolved' ? 'bg-blue-100 text-blue-700' : 'bg-deumah-gray-200 text-deumah-gray-700'
                                            }`}>
                                              {t.status}
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border border-deumah-gray-200 rounded-deumah flex flex-col h-[500px] overflow-hidden bg-white">
                                    <div className="bg-deumah-navy-950 p-4 text-white">
                                      <h3 className="font-bold text-sm">{activeTicket.subject}</h3>
                                      <span className="text-[10px] text-white/60">Ticket #{activeTicket.id.split('-')[0]}</span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-deumah-gray-50">
                                      {ticketMessages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                                          <div className={`max-w-[75%] p-3 rounded-lg text-xs shadow-sm ${
                                            msg.is_admin ? 'bg-white border border-deumah-gray-200 text-deumah-navy-950 rounded-tl-none' : 'bg-deumah-green-700 text-white rounded-tr-none'
                                          }`}>
                                            <div className="font-bold mb-1 flex justify-between gap-4">
                                              <span>{msg.is_admin ? 'Support Team' : 'You'}</span>
                                              <span className="text-[9px] opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {activeTicket.status !== 'closed' && (
                                      <form 
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          if (!ticketReply.trim()) return;
                                          try {
                                            const { error } = await supabase.from('ticket_messages').insert({ ticket_id: activeTicket.id, sender_id: currentUser.id, message: ticketReply });
                                            if (error) throw error;
                                            setTicketReply('');
                                            
                                            // Re-fetch messages
                                            const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', activeTicket.id).order('created_at', { ascending: true });
                                            if (data) setTicketMessages(data);
                                          } catch (err: any) {
                                            triggerToast(err.message);
                                          }
                                        }}
                                        className="p-3 border-t border-deumah-gray-200 bg-white flex gap-2"
                                      >
                                        <input
                                          type="text"
                                          value={ticketReply}
                                          onChange={e => setTicketReply(e.target.value)}
                                          placeholder={isAr ? 'اكتب ردك هنا...' : 'Type your reply...'}
                                          className="flex-1 bg-deumah-gray-50 border border-deumah-gray-200 rounded p-2.5 outline-none text-xs focus:border-deumah-green-600"
                                        />
                                        <button type="submit" className="bg-deumah-navy-950 text-white px-5 rounded text-xs font-bold hover:bg-deumah-navy-900 transition">
                                          {isAr ? 'إرسال' : 'Send'}
                                        </button>
                                      </form>
                                    )}
                                    {activeTicket.status === 'closed' && (
                                      <div className="p-3 text-center text-xs font-bold text-deumah-gray-500 bg-deumah-gray-100">
                                        {isAr ? 'هذه التذكرة مغلقة.' : 'This ticket has been closed.'}
                                      </div>
                                    )}
                                  </div>
                                )}
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

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-deumah max-w-md w-full p-6 shadow-deumah-search space-y-4 animate-slide-in">
            <div className="flex justify-between items-center pb-3 border-b border-deumah-gray-100">
              <h3 className="font-extrabold text-red-600 text-base font-heading flex items-center gap-2">
                ⚠️ {isAr ? 'إبلاغ عن المستخدم' : 'Report User'}
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-deumah-gray-400 hover:text-deumah-navy-950 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-deumah-gray-600 mb-2">{isAr ? 'سبب البلاغ' : 'Reason for report'}</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-red-600 bg-white"
                >
                  <option value="spam">{isAr ? 'بريد مزعج / سبام' : 'Spam / Unwanted'}</option>
                  <option value="harassment">{isAr ? 'مضايقة أو إساءة' : 'Harassment or Abuse'}</option>
                  <option value="scam">{isAr ? 'احتيال أو نصب' : 'Scam or Fraud'}</option>
                  <option value="inappropriate">{isAr ? 'محتوى غير لائق' : 'Inappropriate Content'}</option>
                  <option value="other">{isAr ? 'سبب آخر' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-deumah-gray-600 mb-2">{isAr ? 'تفاصيل إضافية (اختياري)' : 'Additional Details (Optional)'}</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder={isAr ? 'يرجى تقديم مزيد من التفاصيل لمساعدتنا...' : 'Please provide more details to help us...'}
                  className="w-full border border-deumah-gray-200 rounded p-2.5 outline-none focus:border-red-600 resize-none h-24"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="w-1/2 border border-deumah-gray-200 py-2.5 rounded font-bold text-deumah-gray-700 hover:bg-deumah-gray-50 transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded font-bold transition shadow-xs cursor-pointer"
                >
                  {isAr ? 'إرسال البلاغ' : 'Submit Report'}
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
