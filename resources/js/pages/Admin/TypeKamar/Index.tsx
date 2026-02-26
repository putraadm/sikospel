import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, MoreHorizontal, Image as ImageIcon, X } from 'lucide-react';
import { useState, useRef } from 'react';
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
    images?: { id: number; gambar: string }[];
}

interface Props {
    typeKamars: TypeKamar[];
}

export default function Index({ typeKamars }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        deskripsi: '',
        harga: '',
        images: [] as File[],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const createFileInputRef = useRef<HTMLInputElement>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        nama: '',
        deskripsi: '',
        harga: '',
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
        post('/admin/type-kamar', {
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

    const handleEdit = (item: TypeKamar) => {
        setEditingId(item.id);
        setEditData({
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            harga: item.harga.toString(),
            images: [],
            _method: 'PUT',
        });
        setEditPreviews([]);
        setExistingImages(item.images || []);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({
            nama: '',
            deskripsi: '',
            harga: '',
            images: [],
            _method: 'PUT',
        });
        setEditPreviews([]);
        setExistingImages([]);
    };

    const handleUpdate = (id: number) => {
        router.post(`/admin/type-kamar/${id}`, editData, {
            forceFormData: true,
            onSuccess: () => {
                setEditingId(null);
                setEditPreviews([]);
                setExistingImages([]);
                setEditData({
                    nama: '',
                    deskripsi: '',
                    harga: '',
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
            accessorKey: 'images',
            header: 'Foto',
            cell: ({ row }) => (
                <div className="flex -space-x-2 overflow-hidden">
                    {(row.original.images || []).map((img: any, idx: number) => (
                        <img
                            key={img.id}
                            src={`/storage/${img.gambar}`}
                            alt={`Type ${idx}`}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                        />
                    ))}
                    {(!row.original.images || row.original.images.length === 0) && <span className="text-muted-foreground text-xs">No images</span>}
                </div>
            ),
        },
        {
            accessorKey: 'nama',
            header: 'Nama Tipe',
        },
        {
            accessorKey: 'harga',
            header: 'Harga (Per Hari)',
            cell: ({ row }) => <div>Rp{Number(row.getValue('harga')).toLocaleString('id-ID')} / hari</div>,
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
                                <Label htmlFor="harga">Harga (Per Hari)</Label>
                                <Input
                                    id="harga"
                                    type="number"
                                    value={data.harga}
                                    onChange={(e) => setData('harga', e.target.value)}
                                    placeholder="Harga per hari"
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
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="images">Gambar Tipe Kamar</Label>
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
                                <Label htmlFor="edit-harga">Harga (Per Hari)</Label>
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
