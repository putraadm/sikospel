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
            <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogo />
                        </Link>
                        {/* <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors">Beranda</Link>
                        </nav> */}
                    </div>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Cari kos..."
                                className="h-9 w-64 pl-9 text-sm bg-neutral-50 dark:bg-neutral-900 border-none focus-visible:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1 border border-neutral-100 dark:border-neutral-800">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.username} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white font-bold">
                                                {getInitials(auth.user.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="font-medium">Masuk</Button>
                                </Link>
                                {/* <Link href="/register">
                                    <Button size="sm" className="font-medium bg-primary hover:bg-primary/90 text-white border-none shadow-sm transition-all hover:shadow-md">Daftar</Button>
                                </Link> */}
                            </div>
                        )}
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
