import MainLayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from '@/components/ui/carousel';
import { BreadcrumbItem, TypeKamar, Kos } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Home, Info, Smartphone, Wind, Wifi, Coffee, Shirt, Zap, Image as ImageIcon, MapPin, Bed, Monitor, Shield, Fan, Calendar, MessageCircle } from 'lucide-react';

interface Props {
    typeKamar: TypeKamar;
    kos: Kos | null;
}

export default function Show({ typeKamar, kos }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/' },
        { title: kos ? `Kos ${kos.name}` : 'Kos', href: kos ? `/kos/${kos.slug}` : '#' },
        { title: `Tipe ${typeKamar.nama}`, href: '#' },
    ];

    const iconsMap: Record<string, any> = {
        'AC': Wind,
        'Kipas Angin': Fan,
        'WiFi': Wifi,
        'Kamar Mandi Dalam': CheckCircle2,
        'Kamar Mandi Luar': Info,
        'Kasur Besar': Bed,
        'Kasur Kecil': Bed,
        'Lemari Pakaian': Shirt,
        'Meja & Kursi': Home,
        'Laundry': Shirt,
        'Dapur Bersama': Coffee,
        'CCTV': Shield,
        'TV': Monitor,
        'Listrik (Token)': Zap,
    };

    const currentFacilities = typeKamar.facilities && typeKamar.facilities.length > 0
        ? typeKamar.facilities
        : ['WiFi', 'AC', 'Kasur', 'Lemari Pakaian'];

    return (
        <MainLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tipe ${typeKamar.nama}`} />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6">
                    <Link
                        href={kos ? `/kos/${kos.slug}` : '/'}
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke {kos ? `Kos ${kos.name}` : 'Beranda'}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image Gallery Section */}
                    <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-neutral-100 dark:bg-neutral-900 group">
                            {typeKamar.images && typeKamar.images.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {typeKamar.images.map((img: any) => (
                                            <CarouselItem key={img.id} className="basis-full">
                                                <div className="aspect-[4/3] w-full relative">
                                                    <img
                                                        src={`/storage/${img.gambar}`}
                                                        alt={typeKamar.nama}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CarouselPrevious className="relative left-0 translate-x-0" />
                                        <CarouselNext className="relative right-0 translate-x-0" />
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0">
                                        <CarouselDots />
                                    </div>
                                </Carousel>
                            ) : (
                                <div className="aspect-[4/3] flex items-center justify-center text-muted-foreground">
                                    <ImageIcon className="w-16 h-16 opacity-20" />
                                </div>
                            )}
                        </div>

                        {typeKamar.images && typeKamar.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {typeKamar.images.map((img: any) => (
                                    <div key={img.id} className="aspect-square rounded-lg overflow-hidden border shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                                        <img
                                            src={`/storage/${img.gambar}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information Section */}
                    <div className="flex flex-col h-full space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-primary hover:bg-primary shadow-none px-3 py-1">Tipe Kamar</Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
                                {typeKamar.nama}
                            </h1>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-[#664229] dark:text-[#D4A373]">
                                    Rp {Number(typeKamar.harga * 30).toLocaleString('id-ID')}
                                </span>
                                <span className="text-muted-foreground">/ bulan</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white dark:bg-[#161615] border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Deskripsi Detail
                            </h3>
                            <p className="text-[#706f6c] dark:text-[#A1A09A] leading-relaxed text-sm md:text-base text-justify">
                                {typeKamar.deskripsi || 'Nikmati hunian eksklusif dengan desain modern dan fasilitas lengkap. Kamar ini dirancang untuk memberikan kenyamanan maksimal bagi produktivitas dan istirahat Anda.'}
                            </p>
                        </div>

                        {kos && (
                            <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 shadow-sm space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                    <MapPin className="w-4 h-4" />
                                    Tersedia di Kos {kos.name}
                                </h3>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                    Tipe kamar ini tersedia di properti {kos.name} yang berlokasi di {kos.address}.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                Fasilitas Kamar
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {currentFacilities.map((fac: string, i: number) => {
                                    const Icon = iconsMap[fac] || Info;
                                    return (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-primary/30 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#161615] flex items-center justify-center text-primary shadow-sm">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-medium">{fac}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="p-6 rounded-2xl bg-[#664229]/5 border border-[#664229]/20 text-center space-y-4">
                                <div className="w-12 h-12 bg-[#664229]/10 rounded-full flex items-center justify-center mx-auto text-[#664229]">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">Ingin Menyewa Kamar Ini?</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Untuk mendaftar, silakan buat janji bertemu terlebih dahulu dengan pemilik kos. Pendaftaran penghuni akan dilakukan langsung oleh pemilik di lokasi.
                                </p>
                                {kos && kos.owner ? (
                                    <a
                                        href={`https://wa.me/${kos.owner.no_wa?.replace(/\D/g, '')}?text=Halo%20${kos.owner.name},%20saya%20tertarik%20dengan%20Tipe%20${typeKamar.nama}%20di%20${kos.name}.%20Bisa%20atur%20jadwal%20bertemu?`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full block"
                                    >
                                        <Button className="w-full text-lg font-bold h-14 rounded-2xl shadow-lg bg-[#664229] hover:bg-[#664229]/90 text-white gap-2">
                                            <MessageCircle className="w-5 h-5" />
                                            Buat Janji Bertemu Pemilik
                                        </Button>
                                    </a>
                                ) : (
                                    <Button disabled className="w-full text-lg font-bold h-14 rounded-2xl bg-neutral-200 text-neutral-500">
                                        Hubungi Pemilik Kos
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
