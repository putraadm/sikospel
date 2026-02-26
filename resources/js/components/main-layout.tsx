import { ReactNode } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { BreadcrumbItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import { Breadcrumbs } from './breadcrumbs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserMenuContent } from './user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { ArrowUp, Facebook, Instagram, Twitter, Mail, MapPin, Phone, Search } from 'lucide-react';

interface Props {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function MainLayout({ children, breadcrumbs = [] }: Props) {
    const { props } = usePage<SharedData & { filters?: { search?: string } }>();
    const { auth, filters } = props;
    const [search, setSearch] = useState(filters?.search || '');
    const getInitials = useInitials();

    useEffect(() => {
        setSearch(filters?.search || '');
    }, [filters?.search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/', { search }, { preserveState: true });
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#FDFDFC] dark:bg-[#0A0A0A]">
            <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-[#fdfaf8]/80 backdrop-blur-xl dark:border-primary/20 dark:bg-[#0a0908]/80">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 group transition-all hover:opacity-90">
                            <AppLogo />
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <form onSubmit={handleSearch} className="relative hidden md:block group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors">
                                <Search className="size-4" strokeWidth={3} />
                            </div>
                            <Input
                                type="text"
                                placeholder="Cari hunian impian Anda..."
                                className="h-11 w-80 pl-11 pr-4 rounded-2xl border border-primary/5 bg-white/50 hover:bg-white hover:border-primary/20 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all text-sm font-semibold text-neutral-800 placeholder:text-neutral-400 dark:bg-neutral-900/50 dark:border-primary/10 dark:text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-12 px-3 rounded-2xl bg-white border border-primary/10 shadow-sm hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center gap-3 group dark:bg-neutral-900 dark:border-primary/20">
                                            <div className="flex flex-col items-end hidden sm:flex">
                                                <span className="text-xs font-black text-neutral-900 leading-none dark:text-white tracking-tight">{auth.user.username}</span>
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5 opacity-80">Penghuni</span>
                                            </div>
                                            <Avatar className="size-9 overflow-hidden rounded-xl border-2 border-primary/10 group-hover:border-primary/30 transition-all shadow-sm">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.username} />
                                                <AvatarFallback className="rounded-xl bg-primary text-white font-black text-[11px]">
                                                    {getInitials(auth.user.username)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-60 mt-2 p-2 rounded-2xl shadow-2xl border-primary/10 bg-white dark:bg-neutral-950 dark:border-primary/20" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link href="/login">
                                        <Button variant="ghost" className="h-11 px-6 rounded-2xl font-black text-sm text-neutral-600 hover:text-primary hover:bg-primary/5 transition-all tracking-tight">
                                            Masuk
                                        </Button>
                                    </Link>

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {breadcrumbs.length > 1 && (
                <div className="border-b border-neutral-50 bg-white/50 dark:border-neutral-900 dark:bg-black/50">
                    <div className="mx-auto flex h-10 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            <main className="flex-1">
                {children}
            </main>

            <Button className="fixed bottom-4 right-4" size="icon"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <ArrowUp />
            </Button>

            <footer className="border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <AppLogo />
                            </Link>
                            <p className="max-w-xs text-justify text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                SIKOSPEL (Sistem KOS & Pelaporan) menyediakan platform terpadu untuk mencari, mengelola, dan melaporkan hunian kos dengan mudah dan transparan.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-medium">
                            &copy; {new Date().getFullYear()} SIKOSPEL. Dibuat dengan &hearts; untuk kenyamanan Anda.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Kebijakan Privasi</Link>
                            <Link href="/terms" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">Ketentuan Layanan</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
