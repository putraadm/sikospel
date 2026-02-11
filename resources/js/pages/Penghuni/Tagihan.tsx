import { Head } from '@inertiajs/react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tagihan', href: '/penghuni/tagihan' },
];

interface InvoiceData {
    id: number;
    tenancy_id: number;
    amount: string;
    due_date: string;
    billing_period: string;
    status: 'belum_dibayar' | 'lunas' | 'terlambat';
    tenancy: {
        room: {
            room_number: string;
            kos: {
                name: string;
            };
        };
    };
}

interface Props {
    invoices: InvoiceData[];
}

export default function Tagihan({ invoices }: Props) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const formatPeriod = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const statusConfig = {
        belum_dibayar: {
            label: 'Belum Dibayar',
            icon: <Clock className="h-4 w-4" />,
            badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            borderClass: 'border-l-yellow-500',
        },
        lunas: {
            label: 'Lunas',
            icon: <CheckCircle className="h-4 w-4" />,
            badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            borderClass: 'border-l-green-500',
        },
        terlambat: {
            label: 'Terlambat',
            icon: <AlertTriangle className="h-4 w-4" />,
            badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            borderClass: 'border-l-red-500',
        },
    };

    const belumDibayar = invoices.filter(i => i.status === 'belum_dibayar' || i.status === 'terlambat');
    const lunas = invoices.filter(i => i.status === 'lunas');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tagihan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-hidden">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tagihan Saya</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Daftar tagihan sewa kos Anda.
                    </p>
                </div>

                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-t-4 border-t-yellow-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Belum Dibayar</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{belumDibayar.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-green-500 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Lunas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lunas.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-[#664229] shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Tagihan</CardTitle>
                            <CreditCard className="h-4 w-4 text-[#664229]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{invoices.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice List */}
                {invoices.length > 0 ? (
                    <div className="space-y-3">
                        {invoices.map((invoice) => {
                            const config = statusConfig[invoice.status];
                            return (
                                <Card key={invoice.id} className={`shadow-sm border-l-4 ${config.borderClass}`}>
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        Tagihan {formatPeriod(invoice.billing_period)}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}>
                                                        {config.icon}
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Jatuh tempo: {formatDate(invoice.due_date)}
                                                    </span>
                                                    <span>
                                                        Kamar {invoice.tenancy?.room?.room_number} - {invoice.tenancy?.room?.kos?.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(Number(invoice.amount))}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Belum Ada Tagihan</h3>
                            <p className="text-sm text-muted-foreground">
                                Tagihan sewa Anda akan muncul di sini.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
