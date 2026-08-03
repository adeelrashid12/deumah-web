import { DeumahHome } from '@/components/deumah/deumah-home';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deumah-gray-50 flex items-center justify-center text-deumah-gray-500 font-medium">
        Loading...
      </div>
    }>
      <DeumahHome />
    </Suspense>
  );
}
