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
import { ArrowUp, Search } from 'lucide-react';

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
                                                <span className="text-xs font-black text-neutral-900 leading-none dark:text-white tracking-tight capitalize">{auth.user.role?.name}</span>
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

            <footer className="relative overflow-hidden border-t border-primary/5 bg-[#fdfaf8] dark:border-primary/10 dark:bg-[#0a0807]">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-3">
                            <Link href="/" className="flex items-center gap-2 mb-8 group transition-transform hover:scale-[1.02] w-fit">
                                <AppLogo />
                            </Link>
                            <p className="max-w-2xl text-lg font-medium leading-relaxed text-neutral-600 dark:text-neutral-400 mb-6">
                                Merevolusi cara Anda menemukan dan mengelola hunian. SIKOSPEL menghadirkan kenyamanan dan transparansi dalam satu platform terpadu.
                            </p>
                            <Link href="/pencarian-kos" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                                <Search className="size-4" />
                                Cari Kos Sekarang
                            </Link>
                        </div>
                    </div>



                    <div className="mt-20 pt-10 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 px-6 py-4 bg-white/40 dark:bg-neutral-900/40 rounded-3xl backdrop-blur-sm border border-primary/5">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-widest">
                                &copy; {new Date().getFullYear()} SIKOSPEL. All Rights Reserved.
                            </p>
                            <div className="flex gap-6">
                                <Link href="/privacy" className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-400 hover:text-primary transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="text-[10px] font-black uppercase tracking-[0.1em] text-neutral-400 hover:text-primary transition-colors">Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
