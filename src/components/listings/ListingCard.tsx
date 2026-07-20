import {HeartIcon} from '@/components/icons/Icons';

export type Listing = {
  title: string; 
  price: string; 
  location: string; 
  category: string;
  image: string;
};

export function ListingCard({listing}:{listing:Listing}){
  const isRent = listing.category === 'Rent' || listing.category === 'تأجير';

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full group">
      
      {/* Image and Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500" 
        />
        
        {/* Category Pill */}
        <span className={`absolute start-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-black tracking-wide text-white uppercase shrink-0 ${
          isRent ? 'bg-deumah-green' : 'bg-amber-600'
        }`}>
          {listing.category}
        </span>
        
        {/* Favorite Button */}
        <button aria-label="Favorite" className="absolute end-3 top-3 rounded-full bg-black/30 backdrop-blur-xs p-2 text-white hover:bg-black/50 transition cursor-pointer">
          <HeartIcon className="h-4.5 w-4.5 text-white" />
        </button>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800 tracking-tight line-clamp-2 min-h-[40px]">
            {listing.title}
          </h3>
          <p className="mt-2 text-lg font-black text-emerald-600">
            {listing.price}
          </p>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-bold text-gray-400">
          <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{listing.location}</span>
        </div>
      </div>

    </article>
  );
}
