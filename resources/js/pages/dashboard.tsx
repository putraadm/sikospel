import { Head } from '@inertiajs/react';
import {
    Users,
    Home,
    BedDouble,
    CreditCard,
    Clock,
    UserPlus,
    TrendingUp
} from 'lucide-react';
import { useState, useMemo } from 'react';

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
    sipenkosLaporan?: Array<{
        id: number;
        kos_id: number;
        pemilik_id: number;
        nama_kos: string;
        nama_penghuni: string;
        nomor_kamar: string;
        tipe_kamar: string;
        periode_tagihan: string;
        metode_pembayaran: string;
        nominal: string | number;
        tanggal_pembayaran: string;
    }>;
    kosList?: Array<{
        id: number;
        name: string;
    }>;
}

export default function Dashboard({
    totalPenghuni = 0,
    jumlahKos = 0,
    totalKamar = 0,
    totalPendapatan = 0,
    latestPenghuni = [],
    latestPayments = [],
    sipenkosLaporan = [],
    kosList = []
}: DashboardProps) {

    const [selectedKosId, setSelectedKosId] = useState<string>('all');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const processedData = useMemo(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const months: Array<{
            key: string;
            label: string;
            total: number;
            count: number;
        }> = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1); // prevent month skipping
            d.setMonth(d.getMonth() - i);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                total: 0,
                count: 0
            });
        }

        const data = Array.isArray(sipenkosLaporan) ? sipenkosLaporan : [];
        if (data.length === 0) {
            return months;
        }

        const filtered = data.filter(item => {
            if (selectedKosId === 'all') return true;
            return String(item.kos_id) === selectedKosId;
        });

        filtered.forEach(item => {
            const rawDate = item.tanggal_pembayaran;
            if (!rawDate) return;
            // Handle MySQL datetime format "2026-01-01 06:57:16" by replacing space with T
            const dateStr = typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return;

            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthObj = months.find(m => m.key === key);
            if (monthObj) {
                monthObj.total += parseFloat(String(item.nominal)) || 0;
                monthObj.count += 1;
            }
        });

        return months;
    }, [sipenkosLaporan, selectedKosId]);

    const maxVal = useMemo(() => {
        const values = processedData.map(d => d.total);
        const max = Math.max(...values, 0);
        return max > 0 ? max * 1.15 : 1000000;
    }, [processedData]);

    const formatCompact = (val: number) => {
        if (val >= 1000000) {
            return `Rp ${(val / 1000000).toFixed(1).replace(/\.0$/, '')}jt`;
        }
        if (val >= 1000) {
            return `Rp ${(val / 1000).toFixed(0)}rb`;
        }
        return `Rp ${val}`;
    };

    const viewBoxWidth = 600;
    const viewBoxHeight = 260;
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const points = useMemo(() => {
        return processedData.map((d, i) => {
            const x = paddingLeft + (i * (viewBoxWidth - paddingLeft - paddingRight)) / 5;
            const y = viewBoxHeight - paddingBottom - (d.total / maxVal) * (viewBoxHeight - paddingTop - paddingBottom);
            return { x, y, ...d };
        });
    }, [processedData, maxVal]);

    const lineD = useMemo(() => {
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [points]);

    const areaD = useMemo(() => {
        if (points.length === 0) return '';
        return `${lineD} L ${points[points.length - 1].x} ${viewBoxHeight - paddingBottom} L ${points[0].x} ${viewBoxHeight - paddingBottom} Z`;
    }, [points, lineD]);

    const gridLines = useMemo(() => {
        const lines = [];
        for (let j = 0; j <= 4; j++) {
            const ratio = j / 4;
            const y = paddingTop + ratio * (viewBoxHeight - paddingTop - paddingBottom);
            const value = maxVal * (1 - ratio);
            lines.push({ y, value });
        }
        return lines;
    }, [maxVal]);

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

                {/* Chart Section */}
                <Card className="shadow-sm border border-gray-100 mt-6">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold text-gray-800">Total Pendapatan</CardTitle>
                                <CardDescription className="text-sm">
                                    Visualisasi total pendapatan bulanan.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter:</span>
                                <select
                                    value={selectedKosId}
                                    onChange={(e) => setSelectedKosId(e.target.value)}
                                    className="block w-48 rounded-lg border border-gray-200 py-1.5 px-3 text-sm font-medium focus:border-[#664229] focus:outline-none focus:ring-1 focus:ring-[#664229] bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                                >
                                    <option value="all">Semua Kos (Total)</option>
                                    {kosList.map((kos) => (
                                        <option key={kos.id} value={String(kos.id)}>
                                            {kos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-6 pb-6 relative">
                        {sipenkosLaporan.length === 0 && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4 z-10 rounded-b-xl">
                                <TrendingUp className="h-10 w-10 text-gray-300 mb-2 animate-pulse" />
                                <p className="text-sm font-semibold text-gray-600">Data Tidak Ditemukan</p>
                            </div>
                        )}

                        <div className="relative w-full h-[260px] select-none">
                            <svg
                                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                                width="100%"
                                height="100%"
                                className="overflow-visible"
                            >
                                <defs>
                                    {/* Gradient fill */}
                                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#664229" stopOpacity="0.25" />
                                        <stop offset="100%" stopColor="#664229" stopOpacity="0.00" />
                                    </linearGradient>
                                    {/* Drop shadow on line */}
                                    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#664229" floodOpacity="0.15" />
                                    </filter>
                                </defs>

                                {/* Y-Axis Grid Lines */}
                                {gridLines.map((line, idx) => (
                                    <g key={idx}>
                                        <line
                                            x1={paddingLeft}
                                            y1={line.y}
                                            x2={viewBoxWidth - paddingRight}
                                            y2={line.y}
                                            stroke="#f3f4f6"
                                            strokeWidth="1"
                                            strokeDasharray={idx === 4 ? "0" : "4 4"} // solid line for ground
                                        />
                                        <text
                                            x={paddingLeft - 10}
                                            y={line.y + 4}
                                            textAnchor="end"
                                            className="text-[10px] font-semibold fill-gray-400 font-sans"
                                        >
                                            {formatCompact(line.value)}
                                        </text>
                                    </g>
                                ))}

                                {/* Area Path */}
                                {points.length > 0 && maxVal > 0 && (
                                    <path
                                        d={areaD}
                                        fill="url(#chart-gradient)"
                                        className="transition-all duration-500 ease-out"
                                    />
                                )}

                                {/* Line Path */}
                                {points.length > 0 && maxVal > 0 && (
                                    <path
                                        d={lineD}
                                        fill="none"
                                        stroke="#664229"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter="url(#shadow)"
                                        className="transition-all duration-500 ease-out"
                                    />
                                )}

                                {/* Hover vertical guideline */}
                                {hoveredIndex !== null && points[hoveredIndex] && (
                                    <line
                                        x1={points[hoveredIndex].x}
                                        y1={paddingTop}
                                        x2={points[hoveredIndex].x}
                                        y2={viewBoxHeight - paddingBottom}
                                        stroke="#664229"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                        className="transition-all duration-150"
                                    />
                                )}

                                {/* Data Dots */}
                                {points.map((p, idx) => {
                                    const isHovered = hoveredIndex === idx;
                                    return (
                                        <g key={idx}>
                                            <circle
                                                cx={p.x}
                                                cy={p.y}
                                                r={isHovered ? 8 : 4}
                                                fill={isHovered ? "#664229" : "#ffffff"}
                                                stroke="#664229"
                                                strokeWidth={2}
                                                className="transition-all duration-200 cursor-pointer shadow-sm"
                                            />
                                            {isHovered && (
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r={12}
                                                    fill="#664229"
                                                    fillOpacity="0.15"
                                                    className="animate-ping"
                                                />
                                            )}
                                        </g>
                                    );
                                })}

                                {/* X-Axis Labels (Months) */}
                                {points.map((p, idx) => (
                                    <text
                                        key={idx}
                                        x={p.x}
                                        y={viewBoxHeight - 15}
                                        textAnchor="middle"
                                        className={`text-[11px] font-semibold transition-colors duration-200 font-sans ${
                                            hoveredIndex === idx ? 'fill-[#664229] font-bold' : 'fill-gray-400'
                                        }`}
                                    >
                                        {p.label}
                                    </text>
                                ))}

                                {/* Interactive Hover Zones */}
                                {points.map((p, idx) => {
                                    const colWidth = (viewBoxWidth - paddingLeft - paddingRight) / 5;
                                    return (
                                        <rect
                                            key={idx}
                                            x={p.x - colWidth / 2}
                                            y={paddingTop}
                                            width={colWidth}
                                            height={viewBoxHeight - paddingTop - paddingBottom}
                                            fill="transparent"
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHoveredIndex(idx)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Floating Card Tooltip */}
                            {hoveredIndex !== null && points[hoveredIndex] && (
                                <div
                                    className="absolute bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl p-3 pointer-events-none transition-all duration-150 ease-out z-20 flex flex-col gap-1 min-w-[150px]"
                                    style={{
                                        left: `${(points[hoveredIndex].x / viewBoxWidth) * 100}%`,
                                        top: `${(points[hoveredIndex].y / viewBoxHeight) * 100}%`,
                                        transform: 'translate(-50%, -100%) translateY(-16px)',
                                    }}
                                >
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {points[hoveredIndex].label}
                                    </p>
                                    <p className="text-sm font-bold text-[#664229]">
                                        {formatCurrency(points[hoveredIndex].total)}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <p className="text-[10px] text-gray-500 font-medium">
                                            {points[hoveredIndex].count} Transaksi
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
