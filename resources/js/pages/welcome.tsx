import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Home, Shield, Zap, ArrowRight } from 'lucide-react';
import { type SharedData } from '@/types';
import { useState, useEffect } from 'react';

export default function Welcome({
    kos: initialKos = [],
    filters = {},
}: {
    kos?: any[];
    filters?: { search?: string };
}) {
    const [kos, setKos] = useState(initialKos);

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
    return (
        <MainLayout>
            <Head title="Beranda" />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white py-16 lg:py-24 dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative z-10 lg:w-1/2">
                        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary dark:border-primary/40 dark:bg-primary/20 dark:text-primary-foreground">
                            Terpercaya di Seluruh Indonesia
                        </Badge>
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
                            Temukan Hunian <span className="text-primary">Terbaik</span> untuk Masa Depan Anda
                        </h1>
                        <p className="mb-8 text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
                            Cari kos dengan fasilitas lengkap, lokasi strategis, dan proses pendaftaran yang transparan hanya di SIKOSPEL.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/pendaftaran-kos">
                                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white border-none shadow-lg transition-all hover:shadow-xl">
                                    Cari Kos Sekarang
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                            <Link href="/pendaftaran-kos">
                                <Button variant="outline" size="lg" className="h-12 px-8 border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">
                                    Daftarkan Properti Anda
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Hero Abstract Decoration */}
                <div className="absolute top-0 right-0 -z-10 h-full w-1/2 hidden lg:block">
                    <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl dark:bg-primary/20"></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-neutral-50 dark:bg-[#0A0A0A]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="border-none shadow-sm bg-white dark:bg-[#161615]">
                            <CardContent className="p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground">
                                    <Search className="size-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">Pencarian Mudah</h3>
                                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    Filter kos berdasarkan lokasi, harga, dan fasilitas sesuai kebutuhan Anda.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-white dark:bg-[#161615]">
                            <CardContent className="p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                    <Shield className="size-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">Keamanan Terjamin</h3>
                                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    Proses verifikasi pemilik dan pembayaran yang aman melalui platform kami.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-white dark:bg-[#161615]">
                            <CardContent className="p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <Zap className="size-6" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">Respon Cepat</h3>
                                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    Hubungi pemilik langsung melalui WhatsApp untuk respon yang lebih cepat.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Recommended Kos Section */}
            <section className="py-20 bg-white dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h2 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">Rekomendasi Hunian</h2>
                            <p className="text-neutral-500 dark:text-neutral-400">Kos terbaru dan terpopuler pilihan kami untuk Anda.</p>
                        </div>
                        <Link href="/pendaftaran-kos" className="hidden sm:block text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                            Lihat Semua Properti &rarr;
                        </Link>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {kos.length > 0 ? (
                            kos.map((k: any) => (
                                <Card key={k.id} className="group overflow-hidden border-neutral-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-[#161615]">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={`/storage/${k.image}`}
                                            alt={k.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
                                                <Home className="size-2.5" />
                                                <span>Premium Kos</span>
                                            </div>
                                            {(() => {
                                                const availableCount = k.rooms.filter((r: any) => r.status === 'tersedia').length;
                                                return (
                                                    <Badge className={`backdrop-blur-sm border-2 h-5 px-2 transition-colors duration-300 ${availableCount === 0
                                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                        }`}>
                                                        {availableCount} Kamar
                                                    </Badge>
                                                );
                                            })()}
                                        </div>
                                        <h3 className="mb-1 text-base font-bold text-neutral-900 group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-primary/80 line-clamp-1">
                                            {k.name}
                                        </h3>
                                        <p className="mb-3 flex items-center text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                                            <MapPin className="mr-1 size-2.5 shrink-0" />
                                            {k.address}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-neutral-400">Mulai dari</span>
                                                <span className="text-sm font-bold text-primary dark:text-primary-foreground">
                                                    Rp {k.rooms[0]?.monthly_rate?.toLocaleString()}<span className="text-[10px] font-normal text-neutral-400">/bln</span>
                                                </span>
                                            </div>
                                            <Link href={`/kos/${k.slug}`}>
                                                <Button size="sm" variant="outline" className="h-8 rounded-full px-4 text-xs hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                    Detail
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center gap-4 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                                <Home className="size-12 text-neutral-300" />
                                <div className="space-y-1">
                                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                        {filters.search
                                            ? `Tidak ditemukan hasil untuk "${filters.search}"`
                                            : "Belum ada kos tersedia saat ini."}
                                    </p>
                                    {filters.search && (
                                        <Link href="/">
                                            <Button variant="link" className="text-primary p-0 h-auto">
                                                Lihat semua properti
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center sm:hidden">
                        <Link href="/pendaftaran-kos">
                            <Button variant="outline" className="w-full h-12 border-neutral-200">
                                Lihat Semua Properti
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
