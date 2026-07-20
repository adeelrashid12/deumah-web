import {Header} from '@/components/layout/Header';
import {Hero} from '@/components/home/Hero';
import {Categories} from '@/components/home/Categories';
import {FeaturedListings} from '@/components/home/FeaturedListings';
import {Banners} from '@/components/home/Banners';
import {Footer} from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="w-full flex flex-col bg-[#F8FAFC]">
        <Hero />
        <Categories />
        <FeaturedListings />
        <Banners />
      </main>
      <Footer />
    </>
  );
}
