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
        title: 'Pemilik',
        href: '/admin/pemilik',
    },
];

interface Pemilik {
    user_id: number;
    name: string;
    no_wa: string | null;
    address: string | null;
    user: {
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    pemilik: Pemilik[];
    users: User[];
}

export default function Index({ pemilik, users }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [selectedPemilik, setSelectedPemilik] = useState<Pemilik | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pemilik', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                toast.success('Pemilik berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan pemilik');
            }
        });
    };

    const handleEditClick = (item: Pemilik) => {
        setSelectedPemilik(item);
        setEditData({
            user_id: item.user_id.toString(),
            name: item.name,
            no_wa: item.no_wa || '',
            address: item.address || '',
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/pemilik/${selectedPemilik?.user_id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                resetEdit();
                setSelectedPemilik(null);
                toast.success('Data pemilik berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data pemilik');
            }
        });
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(`/admin/pemilik/${deleteId}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeleteId(null);
                    toast.success('Pemilik berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus pemilik');
                    setIsDeleteOpen(false);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemilik" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Pemilik</h2>
                        <p className="text-sm text-muted-foreground">Kelola data pemilik kost dengan mudah.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#664229] hover:bg-[#4a2f1d] shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pemilik
                    </Button>
                </div>

                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#664229]">
                            <TableRow className="hover:bg-[#664229]/90">
                                <TableHead className="w-[80px] text-white">ID</TableHead>
                                <TableHead className="text-white">Nama</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Email</TableHead>
                                <TableHead className="hidden md:table-cell text-white">No. WA</TableHead>
                                <TableHead className="hidden lg:table-cell text-white">Alamat</TableHead>
                                <TableHead className="text-right text-white">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pemilik.length > 0 ? (
                                pemilik.map((item) => (
                                    <TableRow key={item.user_id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium">{item.user_id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="md:hidden text-xs text-muted-foreground">{item.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{item.user.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">{item.no_wa || '-'}</TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate" title={item.address || ''}>{item.address || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleEditClick(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteClick(item.user_id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data pemilik.
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
                            <DialogTitle>Tambah Pemilik Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan informasi detail pemilik baru di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="user_id">User Akun</Label>
                                <div className="relative">
                                    <select
                                        id="user_id"
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {errors.user_id && <p className="text-destructive text-sm font-medium">{errors.user_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.name && <p className="text-destructive text-sm font-medium">{errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="no_wa">No. WhatsApp</Label>
                                <Input
                                    id="no_wa"
                                    value={data.no_wa}
                                    onChange={e => setData('no_wa', e.target.value)}
                                    placeholder="08..."
                                />
                                {errors.no_wa && <p className="text-destructive text-sm font-medium">{errors.no_wa}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Alamat domisili..."
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
                            <DialogTitle>Edit Data Pemilik</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi pemilik di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_user_id">User Akun</Label>
                                <div className="relative">
                                    <select
                                        id="edit_user_id"
                                        value={editData.user_id}
                                        onChange={e => setEditData('user_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {editErrors.user_id && <p className="text-destructive text-sm font-medium">{editErrors.user_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_name">Nama Lengkap</Label>
                                <Input
                                    id="edit_name"
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                    required
                                />
                                {editErrors.name && <p className="text-destructive text-sm font-medium">{editErrors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_no_wa">No. WhatsApp</Label>
                                <Input
                                    id="edit_no_wa"
                                    value={editData.no_wa}
                                    onChange={e => setEditData('no_wa', e.target.value)}
                                />
                                {editErrors.no_wa && <p className="text-destructive text-sm font-medium">{editErrors.no_wa}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_address">Alamat Lengkap</Label>
                                <Textarea
                                    id="edit_address"
                                    value={editData.address}
                                    onChange={e => setEditData('address', e.target.value)}
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
                            <DialogTitle className="text-xl">Hapus Data Pemilik?</DialogTitle>
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
