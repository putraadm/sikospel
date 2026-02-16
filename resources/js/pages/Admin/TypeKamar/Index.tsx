import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tipe Kamar',
        href: '/admin/type-kamar',
    },
];

interface TypeKamar {
    id: number;
    nama: string;
    deskripsi: string;
    harga: number;
}

interface Props {
    typeKamars: TypeKamar[];
}

export default function Index({ typeKamars }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        deskripsi: '',
        harga: '',
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        nama: '',
        deskripsi: '',
        harga: '',
    });

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/type-kamar', {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleEdit = (item: TypeKamar) => {
        setEditingId(item.id);
        setEditData({
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            harga: item.harga.toString(),
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            nama: '',
            deskripsi: '',
            harga: '',
        });
    };

    const handleUpdate = (id: number) => {
        router.put(`/admin/type-kamar/${id}`, editData, {
            onSuccess: () => {
                setEditingId(null);
                setEditData({
                    nama: '',
                    deskripsi: '',
                    harga: '',
                });
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            setIsDeleting(true);
            router.delete(`/admin/type-kamar/${deleteId}`, {
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

    const columns: ColumnDef<TypeKamar>[] = [
        {
            accessorKey: 'nama',
            header: 'Nama Tipe',
        },
        {
            accessorKey: 'harga',
            header: 'Harga',
            cell: ({ row }) => <div>Rp{Number(row.getValue('harga')).toLocaleString('id-ID')}</div>,
        },
        {
            accessorKey: 'deskripsi',
            header: 'Deskripsi',
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('deskripsi')}</div>,
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
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => confirmDelete(item.id)}
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
            <Head title="Tipe Kamar" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Tipe Kamar</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={typeKamars}
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Tipe Kamar Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="nama">Nama Tipe</Label>
                                <Input
                                    id="nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Deluxe, Standard"
                                />
                                {errors.nama && <p className="text-sm text-red-600">{errors.nama}</p>}
                            </div>
                            <div>
                                <Label htmlFor="harga">Harga</Label>
                                <Input
                                    id="harga"
                                    type="number"
                                    value={data.harga}
                                    onChange={(e) => setData('harga', e.target.value)}
                                    placeholder="Harga per bulan"
                                />
                                {errors.harga && <p className="text-sm text-red-600">{errors.harga}</p>}
                            </div>
                            <div>
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Deskripsi fasilitas tipe kamar ini"
                                />
                                {errors.deskripsi && <p className="text-sm text-red-600">{errors.deskripsi}</p>}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={editingId !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Tipe Kamar</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingId!); }} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-nama">Nama Tipe</Label>
                                <Input
                                    id="edit-nama"
                                    value={editData.nama}
                                    onChange={(e) => setEditData({ ...editData, nama: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-harga">Harga</Label>
                                <Input
                                    id="edit-harga"
                                    type="number"
                                    value={editData.harga}
                                    onChange={(e) => setEditData({ ...editData, harga: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="edit-deskripsi"
                                    value={editData.deskripsi}
                                    onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Batal
                                </Button>
                                <Button type="submit">
                                    Update
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Hapus Tipe Kamar"
                    description="Apakah Anda yakin ingin menghapus tipe kamar ini? Ini mungkin mempengaruhi data kamar yang menggunakan tipe ini."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
