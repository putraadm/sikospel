import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
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

interface User {
    id: number;
    name: string;
    email: string;
}

interface Penghuni {
    id: number;
    user_id: number;
    name: string;
    no_wa: string | null;
    address: string | null;
    religion: string | null;
    file_path_kk: string | null;
    file_path_ktp: string | null;
    user: {
        email: string;
    };
}

interface Props {
    penghuni: Penghuni[];
    users: User[];
}

export default function Index({ penghuni, users }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
        religion: '',
        file_path_kk: null as File | null,
        file_path_ktp: null as File | null,
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedPenghuni, setSelectedPenghuni] = useState<Penghuni | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Edit form state
    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        _method: 'PUT',
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
        religion: '',
        file_path_kk: null as File | null,
        file_path_ktp: null as File | null,
    });

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/penghuni', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleEdit = (item: Penghuni) => {
        setEditingId(item.user_id); // Using user_id as identifier for update
        setEditData({
            _method: 'PUT',
            user_id: item.user_id.toString(),
            name: item.name,
            no_wa: item.no_wa || '',
            address: item.address || '',
            religion: item.religion || '',
            file_path_kk: null,
            file_path_ktp: null,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetEdit();
    };

    const handleUpdate = (id: number) => {
        postEdit(`/admin/penghuni/${id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingId(null);
                resetEdit();
            },
        });
    };

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
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => confirmDelete(item.id)} // Assuming ID for delete is primary key 'id' but controller uses user_id sometimes? Let's check controller destroy method uses findOrFail($id) which usually implies primary key. Legacy used user_id. Let's check legacy delete. Legacy: handleDeleteClick(item.user_id). Controller public function destroy($id) { $penghuni = \App\Models\Penghuni::findOrFail($id); ... }
                                // It seems legacy passed user_id to destroy? If Penghuni model uses unique 'user_id', findOrFail might be on 'id' though. 
                                // Let's use item.id for now as it's the primary key. If back-end expects user_id for delete, I might need to swap.
                                // Legacy code: handleDeleteClick(item.user_id). Route::resource usually uses ID.
                                // Let's stick to item.user_id if legacy used it, or item.id if standard.
                                // Wait, legacy: <TableRow key={item.user_id}> ... onClick={() => handleDeleteClick(item.user_id)}
                                // Code: router.delete(`/admin/penghuni/${deleteId}`...
                                // Controler: $penghuni = \App\Models\Penghuni::findOrFail($id);
                                // If $id is user_id, then Penghuni model must have primary key 'user_id' or findOrFail searches on primary key.
                                // Standard is 'id'. I will use item.id.
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

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={penghuni}
                        headerAction={
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="h-4 w-4" />
                                Tambah
                            </Button>
                        }
                    />
                </div>

                {/* Create Modal */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Penghuni Baru</DialogTitle>
                            <DialogDescription>Masukkan data penghuni baru.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="user_id">User Akun</Label>
                                <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && <p className="text-sm text-red-600">{errors.user_id}</p>}
                            </div>
                            <div>
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama Lengkap"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="no_wa">No. WhatsApp</Label>
                                    <Input
                                        id="no_wa"
                                        value={data.no_wa}
                                        onChange={(e) => setData('no_wa', e.target.value)}
                                        placeholder="08..."
                                    />
                                    {errors.no_wa && <p className="text-sm text-red-600">{errors.no_wa}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="religion">Agama</Label>
                                    <Input
                                        id="religion"
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        placeholder="Agama"
                                    />
                                    {errors.religion && <p className="text-sm text-red-600">{errors.religion}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Alamat Lengkap"
                                />
                                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="file_path_kk">Upload KK</Label>
                                    <Input
                                        id="file_path_kk"
                                        type="file"
                                        onChange={(e) => setData('file_path_kk', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    {errors.file_path_kk && <p className="text-sm text-red-600">{errors.file_path_kk}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="file_path_ktp">Upload KTP</Label>
                                    <Input
                                        id="file_path_ktp"
                                        type="file"
                                        onChange={(e) => setData('file_path_ktp', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    {errors.file_path_ktp && <p className="text-sm text-red-600">{errors.file_path_ktp}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={editingId !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Penghuni</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingId!); }} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-user_id">User Akun</Label>
                                <Select value={editData.user_id} onValueChange={(value) => setEditData('user_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.user_id && <p className="text-sm text-red-600">{editErrors.user_id}</p>}
                            </div>
                            <div>
                                <Label htmlFor="edit-name">Nama Lengkap</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    placeholder="Nama Lengkap"
                                />
                                {editErrors.name && <p className="text-sm text-red-600">{editErrors.name}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="edit-no_wa">No. WhatsApp</Label>
                                    <Input
                                        id="edit-no_wa"
                                        value={editData.no_wa}
                                        onChange={(e) => setEditData('no_wa', e.target.value)}
                                        placeholder="08..."
                                    />
                                    {editErrors.no_wa && <p className="text-sm text-red-600">{editErrors.no_wa}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit-religion">Agama</Label>
                                    <Input
                                        id="edit-religion"
                                        value={editData.religion}
                                        onChange={(e) => setEditData('religion', e.target.value)}
                                        placeholder="Agama"
                                    />
                                    {editErrors.religion && <p className="text-sm text-red-600">{editErrors.religion}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="edit-address">Alamat</Label>
                                <Textarea
                                    id="edit-address"
                                    value={editData.address}
                                    onChange={(e) => setEditData('address', e.target.value)}
                                    placeholder="Alamat Lengkap"
                                />
                                {editErrors.address && <p className="text-sm text-red-600">{editErrors.address}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="edit-file_path_kk">Update KK (Opsional)</Label>
                                    <Input
                                        id="edit-file_path_kk"
                                        type="file"
                                        onChange={(e) => setEditData('file_path_kk', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-file_path_ktp">Update KTP (Opsional)</Label>
                                    <Input
                                        id="edit-file_path_ktp"
                                        type="file"
                                        onChange={(e) => setEditData('file_path_ktp', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editProcessing}>
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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
