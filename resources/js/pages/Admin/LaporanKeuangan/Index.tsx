import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileSpreadsheet, Search, Filter, ArrowUpDown, TrendingUp, Calendar, Home, CreditCard } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';

interface Payment {
    id: number;
    payment_date: string;
    amount_paid: string | number;
    method: string;
    invoice: {
        billing_period: string;
        tenancy: {
            penghuni: {
                name: string;
            };
            room: {
                room_number: string;
                kos: {
                    name: string;
                };
                typeKamar: {
                    nama: string;
                };
            };
        };
    };
}

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: {
        today: number;
        month: number;
        year: number;
        total: number;
    };
    filters: {
        bulan?: string;
        tahun?: string;
        kos_id?: string;
        method?: string;
        search?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
    kosList: { id: number; name: string }[];
    methods: string[];
}

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function Index({ payments, stats, filters, kosList, methods }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [localFilters, setLocalFilters] = useState({
        bulan: String(filters.bulan || 'all'),
        tahun: String(filters.tahun || 'all'),
        kos_id: String(filters.kos_id || 'all'),
        method: String(filters.method || 'all'),
        search: filters.search || '',
        sort: filters.sort ? `${filters.sort}-${filters.direction || 'desc'}` : 'payment_date-desc'
    });

    useEffect(() => {
        setLocalFilters({
            bulan: String(filters.bulan || 'all'),
            tahun: String(filters.tahun || 'all'),
            kos_id: String(filters.kos_id || 'all'),
            method: String(filters.method || 'all'),
            search: filters.search || '',
            sort: filters.sort ? `${filters.sort}-${filters.direction || 'desc'}` : 'payment_date-desc'
        });
    }, [filters]);


    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(amount));
    };

    const handleFilterChange = (key: string, value: any) => {
        const nextFilters = { ...localFilters, [key]: value };
        setLocalFilters(nextFilters);

        if (key === 'search') return;

        applyFilters(nextFilters);
    };

    const applyFilters = (filtersToApply: typeof localFilters) => {
        const queryParams: Record<string, string> = {};

        if (filtersToApply.bulan !== 'all') queryParams.bulan = filtersToApply.bulan;
        if (filtersToApply.tahun !== 'all') queryParams.tahun = filtersToApply.tahun;
        if (filtersToApply.kos_id !== 'all') queryParams.kos_id = filtersToApply.kos_id;
        if (filtersToApply.method !== 'all') queryParams.method = filtersToApply.method;
        if (filtersToApply.search) queryParams.search = filtersToApply.search;

        // Parse sort string like 'payment_date-desc'
        const sortStr = filtersToApply.sort || 'payment_date-desc';
        const dashIdx = sortStr.lastIndexOf('-');
        queryParams.sort = dashIdx > -1 ? sortStr.substring(0, dashIdx) : 'payment_date';
        queryParams.direction = dashIdx > -1 ? sortStr.substring(dashIdx + 1) : 'desc';

        console.log('Navigating with params:', queryParams);
        router.get('/admin/laporan-keuangan', queryParams, {
            replace: true,
            preserveScroll: true,
            onSuccess: () => console.log('Navigation Success'),
            onError: (err) => console.error('Navigation Error', err),
        });
    };

    const handleSearch = () => {
        applyFilters(localFilters);
    };

    const handleReset = () => {
        const resetState = {
            bulan: 'all',
            tahun: 'all',
            kos_id: 'all',
            method: 'all',
            search: '',
            sort: 'payment_date-desc'
        };
        setLocalFilters(resetState);
        applyFilters(resetState);
    };

    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        const nextSortStr = `${column}-${direction}`;
        const next = { ...localFilters, sort: nextSortStr };
        setLocalFilters(next);
        applyFilters(next);
    };

    return (
        <AppLayout>
            <Head title="Laporan Keuangan" />

            <div className="space-y-6 p-4 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#664229]">Laporan Keuangan</h1>
                    <p className="text-muted-foreground mt-1">Rekapitulasi seluruh pemasukan dari pembayaran tagihan kos yang berstatus lunas.</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pemasukan Hari Ini</CardTitle>
                            <TrendingUp className="h-4 w-4 text-[#664229]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#664229]">{formatCurrency(stats.today)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total pembayaran masuk hari ini</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-[#664229]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#664229]">{formatCurrency(stats.month)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total pembayaran di bulan berjalan</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-[#664229] shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pemasukan Tahun Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-[#664229]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#664229]">{formatCurrency(stats.year)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total pembayaran di tahun berjalan</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#664229] text-white shadow-lg overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="h-24 w-24" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pemasukan (Filtered)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
                            <p className="text-xs opacity-80 mt-1">Akumulasi sesuai filter yang aktif</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card className="shadow-sm border-none bg-slate-50/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#664229] uppercase tracking-wider">Bulan</label>
                                    <Select
                                        value={localFilters.bulan}
                                        onValueChange={(v) => {
                                            console.log('Bulan selected:', v);
                                            handleFilterChange('bulan', v);
                                        }}
                                    >
                                        <SelectTrigger className="bg-white border-[#664229]/20 focus:ring-[#664229]">
                                            <SelectValue placeholder="Semua Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Bulan</SelectItem>
                                            {MONTHS.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#664229] uppercase tracking-wider">Tahun</label>
                                    <Select
                                        value={localFilters.tahun}
                                        onValueChange={(v) => handleFilterChange('tahun', v)}
                                    >
                                        <SelectTrigger className="bg-white border-[#664229]/20 focus:ring-[#664229]">
                                            <SelectValue placeholder="Semua Tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Tahun</SelectItem>
                                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#664229] uppercase tracking-wider">Metode</label>
                                    <Select
                                        value={localFilters.method}
                                        onValueChange={(v) => handleFilterChange('method', v)}
                                    >
                                        <SelectTrigger className="bg-white border-[#664229]/20 focus:ring-[#664229]">
                                            <SelectValue placeholder="Semua Metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Metode</SelectItem>
                                            {methods.filter(m => m && m.trim() !== "").map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-[#664229] uppercase tracking-wider">Kos</label>
                                    <Select
                                        value={localFilters.kos_id}
                                        onValueChange={(v) => handleFilterChange('kos_id', v)}
                                    >
                                        <SelectTrigger className="bg-white border-[#664229]/20 focus:ring-[#664229]">
                                            <SelectValue placeholder="Semua Kos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Kos</SelectItem>
                                            {kosList.map(k => (
                                                <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#664229] uppercase tracking-wider">Urutkan</label>
                                    <Select
                                        value={localFilters.sort}
                                        onValueChange={(v: string) => {
                                            console.log('Sort selection:', v);
                                            const [sort, direction] = v.split('-');
                                            router.get(route('admin.laporan-keuangan.index'), { ...localFilters, sort, direction }, {
                                                preserveScroll: true,
                                                onSuccess: () => console.log('Sort navigation success'),
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="bg-white border-[#664229]/20 focus:ring-[#664229]">
                                            <SelectValue placeholder="Urutkan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="payment_date-desc">Tanggal (Terbaru)</SelectItem>
                                            <SelectItem value="payment_date-asc">Tanggal (Terlama)</SelectItem>
                                            <SelectItem value="amount_paid-desc">Nominal (Tertinggi)</SelectItem>
                                            <SelectItem value="amount_paid-asc">Nominal (Terendah)</SelectItem>
                                            <SelectItem value="penghuni_name-asc">Nama (A-Z)</SelectItem>
                                            <SelectItem value="penghuni_name-desc">Nama (Z-A)</SelectItem>
                                            <SelectItem value="kos_name-asc">Kos (A-Z)</SelectItem>
                                            <SelectItem value="type_kamar-asc">Tipe Kamar (A-Z)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}
                            </div>
                            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9 bg-white border-[#664229]/20"
                                        placeholder="Cari Penghuni..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <Button className="bg-[#664229] hover:bg-[#523521]" onClick={handleSearch}>Cari</Button>
                                <Button variant="ghost" className="text-[#664229]" onClick={handleReset}>Reset</Button>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2 justify-end">
                            <Button variant="outline" className="text-[#664229] border-[#664229] hover:bg-[#664229]/10" onClick={() => window.open(route('admin.laporan-keuangan.export-pdf', filters), '_blank')}>
                                <FileDown className="h-4 w-4 mr-2" /> PDF
                            </Button>
                            <Button variant="outline" className="text-green-700 border-green-700 hover:bg-green-50" onClick={() => window.open(route('admin.laporan-keuangan.export-excel', filters), '_blank')}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="shadow-sm border-none overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#664229]/5">
                            <TableRow className="hover:bg-transparent border-[#664229]/10">
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('payment_date')}>
                                    Tanggal Bayar <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('penghuni_name')}>
                                    Nama Penghuni <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('kos_name')}>
                                    Nama Kos <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('type_kamar')}>
                                    Type Kamar <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('billing_period')}>
                                    Periode Tagihan <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('amount_paid')}>
                                    Nominal Bayar <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                                <TableHead className="text-[#664229] font-bold cursor-pointer" onClick={() => handleSort('method')}>
                                    Metode Pembayaran <ArrowUpDown className="inline h-3 w-3 ml-1" />
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.length > 0 ? (
                                payments.data.map((payment) => (
                                    <TableRow key={payment.id} className="border-[#664229]/5 hover:bg-[#664229]/5 transition-colors">
                                        <TableCell className="font-medium text-xs">
                                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(payment.payment_date))}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-slate-900">{payment.invoice?.tenancy?.penghuni?.name || 'N/A'}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {payment.invoice?.tenancy?.room?.kos?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                <div className="font-medium text-[#664229]">{payment.invoice?.tenancy?.room?.typeKamar?.nama || 'Unknown'}</div>
                                                <div className="text-muted-foreground">Kamar {payment.invoice?.tenancy?.room?.room_number || '-'}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {payment.invoice?.billing_period ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(payment.invoice.billing_period)) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-[#664229]">{formatCurrency(payment.amount_paid)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] bg-white text-[#664229] border-[#664229]/30 capitalize">
                                                {payment.method || 'Default'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Tidak ada data pemasukan ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="py-4 px-6 bg-slate-50/50 border-t border-[#664229]/5 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-[#664229]">{payments.data.length}</span> dari <span className="font-medium">{payments.total}</span> data
                        </div>
                        <div className="flex gap-1">
                            {payments.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    className={link.active ? 'bg-[#664229] hover:bg-[#523521]' : 'text-[#664229] border-[#664229]/20'}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    size="sm"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </Card>

            </div>
        </AppLayout>
    );
}
