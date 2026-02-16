import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Plus, Edit, MoreHorizontal, Eye, Download, Info, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tagihan',
        href: '/admin/tagihan',
    },
];

interface Kos {
    id: number;
    name: string;
    address: string;
}

interface TypeKamar {
    id: number;
    nama: string;
    harga: number;
}

interface Room {
    id: number;
    kos_id: number;
    room_number: string;
    capacity: number;
    status: string;
    billing_date?: number | null;
    type_kamar?: TypeKamar;
    kos?: Kos;
}

interface Payment {
    id: number;
    amount_paid: number;
    payment_date: string;
    bukti_pembayaran: string | null;
    status: string;
}

interface Invoice {
    id: number;
    amount: number;
    due_date: string;
    billing_period: string;
    status: 'belum_dibayar' | 'lunas' | 'terlambat';
    tenancy: {
        penghuni: { name: string };
        room: Room;
    };
    payments: Payment[];
}

interface Props {
    rooms: Room[];
    invoices: Invoice[];
}

export default function Tagihan({ rooms = [], invoices = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'pengaturan' | 'pembayaran'>('pengaturan');
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    // Filter rooms that have billing_date set for the table
    const billingRooms = useMemo(() => {
        return rooms.filter(room => room.billing_date !== null && room.billing_date !== undefined);
    }, [rooms]);

    const handleEdit = (room: Room) => {
        router.get(`/admin/tagihan/create?room_id=${room.id}`);
    };

    const getInvoiceStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            lunas: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
            belum_dibayar: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
            terlambat: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
        };
        const labels: Record<string, string> = {
            lunas: 'Lunas',
            belum_dibayar: 'Belum Bayar',
            terlambat: 'Terlambat',
        };
        return <Badge variant="outline" className={variants[status] || ''}>{labels[status] || status}</Badge>;
    };

    const columnsPengaturan: ColumnDef<Room>[] = [
        {
            accessorKey: 'kos.name',
            header: 'Kos',
        },
        {
            accessorKey: 'room_number',
            header: 'No. Kamar',
            cell: ({ row }) => <div className="font-medium">Kamar {row.getValue('room_number')}</div>,
        },
        {
            accessorKey: 'type_kamar.nama',
            header: 'Tipe',
            cell: ({ row }) => <div>{row.original.type_kamar?.nama || '-'}</div>,
        },
        {
            accessorKey: 'type_kamar.harga',
            header: 'Harga/Bulan',
            cell: ({ row }) => <div>Rp{Number(row.original.type_kamar?.harga || 0).toLocaleString('id-ID')}</div>,
        },
        {
            accessorKey: 'billing_date',
            header: 'Tgl Tagihan',
            cell: ({ row }) => (
                <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Setiap tanggal {row.getValue('billing_date')}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Pengaturan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const columnsPembayaran: ColumnDef<Invoice>[] = [
        {
            id: 'penghuni',
            header: 'Penghuni',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {row.original.tenancy?.penghuni?.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Kamar {row.original.tenancy?.room?.room_number} ({row.original.tenancy?.room?.kos?.name})
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'billing_period',
            header: 'Periode',
            cell: ({ row }) => {
                const date = new Date(row.original.billing_period);
                return <div className="text-sm font-medium">{date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>;
            },
        },
        {
            id: 'amount',
            header: 'Tagihan (Tarif)',
            cell: ({ row }) => {
                const amount = row.original.tenancy?.room?.type_kamar?.harga || row.original.amount;
                return <div className="font-bold">Rp{Number(amount).toLocaleString('id-ID')}</div>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getInvoiceStatusBadge(row.original.status),
        },
        {
            id: 'bukti',
            header: 'Bukti Pembayaran',
            cell: ({ row }) => {
                // Get the latest success payment with proof
                const paymentWithProof = row.original.payments?.find(p => p.bukti_pembayaran);
                return paymentWithProof ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        onClick={() => setSelectedProof(paymentWithProof.bukti_pembayaran)}
                    >
                        <Eye className="h-3 w-3" />
                        Lihat Bukti
                    </Button>
                ) : (
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Belum ada bukti
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Catat Pembayaran
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Tagihan & Pembayaran" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tagihan & Pembayaran</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola jadwal tagihan otomatis dan pantau status pembayaran penghuni
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit border dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('pengaturan')}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'pengaturan'
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-[#664229] dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Pengaturan Tagihan
                    </button>
                    <button
                        onClick={() => setActiveTab('pembayaran')}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'pembayaran'
                            ? 'bg-white dark:bg-gray-700 shadow-sm text-[#664229] dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Monitoring Pembayaran
                    </button>
                </div>

                {activeTab === 'pengaturan' ? (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border bg-white dark:bg-[#161615] shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-[#664229]" />
                                <h3 className="font-bold">Jadwal Tagihan Kamar</h3>
                            </div>
                        </div>
                        <DataTable
                            columns={columnsPengaturan}
                            data={billingRooms}
                            headerAction={
                                <Link href="/admin/tagihan/create">
                                    <Button className="bg-[#664229] hover:bg-[#664229]/90 text-white">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Atur Jadwal Baru
                                    </Button>
                                </Link>
                            }
                        />
                    </div>
                ) : (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border bg-white dark:bg-[#161615] shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <h3 className="font-bold">Status Pembayaran Semua Penghuni</h3>
                            </div>
                        </div>
                        <DataTable
                            columns={columnsPembayaran}
                            data={invoices}
                        />
                    </div>
                )}

                {/* Proof of Payment Dialog */}
                <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5" />
                                Lampiran Bukti Pembayaran
                            </DialogTitle>
                            <DialogDescription>
                                Gambar di bawah adalah lampiran yang dikirimkan oleh penghuni melalui aplikasi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                            {selectedProof ? (
                                <img
                                    src={`/storage/${selectedProof}`}
                                    alt="Bukti Pembayaran"
                                    className="max-h-[65vh] object-contain shadow-sm rounded-md"
                                />
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500">Bukti gambar tidak tersedia</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:justify-between items-center">
                            <div className="text-xs text-muted-foreground italic">
                                * Pastikan nominal pada gambar sesuai dengan tagihan
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setSelectedProof(null)}>Tutup</Button>
                                {selectedProof && (
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                        <a href={`/storage/${selectedProof}`} download target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
