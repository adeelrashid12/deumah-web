'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { HeartIcon, PinIcon } from './icons';
import { supabase } from '@/lib/supabase';

type Props = {
  id?: string;
  title: string;
  price: string;
  location: string;
  image: string;
  badge: string;
  badgeTone?: 'rent' | 'sell';
  locale?: string;
};

export function ListingCard({ id = '1', title, price, location, image, badge, badgeTone = 'rent', locale = 'en' }: Props) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isAr = locale === 'ar';

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && user) {
        setCurrentUser(user);
        // Check if already favorited
        supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', id)
          .single()
          .then(({ data }) => {
            if (data && active) setIsFavorited(true);
          });
      }
    });
    return () => { active = false; };
  }, [id]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Copy mockup link to clipboard
    const dummyUrl = `${window.location.origin}/${locale}/listings/${id}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      triggerToast(isAr ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
    });
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      triggerToast(isAr ? 'يرجى تسجيل الدخول للحفظ' : 'Please log in to save');
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        const { error } = await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('listing_id', id);
        if (error) {
          setIsFavorited(true);
          throw error;
        }
      } else {
        setIsFavorited(true);
        const { error } = await supabase.from('favorites').insert({ user_id: currentUser.id, listing_id: id });
        if (error) {
          setIsFavorited(false);
          throw error;
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast(isAr ? 'حدث خطأ!' : 'An error occurred!');
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-deumah border border-deumah-gray-200 bg-white shadow-deumah-card hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      {/* Toast Alert */}
      {showToast && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30 bg-deumah-navy-950/90 text-white text-xs px-3 py-1.5 rounded-deumah shadow-md pointer-events-none transition-all duration-300 font-medium">
          {toastMsg}
        </div>
      )}

      <div>
        <Link href={`/listings/${id}`} className="block relative aspect-[4/3] overflow-hidden bg-deumah-gray-200">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            sizes="(max-width: 768px) 80vw, 240px"
          />
          <span className={`absolute bottom-2 start-2 rounded-md px-2 py-1 text-xs font-semibold text-white z-10 ${badgeTone === 'sell' ? 'bg-deumah-orange-600' : 'bg-deumah-green-700'}`}>
            {badge}
          </span>
        </Link>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/listings/${id}`} className="hover:text-deumah-green-700 transition">
              <h3 className="line-clamp-2 font-medium text-deumah-navy-950">{title}</h3>
            </Link>
            
            <div className="flex gap-1 shrink-0">
              {/* Share Button */}
              <button 
                type="button" 
                onClick={handleShare}
                aria-label="Share listing" 
                className="rounded-full p-1.5 hover:bg-deumah-gray-100 text-deumah-gray-400 hover:text-deumah-navy-950 transition"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path strokeLinecap="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                </svg>
              </button>

              {/* Heart/Favorite Button */}
              <button 
                type="button" 
                onClick={handleFavorite}
                aria-label="Add to favorites" 
                className={`rounded-full p-1.5 hover:bg-deumah-gray-100 transition ${isFavorited ? 'text-red-500' : 'text-deumah-gray-400 hover:text-red-500'}`}
              >
                <HeartIcon className="size-5" fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <p className="mt-2 font-semibold text-deumah-navy-950">{price}</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-deumah-gray-100 mt-2">
        <p className="flex items-center gap-1 text-xs text-deumah-gray-500 mt-2">
          <PinIcon className="size-3.5"/>
          {location}
        </p>

        <Link 
          href={`/listings/${id}`} 
          className="text-xs font-semibold text-deumah-green-700 hover:text-deumah-green-600 transition flex items-center gap-0.5 mt-2"
        >
          {isAr ? 'عرض التفاصيل' : 'View Details'}
          <svg className={`size-3.5 transform ${isAr ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
