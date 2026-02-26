import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Room, type Kos, type TypeKamar } from '@/types';
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
    typeKamars: TypeKamar[];
}

export default function Index({ rooms, kos, typeKamars }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        kos_id: '',
        room_number: '',
        type_kamar_id: '',
        status: 'tersedia',
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        kos_id: '',
        room_number: '',
        type_kamar_id: '',
        status: '',
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
            type_kamar_id: item.type_kamar_id?.toString() || '',
            status: item.status,
            _method: 'PUT',
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            kos_id: '',
            room_number: '',
            type_kamar_id: '',
            status: '',
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
                    type_kamar_id: '',
                    status: '',
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
            accessorKey: 'room_number',
            header: 'No. Kamar',
            cell: ({ row }) => <div className="font-medium text-primary">{row.getValue('room_number')}</div>,
        },
        {
            accessorKey: 'kos.name',
            header: 'Kos',
        },
        {
            accessorKey: 'type_kamar',
            header: 'Tipe Kamar',
            cell: ({ row }) => <div className="font-medium">{row.original.type_kamar?.nama || '-'}</div>,
        },
        {
            accessorKey: 'type_kamar.harga',
            header: 'Harga/Bulan',
            cell: ({ row }) => <div>Rp{(Number(row.original.type_kamar?.harga || 0) * 30).toLocaleString('id-ID')}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "default";

                if (status === 'tersedia') variant = "default";
                else if (status === 'ditempati') variant = "secondary";
                else if (status === 'perbaikan') variant = "destructive";

                return <Badge variant={variant}>{status}</Badge>;
            },
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
                    <h1 className="text-2xl font-bold">Kelola Kamar</h1>
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
                            <DialogTitle>Tambah Kamar Baru</DialogTitle>
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
                                <Label htmlFor="type_kamar_id">Tipe Kamar</Label>
                                <Select value={data.type_kamar_id} onValueChange={(value) => setData('type_kamar_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Kamar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeKamars.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.nama} - Rp{Number(type.harga).toLocaleString('id-ID')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type_kamar_id && <p className="text-sm text-red-600">{errors.type_kamar_id}</p>}
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
                                <Label htmlFor="edit-type_kamar_id">Tipe Kamar</Label>
                                <Select value={editData.type_kamar_id} onValueChange={(value) => setEditData({ ...editData, type_kamar_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Kamar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeKamars.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.nama} - Rp{Number(type.harga).toLocaleString('id-ID')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
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
