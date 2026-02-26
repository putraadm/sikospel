import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal, Eye, FileText, Copy, Check, TriangleAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Penghuni',
        href: '/admin/penghuni',
    },
];



interface Penghuni {
    user_id: number;
    name: string;
    no_wa: string | null;
    address: string | null;
    religion: string | null;
    file_path_kk: string | null;
    file_path_ktp: string | null;
    tanggal_daftar: string | null;
    status_penghuni: 'penghuni' | 'pra penghuni';
    user: {
        email: string;
    };
    current_room?: {
        id: number;
        room_number: string;
        type_kamar?: {
            id: number;
            nama: string;
        };
        kos?: {
            id: number;
            name: string;
        };
    };
}

interface Room {
    id: number;
    room_number: string;
    kos_id: number;
    type_kamar_id: number;
    status: string;
    type_kamar: {
        id: number;
        nama: string;
    };
    kos: {
        id: number;
        name: string;
    };
}

interface Kos {
    id: number;
    name: string;
}

interface TypeKamar {
    id: number;
    nama: string;
}

interface Props {
    penghuni: Penghuni[];
    rooms: Room[];
    typeKamars: TypeKamar[];
    kos: Kos[];
    flash: {
        new_user_account?: {
            username: string;
            email: string;
            password: string;
            name: string;
        } | null;
    };
}

const religions = [
    'Islam',
    'Kristen Protestan',
    'Katolik',
    'Hindu',
    'Buddha',
    'Khonghucu'
];

export default function Index({ penghuni, flash }: Props) {
    const [selectedPenghuni, setSelectedPenghuni] = useState<Penghuni | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.new_user_account) {
            setShowAccountModal(true);
        }
    }, [flash]);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDetail = (item: Penghuni) => {
        setSelectedPenghuni(item);
        setShowDetailModal(true);
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            setIsDeleting(true);
            router.delete(`/admin/penghuni/${deleteId}`, {
                onSuccess: () => {
                    setConfirmOpen(false);
                    setDeleteId(null);
                    setIsDeleting(false);
                },
                onError: () => {
                    setIsDeleting(false);
                }
            });
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const columns: ColumnDef<Penghuni>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'user.email',
            header: 'Email',
            cell: ({ row }) => <div>{row.original.user.email}</div>,
        },
        {
            accessorKey: 'no_wa',
            header: 'WhatsApp',
            cell: ({ row }) => <div>{row.getValue('no_wa') || '-'}</div>,
        },
        {
            accessorKey: 'address',
            header: 'Alamat',
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('address') || '-'}</div>,
        },
        {
            accessorKey: 'status_penghuni',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status_penghuni;
                const badgeStyles = status === 'penghuni'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';

                return (
                    <Badge className={cn("capitalize font-semibold border-none shadow-none", badgeStyles)}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'room',
            header: 'Kamar',
            cell: ({ row }) => (
                <div>
                    {row.original.current_room
                        ? `${row.original.current_room.room_number} (${row.original.current_room.kos?.name || '-'})`
                        : '-'
                    }
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDetail(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/penghuni/${item.user_id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => confirmDelete(item.user_id)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penghuni" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Penghuni</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border bg-white dark:bg-[#161615]">
                    <DataTable
                        columns={columns}
                        data={penghuni}
                        headerAction={
                            <Link href="/admin/penghuni/create">
                                <Button className="bg-[#664229] hover:bg-[#664229]/90 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Penghuni
                                </Button>
                            </Link>
                        }
                    />
                </div>

                {/* Detail Modal */}
                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>Detail Penghuni</DialogTitle>
                        </DialogHeader>
                        {selectedPenghuni && (
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Nama Lengkap</h4>
                                        <p className="text-base font-semibold">{selectedPenghuni.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Email User</h4>
                                        <p className="text-base">{selectedPenghuni.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">No. WhatsApp</h4>
                                        <p className="text-base">{selectedPenghuni.no_wa || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Agama</h4>
                                        <p className="text-base">{selectedPenghuni.religion || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Tanggal Daftar</h4>
                                        <p className="text-base">{selectedPenghuni.tanggal_daftar || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Status Penghuni</h4>
                                        <div>
                                            <Badge className={cn(
                                                "capitalize font-semibold border-none shadow-none",
                                                selectedPenghuni.status_penghuni === 'penghuni'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
                                            )}>
                                                {selectedPenghuni.status_penghuni}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Kamar</h4>
                                        <p className="text-base">
                                            {selectedPenghuni.current_room
                                                ? `${selectedPenghuni.current_room.room_number} (${selectedPenghuni.current_room.type_kamar?.nama || '-'})`
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Alamat</h4>
                                        <p className="text-base">{selectedPenghuni.address || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 font-medium">
                                            Kartu Keluarga (KK)
                                        </h4>
                                        {selectedPenghuni.file_path_kk ? (
                                            <div className="rounded-lg border bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {selectedPenghuni.file_path_kk.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex h-48 flex-col items-center justify-center bg-gray-100 p-8 text-center">
                                                        <FileText className="mb-2 h-10 w-10 text-gray-400" />
                                                        <p className="mb-3 text-sm font-medium text-gray-600">Dokumen PDF</p>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={getImageUrl(selectedPenghuni.file_path_kk)!}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Buka PDF
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={getImageUrl(selectedPenghuni.file_path_kk)!}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="group relative block"
                                                    >
                                                        <img
                                                            src={getImageUrl(selectedPenghuni.file_path_kk)!}
                                                            alt="KK"
                                                            className="h-48 w-full object-cover object-center"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                            Lihat Gambar Penuh
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-48 flex-col items-center justify-center rounded border border-dashed bg-gray-50/50 text-gray-500">
                                                <span className="mb-2 text-2xl">🚫</span>
                                                <span className="text-sm">Tidak ada file KK</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 font-medium">
                                            KTP
                                        </h4>
                                        {selectedPenghuni.file_path_ktp ? (
                                            <div className="rounded-lg border bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {selectedPenghuni.file_path_ktp.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex h-48 flex-col items-center justify-center bg-gray-100 p-8 text-center">
                                                        <FileText className="mb-2 h-10 w-10 text-gray-400" />
                                                        <p className="mb-3 text-sm font-medium text-gray-600">Dokumen PDF</p>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={getImageUrl(selectedPenghuni.file_path_ktp)!}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                Buka PDF
                                                            </a>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <a
                                                        href={getImageUrl(selectedPenghuni.file_path_ktp)!}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="group relative block"
                                                    >
                                                        <img
                                                            src={getImageUrl(selectedPenghuni.file_path_ktp)!}
                                                            alt="KTP"
                                                            className="h-48 w-full object-cover object-center"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                            Lihat Gambar Penuh
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex h-48 flex-col items-center justify-center rounded border border-dashed bg-gray-50/50 text-gray-500">
                                                <span className="mb-2 text-2xl">🚫</span>
                                                <span className="text-sm">Tidak ada file KTP</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setShowDetailModal(false)}>Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Account Details Modal (After Success) */}
                <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-600">
                                <Check className="h-5 w-5" />
                                Akun Berhasil Dibuat
                            </DialogTitle>
                            <DialogDescription>
                                Berikut adalah data akun untuk <strong>{flash?.new_user_account?.name}</strong>.
                                Mohon berikan data ini kepada penghuni.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
                                <div className="flex gap-2 text-amber-800 dark:text-amber-400">
                                    <TriangleAlert className="h-5 w-5 shrink-0" />
                                    <p className="text-xs font-medium">
                                        Penting: Simpan atau catat data ini sekarang. Password ini hanya muncul satu kali ini saja.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Username</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={flash?.new_user_account?.username || ''} className="bg-muted font-mono text-sm" />
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(flash?.new_user_account?.username || '', 'user')}>
                                            {copied === 'user' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={flash?.new_user_account?.email || ''} className="bg-muted font-mono text-sm" />
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(flash?.new_user_account?.email || '', 'email')}>
                                            {copied === 'email' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground font-bold text-[#664229]">PASSWORD</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={flash?.new_user_account?.password || ''} className="bg-amber-50 dark:bg-amber-950/20 font-mono text-sm font-bold border-amber-200 dark:border-amber-900" />
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(flash?.new_user_account?.password || '', 'pass')} className="border-amber-200 hover:bg-amber-100 dark:border-amber-900">
                                            {copied === 'pass' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button className="w-full bg-[#664229] hover:bg-[#664229]/90 text-white" onClick={() => setShowAccountModal(false)}>
                                Saya Sudah Simpan Datanya
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Hapus Penghuni"
                    description="Apakah Anda yakin ingin menghapus data penghuni ini? Tindakan ini tidak dapat dibatalkan."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
