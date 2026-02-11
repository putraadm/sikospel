import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Room, type Kos, } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Room',
        href: '/admin/room',
    },
];

interface Props {
    rooms: Room[];
    kos: Kos[];
}

export default function Index({ rooms, kos }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        kos_id: '',
        room_number: '',
        description: '',
        monthly_rate: '',
        status: 'tersedia',
        image: null as File | null,
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        kos_id: '',
        room_number: '',
        description: '',
        monthly_rate: '',
        status: '',
        image: null as File | null,
        _method: 'PUT',
    });

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/room', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleEdit = (item: Room) => {
        setEditingId(item.id);
        setEditData({
            kos_id: item.kos_id.toString(),
            room_number: item.room_number,
            description: item.description || '',
            monthly_rate: item.monthly_rate.toString(),
            status: item.status,
            image: null,
            _method: 'PUT',
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            kos_id: '',
            room_number: '',
            description: '',
            monthly_rate: '',
            status: '',
            image: null,
            _method: 'PUT',
        });
    };

    const handleUpdate = (id: number) => {
        router.post(`/admin/room/${id}`, editData, {
            forceFormData: true,
            onSuccess: () => {
                setEditingId(null);
                setEditData({
                    kos_id: '',
                    room_number: '',
                    description: '',
                    monthly_rate: '',
                    status: '',
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
            router.delete(`/admin/room/${deleteId}`, {
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

    const columns: ColumnDef<Room>[] = [
        {
            accessorKey: 'image',
            header: 'Foto',
            cell: ({ row }) => (
                <div className="size-12 overflow-hidden rounded-md border bg-neutral-100">
                    {row.getValue('image') ? (
                        <img src={`/storage/${row.getValue('image')}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">No Image</div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'room_number',
            header: 'No. Kamar',
            cell: ({ row }) => <div className="font-medium text-primary">{row.getValue('room_number')}</div>,
        },
        {
            accessorKey: 'kos.name',
            header: 'Kos',
        },
        {
            accessorKey: 'monthly_rate',
            header: 'Harga/Bulan',
            cell: ({ row }) => <div>Rp{Number(row.getValue('monthly_rate')).toLocaleString('id-ID')}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "default";

                if (status === 'tersedia') variant = "default";
                else if (status === 'terisi') variant = "secondary";
                else if (status === 'perbaikan') variant = "destructive";

                return <Badge variant={variant}>{status}</Badge>;
            },
        },
        {
            accessorKey: 'description',
            header: 'Deskripsi',
            cell: ({ row }) => <div className="max-w-[200px] truncate md:max-w-[300px]">{row.getValue('description')}</div>,
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
            <Head title="Room" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Room</h1>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={rooms}
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Room Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="kos_id">Kos</Label>
                                <Select value={data.kos_id} onValueChange={(value) => setData('kos_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kos.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.kos_id && <p className="text-sm text-red-600">{errors.kos_id}</p>}
                            </div>
                            <div>
                                <Label htmlFor="room_number">Nomor Kamar</Label>
                                <Input
                                    id="room_number"
                                    value={data.room_number}
                                    onChange={(e) => setData('room_number', e.target.value)}
                                    placeholder="Nomor Kamar"
                                />
                                {errors.room_number && <p className="text-sm text-red-600">{errors.room_number}</p>}
                            </div>
                            <div>
                                <Label htmlFor="monthly_rate">Harga per Bulan</Label>
                                <Input
                                    id="monthly_rate"
                                    type="number"
                                    value={data.monthly_rate}
                                    onChange={(e) => setData('monthly_rate', e.target.value)}
                                    placeholder="Harga"
                                />
                                {errors.monthly_rate && <p className="text-sm text-red-600">{errors.monthly_rate}</p>}
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tersedia">Tersedia</SelectItem>
                                        <SelectItem value="ditempati">Ditempati</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi fasilitas dll"
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>
                            <div>
                                <Label htmlFor="image">Foto Kamar</Label>
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Room</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingId!); }} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-kos_id">Kos</Label>
                                <Select value={editData.kos_id} onValueChange={(value) => setEditData({ ...editData, kos_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kos.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-room_number">Nomor Kamar</Label>
                                <Input
                                    id="edit-room_number"
                                    value={editData.room_number}
                                    onChange={(e) => setEditData({ ...editData, room_number: e.target.value })}
                                    placeholder="Nomor Kamar"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-monthly_rate">Harga per Bulan</Label>
                                <Input
                                    id="edit-monthly_rate"
                                    type="number"
                                    value={editData.monthly_rate}
                                    onChange={(e) => setEditData({ ...editData, monthly_rate: e.target.value })}
                                    placeholder="Harga"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-status">Status</Label>
                                <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tersedia">Tersedia</SelectItem>
                                        <SelectItem value="terisi">Terisi</SelectItem>
                                        <SelectItem value="perbaikan">Perbaikan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Deskripsi</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    placeholder="Deskripsi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-image">Foto Kamar (Opsional)</Label>
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
                    title="Hapus Room"
                    description="Apakah Anda yakin ingin menghapus data room ini? Tindakan ini tidak dapat dibatalkan."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
