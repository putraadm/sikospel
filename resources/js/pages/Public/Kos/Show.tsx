import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselDots, CarouselItem } from '@/components/ui/carousel';
import { BreadcrumbItem, Kos, Room } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MapPin, User, Phone, Home, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Props {
    kos: Kos;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/',
    },
    {
        title: 'Detail Kos',
        href: '#',
    },
];

export default function Show({ kos }: Props) {
    const availableRooms = kos.rooms?.filter((room) => room.status === 'tersedia') || [];

    return (
        <MainLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kos ${kos.name}`} />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Hero Section */}
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
                    <img
                        src={`/storage/${kos.image}`}
                        alt={kos.name}
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">{kos.name}</h1>
                        <p className="flex items-center text-sm md:text-lg opacity-90 capitalize">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                            {kos.address}
                        </p>
                    </div>
                    <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10">
                        <Badge className="bg-primary hover:bg-primary/90 text-sm md:text-base px-4 py-1.5 shadow-lg border-none">
                            Tersedia {availableRooms.length} Kamar
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-sm bg-white dark:bg-[#161615]">
                            <CardHeader>
                                <CardTitle className="flex items-center text-xl font-semibold">
                                    <Info className="w-5 h-5 mr-2 text-primary" />
                                    Informasi Kos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-[#706f6c] dark:text-[#A1A09A] px-6 pb-6">
                                <div className="leading-relaxed whitespace-pre-wrap">
                                    {kos.description || `Terletak di lokasi strategis, ${kos.name} menawarkan kenyamanan dan fasilitas yang memadai bagi para penghuni. Dekat dengan berbagai fasilitas umum dan akses yang mudah.`}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Home className="w-6 h-6 mr-2 text-primary" />
                                Tipe Kamar
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(() => {
                                    // Group rooms by type_kamar_id to display unique types
                                    const uniqueTypes = new Map();
                                    kos.rooms?.forEach(room => {
                                        if (room.type_kamar && !uniqueTypes.has(room.type_kamar_id)) {
                                            uniqueTypes.set(room.type_kamar_id, {
                                                ...room.type_kamar,
                                                availableCount: 0,
                                                totalCount: 0
                                            });
                                        }
                                        if (room.type_kamar) {
                                            const type = uniqueTypes.get(room.type_kamar_id);
                                            type.totalCount++;
                                            if (room.status === 'tersedia') {
                                                type.availableCount++;
                                            }
                                        }
                                    });

                                    const types = Array.from(uniqueTypes.values());

                                    return types.length > 0 ? (
                                        types.map((type) => (
                                            <Card key={type.id} className="flex flex-col overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                                                <div className="h-48 overflow-hidden shrink-0 relative">
                                                    {type.images && type.images.length > 0 ? (
                                                        <img src={`/storage/${type.images[0].gambar}`} alt={type.nama} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
                                                    ) : (
                                                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2">
                                                        <Badge variant={type.availableCount > 0 ? "default" : "secondary"} className={type.availableCount > 0 ? "bg-green-600 hover:bg-green-700" : ""}>
                                                            {type.availableCount} Tersedia
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-grow flex flex-col justify-between gap-4 bg-white dark:bg-[#161615]">
                                                    <div className="space-y-2">
                                                        <h3 className="text-xl font-bold">{type.nama}</h3>
                                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] line-clamp-2">
                                                            {type.deskripsi || 'Fasilitas lengkap untuk kenyamanan Anda.'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t pt-4 border-neutral-100 dark:border-neutral-800">
                                                        <span className="text-xl font-bold text-primary">
                                                            Rp {Number(type.harga || 0).toLocaleString('id-ID')}<span className="text-xs text-gray-400 font-normal">/bulan</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-center py-10 text-gray-500 border-2 border-dashed rounded-xl col-span-full w-full">Belum ada tipe kamar yang tersedia.</p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-[#161615]">
                            <div className="h-2 bg-primary"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <User className="w-5 h-5 mr-2 text-primary" />
                                    Pemilik Kos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-6 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                                        {kos.owner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{kos.owner.name}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-[#3E3E3A]">
                                    <a
                                        href={`https://wa.me/${kos.owner.no_wa?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full block"
                                    >
                                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                                            <Phone className="w-4 h-4" />
                                            Hubungi via WhatsApp
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary text-white border-none shadow-lg">
                            <CardContent className="px-6">
                                <h3 className="text-xl font-bold mb-2">Cari Hunian Nyaman?</h3>
                                <p className="text-primary-foreground/80 text-sm text-justify mb-8">
                                    Temukan kenyamanan belajar dan beristirahat di sini. Daftarkan diri Anda sekarang untuk mulai menyewa.
                                </p>
                                <Link href={`/pendaftaran-kos-${kos.slug}`}>
                                    <Button className="w-full bg-white text-primary hover:bg-neutral-100 font-bold border-none">
                                        Daftar Sekarang
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
