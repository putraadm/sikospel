import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Home, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import TextType from '@/components/ui/text-type';
import ColorBends from '@/components/ui/color-bends';

gsap.registerPlugin(ScrollTrigger);

export default function Welcome({
    kos: initialKos = [],
    filters = {},
}: {
    kos?: any[];
    filters?: { search?: string };
}) {
    const [kos, setKos] = useState(initialKos);
    const heroRef = useRef<HTMLDivElement>(null);
    const recommendedRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!recommendedRef.current || kos.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.from('.kos-card', {
                y: 40,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: recommendedRef.current,
                    start: 'top 85%',
                },
            });
        }, recommendedRef);

        return () => ctx.revert();
    }, [kos]);

    return (
        <MainLayout>
            <Head title="Beranda" />

            {/* Hero Section */}
            <section ref={heroRef} className="relative overflow-hidden bg-[#f8f1ea] pt-8 pb-20 lg:pt-12 lg:pb-24 dark:bg-[#0d0907] min-h-[500px]">
                {/* Sharp Luxury Background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/80"></div>

                    {/* Architectural Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c1a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-full max-w-4xl">
                            <div className="hero-badge inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-white dark:bg-primary/20">
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
                                <Link href="/pencarian-kos">
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
                            <Card key={i} className="feature-card border-none bg-white dark:bg-neutral-900 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(139,94,60,0.2)] transition-all duration-700 rounded-[3rem] overflow-hidden group hover:-translate-y-2 ring-1 ring-[#8b5e3c]/10">
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
            <section ref={recommendedRef} className="py-24 bg-[#f8f1ea] dark:bg-[#050403] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c0a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px w-12 bg-[#8b5e3c]"></div>
                                <span className="text-sm font-black uppercase tracking-[0.3em] text-[#8b5e3c]">Exclusive Selection</span>
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-[#1e110a] dark:text-[#f8f1ea] tracking-tighter leading-[0.85]">
                                Tinggal di <br />
                                <span className="text-primary italic">Hunian Impian</span>
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="text-lg text-[#3e2717]/60 dark:text-white/60 leading-relaxed max-w-xs font-medium">Dekat kampus, aman, dan telah terverifikasi oleh tim kurasi kami.</p>
                            <Link href="/pencarian-kos" className="inline-flex h-14 items-center gap-4 px-8 rounded-2xl bg-[#1e110a] text-[#f8f1ea] font-bold hover:bg-[#8b5e3c] transition-all duration-500 shadow-2xl group w-fit">
                                <span>Eksplorasi Semua</span>
                                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {kos.length > 0 ? (
                            kos.map((k: any) => (
                                <Card key={k.id} className="kos-card group border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0d0907] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                    <Link href={`/kos/${k.slug}`} className="flex flex-col h-full w-full">
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem] shrink-0 border-b border-neutral-100 dark:border-neutral-800">
                                            <img
                                                src={`/storage/${k.image}`}
                                                alt={k.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />

                                            {/* Badges Overlay */}
                                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                <Badge className={`border-none py-1.5 px-3 text-[10px] font-bold rounded-lg shadow-md ${k.gender_type === 'putra' ? 'bg-blue-600 text-white' :
                                                    k.gender_type === 'putri' ? 'bg-pink-600 text-white' :
                                                        'bg-green-600 text-white'
                                                    }`}>
                                                    {k.gender_type === 'campuran' ? 'Campur' : k.gender_type.charAt(0).toUpperCase() + k.gender_type.slice(1)}
                                                </Badge>
                                                <Badge className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 py-1.5 px-3 text-[10px] font-bold rounded-lg shadow-md">
                                                    {k.rooms?.filter((r: any) => r.status === 'tersedia').length || 0} Kamar
                                                </Badge>
                                            </div>

                                            {/* Price Tag Overlay */}
                                            <div className="absolute bottom-4 right-4">
                                                <div className="bg-primary px-3 py-1.5 rounded-xl shadow-lg text-white border border-white/10">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xs font-bold">Rp</span>
                                                        <span className="text-base font-black tracking-tight">
                                                            {Number((k.rooms?.[0]?.type_kamar?.harga || 0) * 30).toLocaleString('id-ID')}
                                                        </span>
                                                        <span className="text-[9px] opacity-90 font-medium">/bln</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-5 pt-2 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center justify-center size-5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                    <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Terverifikasi</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-[#1e110a] dark:text-[#f8f1ea] leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                                {k.name}
                                            </h3>

                                            <div className="flex items-start text-sm text-neutral-500 dark:text-neutral-400">
                                                <MapPin className="mr-1.5 size-4 shrink-0 text-primary/60" />
                                                <span className="line-clamp-2">{k.address}</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                                <span className="text-xs font-semibold text-neutral-400 group-hover:text-primary transition-colors">Lihat Detail Unit</span>
                                                <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                    <ArrowRight className="size-4" />
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
