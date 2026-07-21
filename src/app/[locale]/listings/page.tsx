'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DeumahHeader } from '@/components/deumah/deumah-header';
import { Footer } from '@/components/layout/Footer';
import { ListingCard } from '@/components/deumah/listing-card';

// Mock Listings Data
const ALL_MOCK_LISTINGS = [
  {
    id: '1',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Toyota Land Cruiser 2021',
    titleAr: 'تويوتا لاند كروزر 2021',
    price: 85,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: true,
    createdDaysAgo: 2,
  },
  {
    id: '2',
    category: 'properties',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Villa in Al-Sabeen Street',
    titleAr: 'فيلا في شارع السبعين',
    price: 950,
    periodEn: 'Month',
    periodAr: 'شهر',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: true,
    createdDaysAgo: 5,
  },
  {
    id: '3',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Canon 80D Camera',
    titleAr: 'كاميرا كانون 80D',
    price: 450,
    periodEn: '',
    periodAr: '',
    type: 'sell',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: false,
    createdDaysAgo: 1,
  },
  {
    id: '4',
    category: 'hobbies',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Mountain Bicycle',
    titleAr: 'دراجة هوائية جبلية',
    price: 15,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: false,
    createdDaysAgo: 12,
  },
  {
    id: '5',
    category: 'wedding_halls',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Al-Qasr Royal Wedding Hall',
    titleAr: 'قاعة القصر الملكية للأفراح',
    price: 1200,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: true,
    createdDaysAgo: 3,
  },
  {
    id: '6',
    category: 'chalets',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Green Hills Chalet',
    titleAr: 'شاليه التلال الخضراء',
    price: 180,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: true,
    createdDaysAgo: 8,
  },
  {
    id: '7',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    titleEn: 'iPhone 14 Pro Max',
    titleAr: 'آيفون 14 برو ماكس',
    price: 800,
    periodEn: '',
    periodAr: '',
    type: 'sell',
    locationEn: 'Aden',
    locationAr: 'عدن',
    verified: false,
    createdDaysAgo: 4,
  },
  {
    id: '8',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Wooden Dining Table Set',
    titleAr: 'طاولة طعام خشبية متكاملة',
    price: 120,
    periodEn: '',
    periodAr: '',
    type: 'sell',
    locationEn: 'Taiz',
    locationAr: 'تعز',
    verified: false,
    createdDaysAgo: 10,
  },
  {
    id: '9',
    category: 'properties',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Modern Studio Apartment',
    titleAr: 'شقة استوديو حديثة',
    price: 300,
    periodEn: 'Month',
    periodAr: 'شهر',
    type: 'rent',
    locationEn: 'Aden',
    locationAr: 'عدن',
    verified: true,
    createdDaysAgo: 14,
  },
  {
    id: '10',
    category: 'tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    titleEn: 'Heavy Duty Power Drill',
    titleAr: 'دريل كهربائي عالي القوة',
    price: 25,
    periodEn: 'Day',
    periodAr: 'يوم',
    type: 'rent',
    locationEn: "Sana'a",
    locationAr: 'صنعاء',
    verified: false,
    createdDaysAgo: 11,
  }
];

export default function SearchResultsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const t = useTranslations('SearchPage');
  const catT = useTranslations('Categories');
  const listT = useTranslations('Listings');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Available unique fields for filters options
  const categoryOptions = ['cars', 'properties', 'electronics', 'furniture', 'services', 'tools', 'fashion', 'kids', 'hobbies', 'wedding_halls', 'chalets'];
  const locationOptions = ['Sana\'a', 'Aden', 'Taiz'];

  // Handle category checkbox change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Handle location checkbox change
  const handleLocationChange = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedCategories([]);
    setSelectedLocations([]);
    setOnlyVerified(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  // Computed and filtered listings
  const filteredListings = useMemo(() => {
    return ALL_MOCK_LISTINGS.filter(item => {
      // 1. Text Search Query Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEn = item.titleEn.toLowerCase().includes(query);
        const matchesAr = item.titleAr.includes(query);
        if (!matchesEn && !matchesAr) return false;
      }

      // 2. Transaction Type Match
      if (selectedType && item.type !== selectedType) return false;

      // 3. Category Match
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;

      // 4. Location Match
      if (selectedLocations.length > 0 && !selectedLocations.includes(item.locationEn)) return false;

      // 5. Verification Status Match
      if (onlyVerified && !item.verified) return false;

      // 6. Price Bounds Match
      if (minPrice && item.price < parseFloat(minPrice)) return false;
      if (maxPrice && item.price > parseFloat(maxPrice)) return false;

      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      // Newest first by default
      return a.createdDaysAgo - b.createdDaysAgo;
    });
  }, [searchQuery, selectedType, selectedCategories, selectedLocations, onlyVerified, minPrice, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-deumah-gray-50 text-deumah-navy-950 flex flex-col">
      <DeumahHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Top search & bar options */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-deumah border border-deumah-gray-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-deumah-sm border border-deumah-gray-200 outline-none text-sm focus:border-deumah-green-600 transition"
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-deumah-gray-400">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sorting */}
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-xs font-semibold text-deumah-gray-500 whitespace-nowrap">{t('sortBy')}</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent border border-deumah-gray-200 rounded-deumah-sm px-3 py-2 text-sm outline-none cursor-pointer focus:border-deumah-green-600"
              >
                <option value="newest">{t('newest')}</option>
                <option value="priceAsc">{t('priceLowHigh')}</option>
                <option value="priceDesc">{t('priceHighLow')}</option>
              </select>
            </div>

            {/* Mobile filters button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 rounded-deumah-sm border border-deumah-gray-200 px-4 py-2 text-sm font-semibold hover:bg-deumah-gray-100 transition"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {t('filters')}
            </button>
          </div>
        </div>

        {/* Layout split: sidebar on desktop and main grid */}
        <div className="flex gap-6 items-start">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 bg-white border border-deumah-gray-200 p-5 rounded-deumah shadow-deumah-card sticky top-4">
            <div className="flex items-center justify-between pb-4 border-b border-deumah-gray-100 mb-4">
              <h2 className="font-bold text-base text-deumah-navy-950">{t('filters')}</h2>
              <button onClick={resetFilters} className="text-xs font-semibold text-deumah-green-700 hover:underline">{t('clearAll')}</button>
            </div>

            {/* Filter sections */}
            <div className="space-y-6">
              
              {/* Transaction type selector */}
              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">{t('type')}</h3>
                <div className="grid grid-cols-3 gap-1.5 bg-deumah-gray-50 p-1 rounded-deumah-sm">
                  {(['all', 'rent', 'sell'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type === 'all' ? null : type)}
                      className={`py-1.5 text-xs font-semibold rounded-deumah-xs transition ${
                        (type === 'all' && selectedType === null) || selectedType === type
                          ? 'bg-deumah-green-700 text-white shadow-sm'
                          : 'text-deumah-gray-600 hover:text-deumah-navy-950'
                      }`}
                    >
                      {type === 'all' ? (isAr ? 'الكل' : 'All') : t(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range inputs */}
              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">{t('priceRange')}</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t('minPrice')}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full text-xs border border-deumah-gray-200 rounded-deumah-sm p-2 outline-none focus:border-deumah-green-600"
                  />
                  <span className="text-deumah-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder={t('maxPrice')}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full text-xs border border-deumah-gray-200 rounded-deumah-sm p-2 outline-none focus:border-deumah-green-600"
                  />
                </div>
              </div>

              {/* Categories list */}
              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">{catT('title')}</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {categoryOptions.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 text-xs text-deumah-gray-700 hover:text-deumah-navy-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="rounded border-deumah-gray-200 text-deumah-green-700 focus:ring-deumah-green-600 size-4 cursor-pointer"
                      />
                      <span>{catT(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations checklist */}
              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase tracking-wider mb-2">{t('locations')}</h3>
                <div className="space-y-1.5">
                  {locationOptions.map(loc => (
                    <label key={loc} className="flex items-center gap-2.5 text-xs text-deumah-gray-700 hover:text-deumah-navy-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => handleLocationChange(loc)}
                        className="rounded border-deumah-gray-200 text-deumah-green-700 focus:ring-deumah-green-600 size-4 cursor-pointer"
                      />
                      <span>{isAr ? (loc === 'Sana\'a' ? 'صنعاء' : loc === 'Aden' ? 'عدن' : 'تعز') : loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verified owners toggle */}
              <div className="pt-2 border-t border-deumah-gray-100">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-deumah-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => setOnlyVerified(e.target.checked)}
                    className="rounded border-deumah-gray-200 text-deumah-green-700 focus:ring-deumah-green-600 size-4 cursor-pointer"
                  />
                  <span>{t('verifiedOnly')}</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {filteredListings.length > 0 ? (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.map(item => (
                  <ListingCard
                    key={item.id}
                    title={isAr ? item.titleAr : item.titleEn}
                    price={isAr ? `${item.price} دولار ${item.periodAr ? `/ ${item.periodAr}` : ''}` : `$${item.price} ${item.periodEn ? `/ ${item.periodEn}` : ''}`}
                    location={isAr ? item.locationAr : item.locationEn}
                    image={item.image}
                    badge={item.type === 'sell' ? listT('sell') : listT('rent')}
                    badgeTone={item.type === 'sell' ? 'sell' : 'rent'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-deumah border border-deumah-gray-200 p-8 shadow-sm">
                <svg className="size-16 text-deumah-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-deumah-gray-600 text-lg">{t('noResults')}</p>
                <button onClick={resetFilters} className="mt-4 text-sm font-semibold text-deumah-green-700 hover:underline">{t('clearAll')}</button>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Mobile Filters Drawer Slide Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 transition-opacity">
          <div className="w-full max-w-xs bg-white h-full p-5 flex flex-col shadow-xl overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-deumah-gray-100 mb-4">
              <h2 className="font-bold text-base text-deumah-navy-950">{t('filters')}</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full text-deumah-gray-400 hover:bg-deumah-gray-50"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile filters fields list */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase mb-2">{t('type')}</h3>
                <div className="grid grid-cols-3 gap-1.5 bg-deumah-gray-50 p-1 rounded-deumah-sm">
                  {(['all', 'rent', 'sell'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type === 'all' ? null : type)}
                      className={`py-1.5 text-xs font-semibold rounded-deumah-xs transition ${
                        (type === 'all' && selectedType === null) || selectedType === type
                          ? 'bg-deumah-green-700 text-white shadow-sm'
                          : 'text-deumah-gray-600'
                      }`}
                    >
                      {type === 'all' ? (isAr ? 'الكل' : 'All') : t(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase mb-2">{t('priceRange')}</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t('minPrice')}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="w-full text-xs border border-deumah-gray-200 rounded-deumah-sm p-2 outline-none focus:border-deumah-green-600"
                  />
                  <input
                    type="number"
                    placeholder={t('maxPrice')}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="w-full text-xs border border-deumah-gray-200 rounded-deumah-sm p-2 outline-none focus:border-deumah-green-600"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase mb-2">{catT('title')}</h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {categoryOptions.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 text-xs text-deumah-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="rounded border-deumah-gray-200 text-deumah-green-700 focus:ring-deumah-green-600 size-4 cursor-pointer"
                      />
                      <span>{catT(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-deumah-gray-500 uppercase mb-2">{t('locations')}</h3>
                <div className="space-y-1.5">
                  {locationOptions.map(loc => (
                    <label key={loc} className="flex items-center gap-2.5 text-xs text-deumah-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => handleLocationChange(loc)}
                        className="rounded border-deumah-gray-200 text-deumah-green-700 focus:ring-deumah-green-600 size-4 cursor-pointer"
                      />
                      <span>{isAr ? (loc === 'Sana\'a' ? 'صنعاء' : loc === 'Aden' ? 'عدن' : 'تعز') : loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-deumah-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={e => setOnlyVerified(e.target.checked)}
                    className="rounded border-deumah-gray-200 text-deumah-green-700 size-4 cursor-pointer"
                  />
                  <span>{t('verifiedOnly')}</span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-deumah-gray-100 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 rounded-deumah-sm border border-deumah-gray-200 py-2.5 text-xs font-semibold text-deumah-gray-700"
              >
                {t('clearAll')}
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-1/2 rounded-deumah-sm bg-deumah-green-700 py-2.5 text-xs font-semibold text-white hover:bg-deumah-green-600"
              >
                {isAr ? 'تطبيق الفلاتر' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
