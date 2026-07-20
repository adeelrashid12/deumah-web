import type {ReactNode} from 'react';

type Props = {title: string; description: string; icon: ReactNode; tone: 'rent'|'buy'|'sell'|'delivery'};

const toneClass = {
  rent: 'bg-deumah-green-700',
  buy: 'bg-deumah-navy-900',
  sell: 'bg-deumah-orange-600',
  delivery: 'bg-deumah-purple-800'
};

export function ActionCard({title, description, icon, tone}: Props) {
  return (
    <button type="button" className={`${toneClass[tone]} group flex min-h-28 w-full items-center gap-4 rounded-deumah p-5 text-start text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deumah-green-600`}>
      <span className="shrink-0 text-white [&>svg]:size-10">{icon}</span>
      <span>
        <span className="block text-lg font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-white/80">{description}</span>
      </span>
    </button>
  );
}
