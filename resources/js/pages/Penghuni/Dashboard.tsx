import { Head } from '@inertiajs/react';
import { User, Home, BedDouble, CreditCard, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
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
        monthly_rate: number;
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
                <div className="flex flex-1 items-center justify-center p-6">
                    <Card className="max-w-md w-full text-center">
                        <CardContent className="py-12">
                            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                            <h2 className="text-lg font-semibold mb-2">Data Belum Tersedia</h2>
                            <p className="text-sm text-muted-foreground">
                                Data penghuni Anda belum terdaftar di sistem. Silakan hubungi pemilik kos.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-hidden">

                {/* Greeting */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Selamat Datang, {penghuni.name}! 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Berikut ringkasan informasi kos Anda.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {penyewaan && (
                        <Card className="border-t-4 border-t-[#664229] shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Kamar Saya</CardTitle>
                                <div className="p-2 bg-[#664229]/10 rounded-full">
                                    <BedDouble className="h-4 w-4 text-[#664229]" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {penyewaan.room.room_number}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatCurrency(Number(penyewaan.room.monthly_rate))}/bulan
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="border-t-4 border-t-yellow-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Tagihan Belum Dibayar</CardTitle>
                            <div className="p-2 bg-yellow-50 rounded-full">
                                <CreditCard className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tagihanAktif}</div>
                            <p className="text-xs text-muted-foreground mt-1">Invoice perlu dibayar</p>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-green-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Terbayar</CardTitle>
                            <div className="p-2 bg-green-50 rounded-full">
                                <CreditCard className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalTerbayar)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pembayaran lunas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Data Diri */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-[#664229]/10 rounded-full">
                                    <User className="h-5 w-5 text-[#664229]" />
                                </div>
                                <CardTitle className="text-lg font-semibold">Data Diri</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                                    <p className="text-sm font-medium">{penghuni.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-sm text-muted-foreground">No. WhatsApp</p>
                                    <p className="text-sm font-medium">{penghuni.no_wa || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-sm text-muted-foreground">Alamat Asal</p>
                                    <p className="text-sm font-medium">{penghuni.address || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-sm text-muted-foreground">Agama</p>
                                    <p className="text-sm font-medium">{penghuni.religion || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Kos */}
                    {penyewaan && (
                        <Card className="shadow-sm">
                            <CardHeader className="border-b border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-[#664229]/10 rounded-full">
                                        <Home className="h-5 w-5 text-[#664229]" />
                                    </div>
                                    <CardTitle className="text-lg font-semibold">Informasi Kos</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Nama Kos</p>
                                        <p className="text-sm font-medium">{penyewaan.room.kos.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Alamat Kos</p>
                                        <p className="text-sm font-medium">{penyewaan.room.kos.address}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Kamar</p>
                                        <p className="text-sm font-medium">{penyewaan.room.room_number}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Biaya/Bulan</p>
                                        <p className="text-sm font-medium">{formatCurrency(Number(penyewaan.room.monthly_rate))}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Tanggal Masuk</p>
                                        <p className="text-sm font-medium">{formatDate(penyewaan.start_date)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            {penyewaan.status === 'aktif' ? 'Aktif' : penyewaan.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
