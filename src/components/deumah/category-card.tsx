import type {ReactNode} from 'react';

type Props = {label: string; icon: ReactNode; href?: string};
export function CategoryCard({label, icon, href = '#'}: Props) {
  return <a href={href} className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-deumah border border-deumah-gray-200 bg-white px-3 py-4 text-center text-sm font-medium transition hover:border-deumah-green-600 hover:shadow-deumah-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deumah-green-600"><span className="text-deumah-green-700 [&>svg]:size-8">{icon}</span><span>{label}</span></a>;
}
