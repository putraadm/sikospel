import { Head, Link, router } from '@inertiajs/react';
import { Plus, MoreHorizontal, Eye, Download, Info, CheckCircle2, AlertCircle, FileText, Calendar, Edit, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
    transaction_id: string | null;
    status: string;
}

interface Invoice {
    id: number;
    amount: number;
    due_date: string;
    billing_period: string;
    status: 'belum_dibayar' | 'lunas' | 'terlambat';
    tenancy: {
        penghuni: {
            name: string;
            status_penghuni: 'penghuni' | 'pra penghuni';
        };
        room: Room;
    };
    payments: Payment[];
}

interface Props {
    invoices: Invoice[];
    koses?: Kos[];
    filters?: {
        kos_id?: string;
        month?: string;
        year?: string;
    };
}

export default function Tagihan({ invoices = [], koses = [], filters = {} }: Props) {
    const [kosFilter, setKosFilter] = useState<string>(filters.kos_id || 'all');
    const [monthFilter, setMonthFilter] = useState<string>(filters.month || 'all');
    const [yearFilter, setYearFilter] = useState<string>(filters.year || 'all');

    const handleFilterChange = (newFilters: any) => {
        const params = {
            kos_id: newFilters.kos_id !== undefined ? newFilters.kos_id : kosFilter,
            month: newFilters.month !== undefined ? newFilters.month : monthFilter,
            year: newFilters.year !== undefined ? newFilters.year : yearFilter,
        };

        // Clean up 'all' values for the URL
        const cleanedParams: any = {};
        if (params.kos_id !== 'all') cleanedParams.kos_id = params.kos_id;
        if (params.month !== 'all') cleanedParams.month = params.month;
        if (params.year !== 'all') cleanedParams.year = params.year;

        router.get('/admin/tagihan', cleanedParams, { preserveState: true, preserveScroll: true });
    };

    const handleKosFilterChange = (value: string) => {
        setKosFilter(value);
        handleFilterChange({ kos_id: value });
    };

    const handleMonthFilterChange = (value: string) => {
        setMonthFilter(value);
        handleFilterChange({ month: value });
    };

    const handleYearFilterChange = (value: string) => {
        setYearFilter(value);
        handleFilterChange({ year: value });
    };
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [confirmPaidId, setConfirmPaidId] = useState<number | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = useState(false);

    // New States
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
    const [genYear, setGenYear] = useState(new Date().getFullYear());
    const [genKosId, setGenKosId] = useState<string>(filters.kos_id || 'all');

    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editAmount, setEditAmount] = useState<string>('');
    const [editDueDate, setEditDueDate] = useState<string>('');

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleMarkAsPaid = () => {
        if (!confirmPaidId) return;
        setIsMarkingPaid(true);
        router.post(`/admin/tagihan/${confirmPaidId}/mark-paid`, {}, {
            onSuccess: () => {
                setConfirmPaidId(null);
                setIsMarkingPaid(false);
                toast.success('Tagihan berhasil ditandai lunas');
            },
            onError: () => {
                setIsMarkingPaid(false);
            },
            preserveScroll: true
        });
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        router.post(`/admin/tagihan/generate`, {
            month: genMonth,
            year: genYear,
            kos_id: genKosId,
        }, {
            onSuccess: () => {
                setIsGenerateDialogOpen(false);
                setIsGenerating(false);
            },
            onError: () => {
                setIsGenerating(false);
            },
            preserveScroll: true
        });
    };

    const handleUpdate = () => {
        if (!editingInvoice) return;
        setIsUpdating(true);
        router.patch(`/admin/tagihan/${editingInvoice.id}`, {
            amount: editAmount,
            due_date: editDueDate,
        }, {
            onSuccess: () => {
                setEditingInvoice(null);
                setIsUpdating(false);
                toast.success('Tagihan berhasil diperbarui');
            },
            onError: () => {
                setIsUpdating(false);
            },
            preserveScroll: true
        });
    };

    const handleDelete = () => {
        if (!deletingId) return;
        setIsDeleting(true);
        router.delete(`/admin/tagihan/${deletingId}`, {
            onSuccess: () => {
                setDeletingId(null);
                setIsDeleting(false);
                toast.success('Tagihan berhasil dihapus');
            },
            onError: () => {
                setIsDeleting(false);
            },
            preserveScroll: true
        });
    };

    const openEditDialog = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setEditAmount(invoice.amount.toString());
        setEditDueDate(invoice.due_date.split('T')[0]); // Take YYYY-MM-DD
    };

    const columnsPembayaran: ColumnDef<Invoice>[] = [
        {
            accessorFn: row => `${row.tenancy?.penghuni?.name} ${row.tenancy?.room?.room_number} ${row.tenancy?.room?.kos?.name}`,
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
            accessorFn: row => {
                const date = new Date(row.billing_period);
                return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            },
            id: 'billing_period',
            header: 'Periode',
            cell: ({ row }) => {
                const date = new Date(row.original.billing_period);
                return <div className="text-sm font-medium">{date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>;
            },
        },
        {
            accessorFn: row => row.amount.toString(),
            id: 'amount',
            header: 'Total Tagihan',
            cell: ({ row }) => {
                const amount = row.original.amount;
                const dailyRate = row.original.tenancy?.room?.type_kamar?.harga || 0;
                const isPraPenghuni = row.original.tenancy?.penghuni?.status_penghuni === 'pra penghuni';

                return (
                    <div className="flex flex-col">
                        <div className="font-bold text-[#664229] dark:text-[#D4A373]">
                            Rp{Number(amount).toLocaleString('id-ID')}
                        </div>
                        {isPraPenghuni && dailyRate > 0 && (
                            <div className="text-[10px] text-muted-foreground">
                                {Number(dailyRate).toLocaleString('id-ID')}/hari (Pro-rata)
                            </div>
                        )}
                        {!isPraPenghuni && dailyRate > 0 && (
                            <div className="text-[10px] text-muted-foreground">
                                {Number(dailyRate * 30).toLocaleString('id-ID')}/bln
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getInvoiceStatusBadge(row.original.status),
        },
        {
            id: 'bukti',
            header: 'Bukti & Struk',
            cell: ({ row }) => {
                const paymentWithProof = row.original.payments?.find(p => p.bukti_pembayaran);
                const latestPayment = row.original.payments?.[0];
                const isLunas = row.original.status === 'lunas';
                return (
                    <div className="flex flex-col gap-1.5">
                        {paymentWithProof ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 h-7 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                onClick={() => setSelectedProof(paymentWithProof.bukti_pembayaran)}
                            >
                                <Eye className="h-3 w-3" />
                                Lihat Bukti
                            </Button>
                        ) : null}
                        {isLunas && latestPayment && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 h-7 text-xs border-[#664229] text-[#664229] hover:bg-[#664229]/10"
                                onClick={() => window.open(`/payment/receipt/${latestPayment.id}`, '_blank')}
                            >
                                <FileText className="h-3 w-3" />
                                Cetak Struk
                            </Button>
                        )}
                    </div>
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
                        <DropdownMenuItem
                            disabled={row.original.status === 'lunas'}
                            onClick={() => setConfirmPaidId(row.original.id)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            Tandai Lunas (Cash)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => openEditDialog(row.original)}
                        >
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            Ubah Tagihan
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled={row.original.status === 'lunas'}
                            className="text-red-600"
                            onClick={() => setDeletingId(row.original.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Tagihan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoring Pembayaran" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Monitoring Pembayaran</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau status pembayaran tagihan semua penghuni kos secara real-time
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {koses && koses.length > 0 && (
                            <Select value={kosFilter} onValueChange={handleKosFilterChange}>
                                <SelectTrigger className="w-[150px] bg-white dark:bg-[#161615]">
                                    <SelectValue placeholder="Semua Kos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kos</SelectItem>
                                    {koses.map(k => (
                                        <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Select value={monthFilter} onValueChange={handleMonthFilterChange}>
                            <SelectTrigger className="w-[130px] bg-white dark:bg-[#161615]">
                                <SelectValue placeholder="Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Bulan</SelectItem>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={yearFilter} onValueChange={handleYearFilterChange}>
                            <SelectTrigger className="w-[110px] bg-white dark:bg-[#161615]">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {[2024, 2025, 2026].map((y) => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => setIsGenerateDialogOpen(true)}
                            className="bg-[#664229] hover:bg-[#523521] text-white flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Generate Tagihan
                        </Button>
                    </div>
                </div>
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border bg-white dark:bg-[#161615] shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h3 className="font-bold text-lg">Status Pembayaran Semua Penghuni</h3>
                        </div>
                    </div>
                    <DataTable
                        columns={columnsPembayaran}
                        data={invoices}
                    />
                </div>

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

                {/* Confirm Mark as Paid Dialog */}
                <Dialog open={confirmPaidId !== null} onOpenChange={(open) => !open && setConfirmPaidId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Pembayaran Cash</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menandai tagihan ini sebagai <strong>Lunas</strong> melalui pembayaran tunai?
                                Tindakan ini akan mencatat pembayaran secara manual dalam sistem.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setConfirmPaidId(null)}>Batal</Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleMarkAsPaid}
                                disabled={isMarkingPaid}
                            >
                                {isMarkingPaid ? 'Memproses...' : 'Ya, Tandai Lunas'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Generate Tagihan Dialog */}
                <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Tagihan Otomatis</DialogTitle>
                            <DialogDescription>
                                Pilih periode bulan dan tahun untuk mengenerate tagihan bagi semua penghuni yang aktif.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {koses && koses.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Pilih Kos</Label>
                                    <Select value={genKosId} onValueChange={setGenKosId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Kos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Kos</SelectItem>
                                            {koses.map(k => (
                                                <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bulan</Label>
                                    <Select value={genMonth.toString()} onValueChange={(v) => setGenMonth(parseInt(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Bulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                    {new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tahun</Label>
                                    <Select value={genYear.toString()} onValueChange={(v) => setGenYear(parseInt(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tahun" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[2024, 2025, 2026].map((y) => (
                                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Batal</Button>
                            <Button
                                className="bg-[#664229] hover:bg-[#523521] text-white"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Mengenerate...' : 'Generate Sekarang'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Tagihan Dialog */}
                <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ubah Tagihan</DialogTitle>
                            <DialogDescription>
                                Perbarui detail tagihan untuk {editingInvoice?.tenancy?.penghuni?.name}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Total Tagihan (Rp)</Label>
                                <Input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Batas Waktu Pembayaran (Due Date)</Label>
                                <Input
                                    type="date"
                                    value={editDueDate}
                                    onChange={(e) => setEditDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingInvoice(null)}>Batal</Button>
                            <Button
                                className="bg-[#664229] hover:bg-[#523521] text-white"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Tagihan</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus tagihan ini? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeletingId(null)}>Batal</Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
