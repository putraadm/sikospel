import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Edit, Trash, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kos',
        href: '/admin/kos',
    },
];

interface Kos {
    id: number;
    name: string;
    address: string;
    owner_id: number;
    owner: {
        name: string;
        user: {
            email: string;
        };
    };
}

interface Pemilik {
    user_id: number;
    name: string;
    user: {
        email: string;
    };
}

interface Props {
    kos: Kos[];
    pemilik: Pemilik[];
}

export default function Index({ kos, pemilik }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [selectedKos, setSelectedKos] = useState<Kos | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '',
        name: '',
        address: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        owner_id: '',
        name: '',
        address: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/kos', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                toast.success('Kos berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan kos');
            }
        });
    };

    const handleEditClick = (item: Kos) => {
        setSelectedKos(item);
        setEditData({
            owner_id: item.owner_id.toString(),
            name: item.name,
            address: item.address,
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/kos/${selectedKos?.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                resetEdit();
                setSelectedKos(null);
                toast.success('Data kos berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data kos');
            }
        });
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(`/admin/kos/${deleteId}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeleteId(null);
                    toast.success('Kos berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus kos');
                    setIsDeleteOpen(false);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kos" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Kos</h2>
                        <p className="text-sm text-muted-foreground">Kelola data kos yang terdaftar.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#664229] hover:bg-[#4a2f1d] shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kos
                    </Button>
                </div>

                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#664229]">
                            <TableRow className="hover:bg-[#664229]/90">
                                <TableHead className="w-[80px] text-white">ID</TableHead>
                                <TableHead className="text-white">Nama Kos</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Alamat</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Pemilik</TableHead>
                                <TableHead className="text-right text-white">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kos.length > 0 ? (
                                kos.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[300px] truncate" title={item.address}>{item.address}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span>{item.owner.name}</span>
                                                <span className="text-xs text-muted-foreground">{item.owner.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleEditClick(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(item.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data kos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tambah Kos Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan informasi detail kos baru di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="owner_id">Pilih Pemilik</Label>
                                <div className="relative">
                                    <select
                                        id="owner_id"
                                        value={data.owner_id}
                                        onChange={e => setData('owner_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih Pemilik</option>
                                        {pemilik.map(p => (
                                            <option key={p.user_id} value={p.user_id}>
                                                {p.name} ({p.user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {errors.owner_id && <p className="text-destructive text-sm font-medium">{errors.owner_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Kos</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: Kos Melati"
                                    required
                                />
                                {errors.name && <p className="text-destructive text-sm font-medium">{errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Alamat lokasi kos..."
                                    required
                                />
                                {errors.address && <p className="text-destructive text-sm font-medium">{errors.address}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-[#664229] hover:bg-[#4a2f1d]">
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Data Kos</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi kos di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_owner_id">Pilih Pemilik</Label>
                                <div className="relative">
                                    <select
                                        id="edit_owner_id"
                                        value={editData.owner_id}
                                        onChange={e => setEditData('owner_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih Pemilik</option>
                                        {pemilik.map(p => (
                                            <option key={p.user_id} value={p.user_id}>
                                                {p.name} ({p.user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {editErrors.owner_id && <p className="text-destructive text-sm font-medium">{editErrors.owner_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">Nama Kos</Label>
                                <Input
                                    id="edit_name"
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                    required
                                />
                                {editErrors.name && <p className="text-destructive text-sm font-medium">{editErrors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_address">Alamat Lengkap</Label>
                                <Textarea
                                    id="edit_address"
                                    value={editData.address}
                                    onChange={e => setEditData('address', e.target.value)}
                                    required
                                />
                                {editErrors.address && <p className="text-destructive text-sm font-medium">{editErrors.address}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editProcessing} className="bg-[#664229] hover:bg-[#4a2f1d]">
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader className="flex flex-col items-center text-center">
                            <div className="rounded-full bg-red-100 p-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">Hapus Data Kos?</DialogTitle>
                            <DialogDescription className="pt-2">
                                Apakah Anda yakin ingin menghapus data ini? <br />
                                <span className="font-medium text-red-600">Tindakan ini tidak dapat dibatalkan.</span>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center gap-3 mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="w-full sm:w-auto min-w-[100px]">
                                Batal
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmDelete} className="w-full sm:w-auto min-w-[100px] bg-red-600 hover:bg-red-700">
                                Ya, Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
