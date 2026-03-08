import { Head } from '@inertiajs/react';
import { User, Home, BedDouble, CreditCard, AlertCircle, MapPin, Calendar, CheckCircle2, ShieldCheck, Phone, Hash } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Penghuni', href: '/dashboard' },
];

interface PenghuniData {
    id: number;
    user_id: number;
    name: string;
    no_wa: string;
    address: string;
    religion: string;
}

interface PenyewaanData {
    id: number;
    start_date: string;
    end_date: string | null;
    status: string;
    room: {
        room_number: string;
        type_kamar?: {
            id: number;
            nama: string;
            harga: number;
        };
        kos: {
            name: string;
            address: string;
        };
    };
}

interface Props {
    penghuni: PenghuniData | null;
    penyewaan: PenyewaanData | null;
    tagihanAktif: number;
    totalTerbayar: number;
}

export default function Dashboard({ penghuni, penyewaan, tagihanAktif, totalTerbayar }: Props) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!penghuni) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex flex-1 items-center justify-center p-6 bg-[#fcfcfc]">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                            <AlertCircle className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Data Belum Terdaftar</h2>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Akun Anda belum terhubung dengan data penghuni aktif. <br />
                                Silakan hubungi administrasi kos untuk informasi lebih lanjut.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Penghuni" />

            <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 bg-[#fafafa]">

                {/* Formal Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#664229] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                            <ShieldCheck size={14} /> Portal Penghuni Resmi
                        </div>
                        <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                            Selamat Datang, <span className="font-semibold text-[#664229]">{penghuni.name}</span>
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">Status hunian dan laporan tagihan per hari ini.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-right">Verifikasi Akun</p>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 rounded-md font-bold px-3 py-1">AKTIF & TERVERIFIKASI</Badge>
                        </div>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-[#664229]"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kamar Terdaftar</span>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{penyewaan?.room.room_number || '-'}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{penyewaan?.room.type_kamar?.nama}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <Home className="text-slate-300" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-amber-500"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Aktif</span>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{tagihanAktif}</h3>
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Perlu Pelunasan</span>
                                    </div>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <CreditCard className="text-slate-300" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-[#664229]"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Terbayar</span>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalTerbayar)}</h3>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="text-slate-300" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Official Data Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Dokumentasi Profil</h2>
                            <div className="w-full h-[1px] bg-slate-200"></div>
                        </div>

                        <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    <InfoRow label="Nama Lengkap" value={penghuni.name} icon={<User size={14} />} />
                                    <InfoRow label="Telepon" value={penghuni.no_wa || '-'} icon={<Phone size={14} />} />
                                    <InfoRow label="Alamat Terdaftar" value={penghuni.address || '-'} icon={<MapPin size={14} />} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Occupancy Detail Section */}
                    {penyewaan && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status Hunian</h2>
                                <div className="w-full h-[1px] bg-slate-200"></div>
                            </div>

                            <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
                                <CardHeader className="bg-slate-50/30 border-b border-slate-100 px-8 py-5">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-black text-[#664229] flex items-center gap-2 uppercase tracking-widest">
                                            Informasi Unit
                                        </CardTitle>
                                        <Badge className="bg-emerald-500 text-white border-none rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter">Aktif</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        <InfoRow label="Lokasi Kos" value={penyewaan.room.kos.name} icon={<Home size={14} />} />
                                        <InfoRow label="Alamat Kos" value={penyewaan.room.kos.address} icon={<MapPin size={14} />} />
                                        <InfoRow label="Identitas Unit" value={penyewaan.room.room_number} icon={<BedDouble size={14} />} highlight />
                                        <InfoRow label="Tanggal Masuk" value={formatDate(penyewaan.start_date)} icon={<Calendar size={14} />} />
                                    </div>
                                    <div className="bg-[#664229]/5 p-6 border-t border-[#664229]/10">
                                        <div className="flex gap-4 items-start">
                                            <div className="p-2.5 bg-white ring-1 ring-[#664229]/20 rounded-lg text-[#664229]">
                                                <AlertCircle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-[#664229] uppercase tracking-[0.1em] mb-1">Informasi Kebijakan</p>
                                                <p className="text-[11px] text-[#664229]/70 leading-relaxed font-semibold">
                                                    Semua proses administrasi bersifat digital. Verifikasi fisik dapat dilakukan di kantor manajemen operasional jika diperlukan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function InfoRow({ label, value, icon, highlight = false }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
    return (
        <div className="flex items-center gap-6 px-8 py-5 transition-colors hover:bg-slate-50/30">
            <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${highlight ? 'bg-[#664229] text-white' : 'bg-slate-50 text-slate-300'}`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 leading-none">{label}</p>
                <p className={`text-sm font-semibold tracking-tight ${highlight ? 'text-[#664229]' : 'text-slate-800'}`}>{value}</p>
            </div>
        </div>
    );
}
