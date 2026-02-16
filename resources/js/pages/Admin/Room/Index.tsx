import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal, Image as ImageIcon, X } from 'lucide-react';
import { useState, useRef } from 'react';
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
        images: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const createFileInputRef = useRef<HTMLInputElement>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        kos_id: '',
        room_number: '',
        type_kamar_id: '',
        status: '',
        images: [] as File[],
        _method: 'PUT',
    });

    const [editPreviews, setEditPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const editFileInputRef = useRef<HTMLInputElement>(null);

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
                setPreviews([]);
                setShowCreateModal(false);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (isEdit) {
            const newImages = [...editData.images, ...files];
            setEditData({ ...editData, images: newImages });

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setEditPreviews([...editPreviews, ...newPreviews]);
        } else {
            const newImages = [...data.images, ...files];
            setData('images', newImages);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeFile = (index: number, isEdit: boolean = false) => {
        if (isEdit) {
            const newImages = [...editData.images];
            newImages.splice(index, 1);
            setEditData({ ...editData, images: newImages });

            const newPreviews = [...editPreviews];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            setEditPreviews(newPreviews);
        } else {
            const newImages = [...data.images];
            newImages.splice(index, 1);
            setData('images', newImages);

            const newPreviews = [...previews];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            setPreviews(newPreviews);
        }
    };

    const deleteExistingImage = (imageId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
            router.delete(`/admin/room-image/${imageId}`, {
                onSuccess: () => {
                    setExistingImages(existingImages.filter(img => img.id !== imageId));
                }
            });
        }
    };

    const handleEdit = (item: Room) => {
        setEditingId(item.id);
        setEditData({
            kos_id: item.kos_id.toString(),
            room_number: item.room_number,
            type_kamar_id: item.type_kamar_id?.toString() || '',
            status: item.status,
            images: [],
            _method: 'PUT',
        });
        setEditPreviews([]);
        setExistingImages(item.images || []);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            kos_id: '',
            room_number: '',
            type_kamar_id: '',
            status: '',
            images: [],
            _method: 'PUT',
        });
    };

    const handleUpdate = (id: number) => {
        router.post(`/admin/room/${id}`, editData, {
            forceFormData: true,
            onSuccess: () => {
                setEditingId(null);
                setEditPreviews([]);
                setExistingImages([]);
                setEditData({
                    kos_id: '',
                    room_number: '',
                    type_kamar_id: '',
                    status: '',
                    images: [],
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
            accessorKey: 'images',
            header: 'Foto',
            cell: ({ row }) => (
                <div className="size-12 overflow-hidden rounded-md border bg-neutral-100">
                    {row.original.images?.[0] ? (
                        <img src={`/storage/${row.original.images[0].gambar}`} alt="" className="h-full w-full object-cover" />
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
            accessorKey: 'images',
            header: 'Gambar',
            cell: ({ row }) => (
                <div className="flex -space-x-2 overflow-hidden">
                    {(row.original.images || []).map((img: any, idx: number) => (
                        <img
                            key={img.id}
                            src={`/storage/${img.gambar}`}
                            alt={`Room ${idx}`}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        />
                    ))}
                    {(!row.original.images || row.original.images.length === 0) && <span className="text-muted-foreground text-xs">No images</span>}
                </div>
            ),
        },
        {
            accessorKey: 'type_kamar',
            header: 'Tipe Kamar',
            cell: ({ row }) => <div className="font-medium">{row.original.type_kamar?.nama || '-'}</div>,
        },
        {
            accessorKey: 'type_kamar.harga',
            header: 'Harga/Bulan',
            cell: ({ row }) => <div>Rp{Number(row.original.type_kamar?.harga || 0).toLocaleString('id-ID')}</div>,
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
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="images">Gambar Kamar Tambahan</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => createFileInputRef.current?.click()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <input
                                    id="images"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={createFileInputRef}
                                    onChange={(e) => handleFileChange(e)}
                                />
                                {previews.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                                                <img src={preview} alt="" className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
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
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="edit-images">Tambah Gambar Baru</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => editFileInputRef.current?.click()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <input
                                    id="edit-images"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    ref={editFileInputRef}
                                    onChange={(e) => handleFileChange(e, true)}
                                />

                                {existingImages.length > 0 && (
                                    <div className="mb-4">
                                        <Label className="text-xs text-muted-foreground mb-2 block">Gambar Saat Ini:</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {existingImages.map((img) => (
                                                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border">
                                                    <img src={`/storage/${img.gambar}`} alt="" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteExistingImage(img.id)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {editPreviews.length > 0 && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">Gambar Baru Ditambahkan:</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {editPreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                                                    <img src={preview} alt="" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index, true)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
