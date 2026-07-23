import { getBaseUrl } from '@/utils/seo';
import { LISTINGS_DB } from '@/data/listings';
import { ListingDetailsClient } from '@/components/deumah/listing-details-client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Next.js dynamic metadata generator (Server-Side rendered)
export async function generateMetadata({ params }: PageProps) {
  const { locale, id } = await params;
  const item = LISTINGS_DB[id];
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
  const item = LISTINGS_DB[id];

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
      "priceCurrency": "USD",
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
      <ListingDetailsClient item={item} locale={locale} />
    </>
  );
}
