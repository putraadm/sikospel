import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kos, type Pemilik } from '@/types';
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
        title: 'Kos',
        href: '/admin/kos',
    },
];

interface Props {
    kos: Kos[];
    pemilik: Pemilik[];
    userRole: string;
}

export default function Index({ kos, pemilik, userRole }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '',
        name: '',
        address: '',
        description: '',
        image: null as File | null,
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        owner_id: '',
        name: '',
        address: '',
        description: '',
        image: null as File | null,
        _method: 'PUT',
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/kos', {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleEdit = (item: Kos) => {
        setEditingId(item.id);
        setEditData({
            owner_id: item.owner_id.toString(),
            name: item.name,
            address: item.address,
            description: item.description,
            image: null,
            _method: 'PUT',
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            owner_id: '',
            name: '',
            address: '',
            description: '',
            image: null,
            _method: 'PUT',
        });
    };

    const handleUpdate = (id: number) => {
        router.post(`/admin/kos/${id}`, editData, {
            onSuccess: () => {
                setEditingId(null);
                setEditData({
                    owner_id: '',
                    name: '',
                    address: '',
                    description: '',
                    image: null,
                    _method: 'PUT',
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
            router.delete(`/admin/kos/${deleteId}`, {
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

    const columns: ColumnDef<Kos>[] = [
        {
            accessorKey: 'name',
            header: 'Nama Kos',
            cell: ({ row }) => <div className="font-medium text-primary">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'owner',
            header: 'Pemilik',
            cell: ({ row }) => <div>{row.original.owner.name}</div>,
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
            <Head title="Kos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Kos</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={kos}
                        headerAction={
                            <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 text-white">
                                <Plus className="h-4 w-4" />
                                Tambah
                            </Button>
                        }
                    />
                </div>

                {/* Create Modal */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Tambah Kos Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {userRole === 'superadmin' && (
                                <div>
                                    <Label htmlFor="owner_id">Pemilik</Label>
                                    <Select value={data.owner_id} onValueChange={(value) => setData('owner_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Pemilik" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pemilik.map((p) => (
                                                <SelectItem key={p.user_id} value={p.user_id.toString()}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.owner_id && <p className="text-sm text-red-600">{errors.owner_id}</p>}
                                </div>
                            )}
                            <div>
                                <Label htmlFor="name">Nama Kos</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama Kos"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                            <div>
                                <Label htmlFor="description">Informasi Kos (Deskripsi)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Informasi detail tentang kos..."
                                    rows={5}
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>
                            <div>
                                <Label htmlFor="image">Gambar Thumbnail</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                />
                                {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white">
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={editingId !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Kos</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingId!); }} className="space-y-4">
                            {userRole === 'superadmin' && (
                                <div>
                                    <Label htmlFor="edit-owner_id">Pemilik</Label>
                                    <Select value={editData.owner_id} onValueChange={(value) => setEditData({ ...editData, owner_id: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Pemilik" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pemilik.map((p) => (
                                                <SelectItem key={p.user_id} value={p.user_id.toString()}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="edit-name">Nama Kos</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    placeholder="Nama Kos"
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
                            <div>
                                <Label htmlFor="edit-description">Informasi Kos (Deskripsi)</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    placeholder="Informasi detail kos"
                                    rows={5}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-image">Gambar Thumbnail (Opsional)</Label>
                                <Input
                                    id="edit-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditData({ ...editData, image: e.target.files ? e.target.files[0] : null })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                    Update
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Hapus Kos"
                    description="Apakah Anda yakin ingin menghapus data kos ini? Tindakan ini tidak dapat dibatalkan."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
