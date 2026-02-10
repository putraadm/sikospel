import { cn } from '@/lib/utils';
import { Pengaturan, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUp, ArrowUpRightFromSquare, Facebook, Instagram, Mail, MapPin, Menu, PersonStanding, Phone, X, Youtube } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu } from './dropdown-menu';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';

export default function MainLayout({
    container,
    children,
    className,
    pengaturan,
    ...rest
}: React.ComponentProps<'main'> & { container?: boolean; pengaturan: Pengaturan }) {
    const page = usePage<SharedData>();
    const [menu, setMenu] = useState(false);
    const currentUrl = page.url;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <div className="bg-[#03572E] py-2 text-white z-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                        <div className="hidden md:flex gap-4 items-center justify-center md:justify-start">
                            <a href={pengaturan.facebook || '#'} target="_blank" rel="noopener noreferrer">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href={pengaturan.youtube || '#'} target="_blank" rel="noopener noreferrer">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href={pengaturan.instagram || '#'} target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="text-center">
                            <p className="text-xs md:text-sm font-light">Selamat datang di website <span className="font-semibold">KONI Kabupaten Jombang</span></p>
                        </div>
                        <div className="hidden md:flex flex-col md:flex-row gap-1 md:gap-4 items-center justify-center md:justify-end text-xs md:text-sm">
                            <p className="flex flex-row gap-1 items-center">
                                <Phone className="h-3 w-3 md:h-4 md:w-4" />
                                +{pengaturan.no_telp}
                            </p>
                            <p className="flex flex-row gap-1 items-center">
                                <Mail className="h-3 w-3 md:h-4 md:w-4" />
                                {pengaturan.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <header className="sticky top-0 z-10 bg-gray-50 shadow">
                {/* Mobile Navbar */}
                <div
                    className={`absolute mt-20 flex shadow ${menu ? '' : 'pointer-events-none -translate-y-full opacity-0'} w-full flex-col gap-6 rounded-b-xl bg-gray-50 p-6 pb-7 transition lg:hidden`}
                >
                    {pengaturan.navbar && pengaturan.navbar.length > 0 ? (
                        pengaturan.navbar.map((item) => <DropdownMenu key={item.id} item={item} isMobile={true} currentUrl={currentUrl} />)
                    ) : (
                        <>
                            <Link href={route('beranda')} className={`font-medium hover:text-primary ${route().current('beranda') ? 'text-primary' : ''}`}>
                                Home
                            </Link>
                            <Link href={route('profile-content')} className={`font-medium hover:text-primary ${route().current('profile-content') ? 'text-primary' : ''}`}>
                                Profile
                            </Link>
                            {/* <DropdownMenu
                                item={{
                                    id: 'cabor',
                                    judul: 'Cabang Olahraga',
                                    url: '#',
                                    submenu: [
                                        { id: 'data-prestasi', judul: 'Data Prestasi', url: route('prestasi') },
                                        { id: 'data-atlet', judul: 'Data Atlet', url: route('atlet') },
                                        { id: 'semua-cabor', judul: 'Semua Cabang Olahraga', url: route('cabor') },
                                    ],
                                }}
                                isMobile={true}
                                currentUrl={currentUrl}
                            /> */}
                            <Link href={route('cabor')} className={`font-medium hover:text-primary ${route().current('berita.kategori', 'news') ? 'text-primary' : ''}`}>
                                Cabang Olahraga
                            </Link>
                            <Link href={route('berita.kategori', 'news')} className={`font-medium hover:text-primary ${route().current('berita.kategori', 'news') ? 'text-primary' : ''}`}>
                                News
                            </Link>
                            <Link href={route('berita.kategori', 'events')} className={`font-medium hover:text-primary ${route().current('berita.kategori', 'events') ? 'text-primary' : ''}`}>
                                Events
                            </Link>
                            <Link href={route('kontak')} className={`font-medium hover:text-primary ${route().current('kontak') ? 'text-primary' : ''}`}>
                                Kontak
                            </Link>
                        </>
                    )}
                </div>

                {/* Desktop Navbar */}
                <div className="relative bg-gray-50 px-4">
                    <div className="container mx-auto flex items-center justify-between py-6">
                        <Link href={route('beranda')} className="flex items-center gap-2" prefetch>
                            <span className="text-xl font-bold">
                                {pengaturan.logo && pengaturan.logo !== 'logo' ? (
                                    <img src={'/storage/' + pengaturan.logo} alt="" className='text-primary max-h-56 max-w-56' />
                                ) : (
                                    <img src="/logo.svg" alt="" className='text-primary max-h-56 max-w-56' />
                                )}

                                {/* <span className="text-primary"> {pengaturan.judul}</span> */}
                            </span>
                        </Link>
                        <div className="grid lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMenu(!menu)}
                                className={`col-start-1 row-start-1 transition-colors hover:text-primary ${menu ? 'pointer-events-none opacity-0' : ''}`}
                            >
                                <Menu />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMenu(!menu)}
                                className={`col-start-1 row-start-1 transition-colors hover:text-primary ${!menu ? 'pointer-events-none opacity-0' : ''}`}
                            >
                                <X />
                            </button>
                        </div>
                        <nav className="hidden space-x-6 lg:block">
                            {pengaturan.navbar && pengaturan.navbar.length > 0 ? (
                                pengaturan.navbar.map((item) => <DropdownMenu key={item.id} item={item} currentUrl={currentUrl} />)
                            ) : (
                                <>
                                    <Link href={route('beranda')} className={`font-medium hover:text-primary ${route().current('beranda') ? 'text-primary' : ''}`}>
                                        Home
                                    </Link>
                                    <Link href={route('profile-content')} className={`font-medium hover:text-primary ${route().current('profile-content') ? 'text-primary' : ''}`}>
                                        Profile
                                    </Link>
                                    {/* <DropdownMenu
                                        item={{
                                            id: 'cabor',
                                            judul: 'Cabang Olahraga',
                                            url: '#',
                                            submenu: [
                                                { id: 'data-prestasi', judul: 'Data Prestasi', url: route('prestasi') },
                                                { id: 'data-atlet', judul: 'Data Atlet', url: route('atlet') },
                                                { id: 'semua-cabor', judul: 'Semua Cabang Olahraga', url: route('cabor') },
                                            ],
                                        }}
                                        currentUrl={currentUrl}
                                    /> */}
                                    <Link href={route('cabor')} className={`font-medium hover:text-primary ${route().current('cabor') ? 'text-primary' : ''}`}>
                                        Cabang Olahraga
                                    </Link>
                                    <Link href={route('berita.kategori', 'news')} className={`font-medium hover:text-primary ${route().current('berita.kategori', 'news') ? 'text-primary' : ''}`}>
                                        News
                                    </Link>
                                    <Link href={route('berita.kategori', 'events')} className={`font-medium hover:text-primary ${route().current('berita.kategori', 'events') ? 'text-primary' : ''}`}>
                                        Events
                                    </Link>
                                    <Link href={route('kontak')} className={`font-medium hover:text-primary ${route().current('kontak') ? 'text-primary' : ''}`}>
                                        Kontak
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
            <main className={cn(`${container != false ? 'container mx-auto px-4 py-8 sm:px-16' : ''} flex-1`, className)} {...rest}>
                {children}
                <Toaster theme="light" richColors closeButton />
            </main>

            <Button className="fixed right-4 bottom-4 border" size="icon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <ArrowUp />
            </Button>

            <footer className="mt-8 bg-primary text-white pt-10 pb-4">
                <div className="container mx-auto px-4 md:px-8 lg:px-20">
                    <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-8">
                        {/* Info KONI Jombang */}
                        <div className="text-center md:text-left">
                            {pengaturan.icon && pengaturan.icon !== 'icon' ? (
                                <img src={'/storage/' + pengaturan.icon} alt="Logo KONI Jombang" className="mb-4 h-16 w-16 mx-auto md:mx-0" />
                            ) : (
                                <img src="/favicon.svg" alt="Logo KONI Jombang" className="mb-4 h-16 w-16 mx-auto md:mx-0" />
                            )}
                            <h2 className="text-xl font-bold mb-2">KONI Jombang</h2>
                            <p className="mb-4 text-sm">Komite Olah Raga Nasional Indonesia (KONI Kabupaten Jombang)</p>
                            <p className="flex gap-2 mb-2 text-sm justify-center md:justify-start">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>Jl. Gus Dur No.4, Candi Mulyo, Kec. Jombang, Kabupaten Jombang, Jawa Timur 61413</span>
                            </p>
                            <p className="flex gap-2 mb-2 text-sm justify-center md:justify-start">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span>+62{pengaturan.no_telp?.replace(/^0/, '') || '81xxxxxxxxxx'}</span>
                            </p>
                            <p className="flex gap-2 mb-5 text-sm justify-center md:justify-start">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span>{pengaturan.email || 'konijombang@gmail.com'}</span>
                            </p>
                            <div className="flex gap-3 mt-2 items-center justify-center md:justify-start">
                                <a href={pengaturan.facebook || '#'} target="_blank" rel="noopener noreferrer"><Facebook className="h-4 w-4" /></a>
                                <a href={pengaturan.youtube || '#'} target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5" /></a>
                                <a href={pengaturan.instagram || '#'} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4" /></a>
                                {/* TikTok icon (optional) */}
                                <a href={pengaturan.tiktok || '#'} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4' viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>
                                </a>
                            </div>
                        </div>
                        {/* Tentang */}
                        <div className="text-center md:text-left">
                            <h3 className="font-bold mb-3 text-lg">Tentang</h3>
                            <ul className="space-y-2 text-[0.9rem]">
                                <li><Link href={route('beranda')} className="hover:text-white text-gray-300">Home</Link></li>
                                <li><Link href={route('profile-content')} className="hover:text-white text-gray-300">Profil</Link></li>
                                <li><Link href={route('cabor')} className="hover:text-white text-gray-300">Cabang Olahraga</Link></li>
                                <li><Link href={route('berita.kategori', 'news')} className="hover:text-white text-gray-300">News</Link></li>
                                <li><Link href={route('berita.kategori', 'events')} className="hover:text-white text-gray-300">Events</Link></li>
                            </ul>
                        </div>
                        {/* Bantuan */}
                        <div className="text-center md:text-left">
                            <h3 className="font-bold mb-3 text-lg">Bantuan</h3>
                            <ul className="space-y-2 text-[0.9rem]">
                                <li><Link href={route('faq')} className="hover:text-white text-gray-300">FAQ</Link></li>
                                <li><Link href={route('kontak')} className="hover:text-white text-gray-300">Kontak</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-gray-400" />
                <div className="container mx-auto px-4 text-center">
                    <div className="mb-2 text-red-400 text-sm">
                        Laman Resmi Komite Olah Raga Nasional Indonesia (KONI Kabupaten Jombang)
                    </div>
                    <div className="text-sm">
                        Copyright © 2025 <span className="font-bold">KONI Kabupaten Jombang</span>. Support by <a href="https://nusatama.co/" className="underline" target="_blank" rel="noopener noreferrer">PT. Nusatama Jaya Sakti</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
