import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Home, Shield, Zap, ArrowRight } from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import TextType from '@/components/ui/text-type';
import ColorBends from '@/components/ui/color-bends';

export default function Welcome({
    kos: initialKos = [],
    filters = {},
}: {
    kos?: any[];
    filters?: { search?: string };
}) {
    const [kos, setKos] = useState(initialKos);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setKos(initialKos);
    }, [initialKos]);

    useEffect(() => {
        const handleSearchResults = (event: CustomEvent) => {
            setKos(event.detail);
        };

        window.addEventListener('searchResults', handleSearchResults as EventListener);

        return () => {
            window.removeEventListener('searchResults', handleSearchResults as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!heroRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

            tl.from('.hero-badge', { y: 20, opacity: 0, delay: 0.2 })
                .from('.hero-title', { y: 30, opacity: 0 }, '-=0.7')
                .from('.hero-desc', { y: 20, opacity: 0 }, '-=0.8')
                .from('.hero-buttons', { y: 20, opacity: 0 }, '-=0.8');
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <MainLayout>
            <Head title="Beranda" />

            {/* Hero Section */}
            <section ref={heroRef} className="relative overflow-hidden bg-[#f8f1ea] pt-8 pb-20 lg:pt-12 lg:pb-24 dark:bg-[#0d0907] min-h-[500px]">
                {/* Dynamic Luxury Background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <ColorBends
                        colors={['#1e110a', '#3e2717', '#5a3a22', '#8b5e3c', '#c4a484']}
                        speed={0.08}
                        rotation={15}
                        scale={1.5}
                        noise={0.15}
                        transparent={true}
                    />
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/70 backdrop-blur-[100px]"></div>

                    {/* Architectural Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c1a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                </div>

                {/* Grainy Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-full max-w-4xl">
                            <div className="hero-badge inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-white/50 backdrop-blur-md dark:bg-primary/10 dark:border-primary/30">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-sm font-semibold text-primary/80 dark:text-primary-foreground/90">
                                    Pilihan Terpercaya di Indonesia
                                </span>
                            </div>

                            <h1 className="hero-title mb-8 text-6xl font-black tracking-tight text-neutral-900 sm:text-8xl dark:text-white leading-[1.05]">
                                Temukan Hunian <br />
                                <span className="relative inline-block mt-2">
                                    <span className="relative z-10">
                                        <TextType
                                            text={["Terbaik", "Strategis", "Nyaman", "Modern"]}
                                            className="text-primary italic"
                                            as="span"
                                            cursorCharacter="_"
                                            typingSpeed={70}
                                        />
                                    </span>
                                </span>
                                <br /> untuk Masa Depan
                            </h1>

                            <p className="hero-desc mb-12 text-xl md:text-2xl leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                                Platform pencarian kos paling cerdas. Fasilitas lengkap, lokasi premium,
                                dan pendaftaran instan dalam satu genggaman.
                            </p>

                            <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="#">
                                    <Button size="lg" className="h-16 px-12 text-lg bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-[0_15px_50px_-10px_rgba(102,66,41,0.5)] transition-all hover:-translate-y-1 hover:shadow-primary/40 group">
                                        Cari Kos Sekarang
                                        <ArrowRight className="ml-2 size-6 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Badge / Info Section */}
                            {/* <div className="hero-desc mt-16 flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">1,500+</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Properti Listing</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">50k+</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Pengguna Aktif</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">4.9/5</span>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Rating Kepuasan</span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 bg-[#fffcf8] dark:bg-[#0d0907] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: Search,
                                title: 'Pencarian Mudah',
                                desc: 'Sistem filter cerdas untuk menemukan hunian berdasarkan lokasi, budget, dan fasilitas impian Anda.',
                                index: '01'
                            },
                            {
                                icon: Shield,
                                title: 'Keamanan Terjamin',
                                desc: 'Verifikasi ketat untuk setiap pemilik kos dan sistem pembayaran aman yang melindungi Anda.',
                                index: '02'
                            },
                            {
                                icon: Zap,
                                title: 'Respon Cepat',
                                desc: 'Terhubung langsung dengan pemilik via WhatsApp untuk konfirmasi instan tanpa menunggu lama.',
                                index: '03'
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="feature-card border-none bg-white/50 backdrop-blur-xl dark:bg-white/5 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(139,94,60,0.2)] transition-all duration-700 rounded-[3rem] overflow-hidden group hover:-translate-y-2 ring-1 ring-[#8b5e3c]/10">
                                <CardContent className="p-10 relative z-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f1ea] text-[#8b5e3c] group-hover:bg-[#8b5e3c] group-hover:text-white transition-all duration-500 shadow-lg group-hover:rotate-[-6deg]">
                                            <feature.icon className="size-7" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-5xl font-black text-[#8b5e3c]/10 group-hover:text-[#8b5e3c]/20 transition-colors duration-500 select-none tracking-tighter">
                                            {feature.index}
                                        </span>
                                    </div>

                                    <h3 className="mb-4 text-2xl font-black tracking-tight text-[#1e110a] dark:text-[#f8f1ea]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#3e2717]/60 dark:text-white/60 leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recommended Kos Section */}
            <section className="py-12 bg-[#f8f1ea] dark:bg-[#050403] relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c0a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-10 flex items-start justify-between">
                        <div className="max-w-4xl">
                            <h2 className="mb-6 text-5xl md:text-6xl font-black text-[#1e110a] dark:text-[#f8f1ea] tracking-tighter leading-[0.9] italic">
                                Rekomendasi <span className="pr-4 text-transparent bg-clip-text bg-gradient-to-r from-[#8b5e3c] to-[#c4a484]">Kos</span>
                            </h2>
                            <p className="text-xl text-[#3e2717]/60 dark:text-white/60 leading-relaxed max-w-lg">Pilihan kos dengan standar kenyamanan tertinggi yang telah kami verifikasi secara langsung.</p>
                        </div>
                        <Link href="/pendaftaran-kos" className="hidden sm:inline-flex h-14 items-center gap-3 px-8 rounded-[2rem] bg-[#1e110a] text-[#f8f1ea] font-bold hover:bg-[#8b5e3c] hover:scale-105 transition-all duration-300 shadow-xl group">
                            <span>Lihat Semua</span>
                            <div className="size-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="size-3" />
                            </div>
                        </Link>
                    </div>

                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {kos.length > 0 ? (
                            kos.map((k: any) => (
                                <Card key={k.id} className="kos-card group border-none bg-transparent shadow-none hover:-translate-y-3 transition-transform duration-500 cursor-pointer">
                                    <Link href={`/kos/${k.slug}`} className="block h-full w-full">
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-2xl mb-6">
                                            <div className="absolute inset-0 bg-[#3e2717]/10 animate-pulse group-hover:opacity-0 transition-opacity"></div>
                                            <img
                                                src={`/storage/${k.image}`}
                                                alt={k.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onLoad={(e) => (e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none'}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1e110a] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                                            <div className="absolute top-5 right-5 z-20">
                                                <div className="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500 delay-100">
                                                    <ArrowRight className="size-4 text-white -rotate-45" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge className="bg-[#8b5e3c] text-white border-none py-1 px-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg">
                                                        {k.rooms.filter((r: any) => r.status === 'tersedia').length} Unit
                                                    </Badge>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Premium</span>
                                                </div>

                                                <h3 className="text-2xl font-black mb-2 leading-none group-hover:text-[#c4a484] transition-colors">
                                                    {k.name}
                                                </h3>

                                                <div className="flex items-center text-xs opacity-70 mb-6 font-medium">
                                                    <MapPin className="mr-1.5 size-3.5 shrink-0" />
                                                    {k.address}
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Mulai Dari</p>
                                                        <p className="text-xl font-black">
                                                            Rp {k.rooms[0]?.type_kamar?.harga?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center flex flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-[#3e2717]/10 bg-[#fffcf8]">
                                <div className="size-24 bg-[#f8f1ea] rounded-full flex items-center justify-center shadow-lg">
                                    <Home className="size-10 text-[#8b5e3c]/40" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-[#1e110a]">
                                        {filters.search ? `"${filters.search}" tidak ditemukan` : "Belum ada kos tersedia"}
                                    </p>
                                    <p className="text-[#3e2717]/60 font-medium">Silakan coba kata kunci lain atau hubungi admin kami.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-20 text-center sm:hidden">
                        <Link href="/pendaftaran-kos">
                            <Button className="w-full h-16 rounded-[2rem] bg-[#1e110a] text-white font-bold text-lg">
                                Lihat Semua Properti
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
