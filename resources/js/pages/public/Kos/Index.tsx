import MainLayout from '@/components/main-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { MapPin, ArrowRight, Home, CheckCircle2 } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface Props {
    kos: any[];
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/',
    },
    {
        title: 'Cari Kos',
        href: '#',
    },
];

export default function Index({ kos, filters }: Props) {
    return (
        <MainLayout breadcrumbs={breadcrumbs}>
            <Head title="Cari Hunian Impian" />

            <div className="bg-[#f8f1ea] dark:bg-[#0d0907] py-16 overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c0a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c0a_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-12 bg-[#8b5e3c]"></div>
                            <span className="text-sm font-black uppercase tracking-[0.3em] text-[#8b5e3c]">Semua Properti</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-[#1e110a] dark:text-[#f8f1ea] tracking-tighter leading-none mb-6">
                            Temukan <span className="text-primary italic">Hunianmu</span>
                        </h1>
                        <p className="text-lg text-[#3e2717]/60 dark:text-white/60 max-w-2xl font-medium">
                            {filters.search
                                ? `Menampilkan hasil pencarian untuk "${filters.search}"`
                                : "Jelajahi berbagai pilihan kos terbaik yang telah kami kurasi khusus untuk kenyamanan Anda."}
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {kos.length > 0 ? (
                            kos.map((k: any) => (
                                <Card key={k.id} className="group border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0d0907] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                                    <Link href={`/kos/${k.slug}`} className="flex flex-col h-full w-full">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem] shrink-0 border-b border-neutral-100 dark:border-neutral-800">
                                            <img
                                                src={`/storage/${k.image}`}
                                                alt={k.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
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
                </div>
            </div>
        </MainLayout>
    );
}
