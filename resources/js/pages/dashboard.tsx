import { Head } from '@inertiajs/react';
import {
    Users,
    Home,
    BedDouble,
    CreditCard,
    Clock,
    UserPlus
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    totalPenghuni: number;
    jumlahKos: number;
    totalKamar: number;
    totalPendapatan: number;
    latestPenghuni: Array<{
        user_id: number;
        name: string;
        created_at: string;
        user: {
            email: string;
            avatar?: string;
        }
    }>;
    latestPayments: Array<{
        id: number;
        amount_paid: number;
        payment_date: string;
        status: string;
        method: string;
    }>;
}

export default function Dashboard({
    totalPenghuni = 0,
    jumlahKos = 0,
    totalKamar = 0,
    totalPendapatan = 0,
    latestPenghuni = [],
    latestPayments = []
}: DashboardProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-hidden">

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-t-4 border-t-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Penghuni</CardTitle>
                            <div className="p-2 bg-[#664229]/10 rounded-full">
                                <Users className="h-4 w-4 text-[#664229]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalPenghuni}</div>
                            <p className="text-xs text-muted-foreground mt-1">Orang terdaftar aktif</p>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Jumlah Kos</CardTitle>
                            <div className="p-2 bg-[#664229]/10 rounded-full">
                                <Home className="h-4 w-4 text-[#664229]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{jumlahKos}</div>
                            <p className="text-xs text-muted-foreground mt-1">Unit properti kos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Kamar</CardTitle>
                            <div className="p-2 bg-[#664229]/10 rounded-full">
                                <BedDouble className="h-4 w-4 text-[#664229]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalKamar}</div>
                            <p className="text-xs text-muted-foreground mt-1">Kamar tersedia/terisi</p>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
                            <div className="p-2 bg-[#664229]/10 rounded-full">
                                <CreditCard className="h-4 w-4 text-[#664229]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendapatan)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total pemasukan tercatat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recap Sections */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                    {/* Rekap Penghuni - Col Span 4 */}
                    <Card className="col-span-4 shadow-sm border border-gray-100">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-gray-800">Penghuni Baru</CardTitle>
                                    <CardDescription className="text-sm">
                                        5 penghuni yang baru bergabung dengan kos Anda.
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 px-6">
                            <div className="space-y-6">
                                {latestPenghuni.length > 0 ? (
                                    latestPenghuni.map((penghuni) => (
                                        <div key={penghuni.user_id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-gray-200">
                                                    <AvatarImage src={penghuni.user.avatar} alt={penghuni.name} />
                                                    <AvatarFallback className="bg-[#664229] text-white font-medium">
                                                        {penghuni.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#664229] transition-colors">
                                                        {penghuni.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {penghuni.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border px-3 py-1 rounded-full shadow-sm">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatDate(penghuni.created_at)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                                        <Users className="h-10 w-10 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Belum ada data penghuni baru.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rekap Pendapatan - Col Span 3 */}
                    <Card className="col-span-3 shadow-sm border border-gray-100">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-gray-800">Transaksi Terakhir</CardTitle>
                                    <CardDescription className="text-sm">
                                        Riwayat 5 pembayaran sewa masuk.
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-green-50 text-green-600 rounded-full">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 px-6">
                            <div className="space-y-6">
                                {latestPayments.length > 0 ? (
                                    latestPayments.map((payment) => (
                                        <div key={payment.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Pembayaran Sewa
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatDate(payment.payment_date)}
                                                    </span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{payment.method || 'Transfer'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold text-[#664229]">
                                                    +{formatCurrency(payment.amount_paid)}
                                                </span>
                                                <Badge variant={
                                                    payment.status === 'sukses' ? 'default' :
                                                        payment.status === 'pending' ? 'secondary' : 'destructive'
                                                } className={`text-[10px] px-2 py-0.5 pointer-events-none ${payment.status === 'sukses' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' :
                                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 shadow-none' :
                                                            'bg-red-100 text-red-700 hover:bg-red-100 shadow-none'
                                                    }`}>
                                                    {payment.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                                        <CreditCard className="h-10 w-10 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Belum ada data transaksi.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
