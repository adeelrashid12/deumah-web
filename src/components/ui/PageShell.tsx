import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
export function PageShell({title, children}:{title:string;children?:React.ReactNode}){return <><Header/><main className="container-shell py-12"><h1 className="text-3xl font-semibold">{title}</h1><div className="mt-8 rounded-2xl border border-deumah-border bg-deumah-panel p-6">{children ?? <p className="text-deumah-muted">Phase 1 page skeleton — connect to backend/API.</p>}</div></main><Footer/></>}
