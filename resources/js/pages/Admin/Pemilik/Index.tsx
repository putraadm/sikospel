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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pemilik',
        href: '/admin/pemilik',
    },
];

interface User {
    id: number;
    username: string;
    email: string;
}

interface Pemilik {
    user_id: number;
    name: string;
    no_wa: string;
    address: string;
    user: User;
}

interface Props {
    pemilik: Pemilik[];
    users: User[];
}

export default function Index({ pemilik, users }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
    });

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pemilik', {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleEdit = (item: Pemilik) => {
        setEditingId(item.user_id);
        setEditData({
            user_id: item.user_id.toString(),
            name: item.name,
            no_wa: item.no_wa || '',
            address: item.address || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            user_id: '',
            name: '',
            no_wa: '',
            address: '',
        });
    };

    const handleUpdate = (id: number) => {
        router.put(`/admin/pemilik/${id}`, editData, {
            onSuccess: () => {
                setEditingId(null);
                setEditData({
                    user_id: '',
                    name: '',
                    no_wa: '',
                    address: '',
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
            router.delete(`/admin/pemilik/${deleteId}`, {
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

    const columns: ColumnDef<Pemilik>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'user',
            header: 'User Akun',
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                );
            },
        },
        {
            accessorKey: 'no_wa',
            header: 'WhatsApp',
            cell: ({ row }) => <div>{row.getValue('no_wa')}</div>,
        },
        {
            accessorKey: 'address',
            header: 'Alamat',
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('address')}</div>,
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
            <Head title="Pemilik" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Pemilik</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={pemilik}
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
                            <DialogTitle>Tambah Pemilik Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama Pemilik"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="no_wa">No. WhatsApp</Label>
                                <Input
                                    id="no_wa"
                                    value={data.no_wa}
                                    onChange={(e) => setData('no_wa', e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                />
                                {errors.no_wa && <p className="text-sm text-red-600">{errors.no_wa}</p>}
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
                            <DialogTitle>Edit Pemilik</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingId!); }} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-user_id">User Akun</Label>
                                <Select value={editData.user_id} onValueChange={(value) => setEditData({ ...editData, user_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.username} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-name">Nama Lengkap</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    placeholder="Nama Pemilik"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-no_wa">No. WhatsApp</Label>
                                <Input
                                    id="edit-no_wa"
                                    value={editData.no_wa}
                                    onChange={(e) => setEditData({ ...editData, no_wa: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-address">Alamat</Label>
                                <Textarea
                                    id="edit-address"
                                    value={editData.address}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    placeholder="Alamat Lengkap"
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
                    title="Hapus Pemilik"
                    description="Apakah Anda yakin ingin menghapus pemilik ini? Tindakan ini tidak dapat dibatalkan."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
