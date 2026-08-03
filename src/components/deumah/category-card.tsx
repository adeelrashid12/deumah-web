import type { ReactNode } from 'react';

type Props = {
  label: string;
  icon: ReactNode;
};

export function CategoryCard({ label, icon }: Props) {
  return (
    <div className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-deumah border border-deumah-gray-200 bg-white px-3 py-4 text-center text-sm font-medium transition hover:border-deumah-green-600 hover:shadow-deumah-card">
      <span className="text-deumah-green-700 [&>svg]:size-8">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
