import { getBaseUrl } from '@/utils/seo';
import { LISTINGS_DB } from '@/data/listings';
import { ListingDetailsClient } from '@/components/deumah/listing-details-client';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Fetch listing details from database OR fallback to local mock
async function getListing(id: string) {
  if (LISTINGS_DB[id]) {
    return LISTINGS_DB[id];
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      return {
        id: data.id,
        owner_id: data.owner_id,
        ownerId: data.owner_id,
        category: data.category,
        images: data.images && data.images.length ? data.images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'],
        video: data.video_url || null,
        titleEn: data.title_en,
        titleAr: data.title_ar,
        price: Number(data.price),
        currency: data.currency || 'USD',
        periodEn: data.type === 'rent' ? 'Day' : '',
        periodAr: data.type === 'rent' ? 'يوم' : '',
        type: data.type,
        locationEn: "Sana'a",
        locationAr: data.governorate === 'sanaa_city' ? 'أمانة العاصمة' : 'صنعاء',
        descriptionEn: data.description_en || '',
        descriptionAr: data.description_ar || '',
        specifications: data.specifications || {},
        specs: data.specifications && typeof data.specifications === 'object' && !Array.isArray(data.specifications)
          ? Object.entries(data.specifications)
              .filter(([k]) => k !== 'contact')
              .map(([k, v]) => {
                const specLabelsAr: Record<string, string> = {
                  brand: 'الماركة', model: 'الموديل', year: 'سنة الصنع', transmission: 'ناقل الحركة', fuel: 'نوع الوقود',
                  mileage: 'المسافة المقطوعة', type: 'النوع', bedrooms: 'غرف النوم', bathrooms: 'الحمامات',
                  area: 'المساحة', furnished: 'مفروش', capacity: 'السعة', soundSystem: 'نظام صوتي',
                  ac: 'نظام التكييف', parking: 'مواقف سيارات', pool: 'مسبح', overnight: 'إمكانية المبيت',
                  warranty: 'الضمان', pricingMethod: 'طريقة احتساب السعر'
                };
                const valStr = String(v).toLowerCase();
                const specValuesAr: Record<string, string> = {
                  automatic: 'أوتوماتيك', manual: 'عادي',
                  gasoline: 'بنزين', diesel: 'ديزل', hybrid: 'هايبرد', electric: 'كهربائي',
                  yes: 'نعم', no: 'لا',
                  apartment: 'شقة', villa: 'فيلا', office: 'مكتب', land: 'أرض',
                  central: 'مركزي', split: 'سبليت', none: 'بدون',
                  fixed: 'ثابت', hourly: 'بالساعة', daily: 'باليوم', negotiable: 'حسب الاتفاق'
                };
                return {
                  labelEn: k,
                  labelAr: specLabelsAr[k] || k,
                  valueEn: String(v),
                  valueAr: specValuesAr[valStr] || String(v)
                };
              })
          : (Array.isArray(data.specifications) ? data.specifications : []),
        condition: data.condition || null,
        owner: {
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          nameEn: 'Verified Seller',
          nameAr: 'بائع موثق',
          memberSinceEn: '2024',
          memberSinceAr: '٢٠٢٤',
          responseRate: '98%',
          contact: data.specifications?.contact || null
        }
      };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

// Next.js dynamic metadata generator (Server-Side rendered)
export async function generateMetadata({ params }: PageProps) {
  const { locale, id } = await params;
  const item = await getListing(id);
  if (!item) return {};

  const isAr = locale === 'ar';
  const title = isAr ? item.titleAr : item.titleEn;
  const desc = isAr ? item.descriptionAr : item.descriptionEn;
  const baseUrl = getBaseUrl();
  const canonical = `${baseUrl}/${locale}/listings/${id}`;

  return {
    title: `${title} | Deumah`,
    description: desc,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: `${title} | Deumah`,
      description: desc,
      images: [{ url: item.images[0] }],
      url: canonical,
      type: 'website',
    }
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { locale, id } = await params;
  const item = await getListing(id);

  if (!item) {
    notFound();
  }

  const isAr = locale === 'ar';
  const baseUrl = getBaseUrl();

  // Schema.org Structured Data (JSON-LD) for Search Engine Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": isAr ? item.titleAr : item.titleEn,
    "image": item.images,
    "description": isAr ? item.descriptionAr : item.descriptionEn,
    "offers": {
      "@type": "Offer",
      "price": item.price,
      "priceCurrency": (item as any).currency || "USD",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/${locale}/listings/${id}`
    }
  };

  return (
    <>
      {/* Schema.org Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailsClient item={item as any} locale={locale} />
    </>
  );
}
