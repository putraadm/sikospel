import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Eye, Edit, Trash, AlertTriangle, Plus } from 'lucide-react';
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
        title: 'Penghuni',
        href: '/admin/penghuni',
    },
];

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

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    penghuni: Penghuni[];
    users: User[];
}

export default function Index({ penghuni, users }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [selectedPenghuni, setSelectedPenghuni] = useState<Penghuni | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        name: '',
        no_wa: '',
        address: '',
        religion: '',
        file_path_kk: null as File | null,
        file_path_ktp: null as File | null,
    });

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

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/penghuni', {
            forceFormData: true,
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                toast.success('Penghuni berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan penghuni');
            }
        });
    };

    const handleEditClick = (item: Penghuni) => {
        setSelectedPenghuni(item);
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
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postEdit(`/admin/penghuni/${selectedPenghuni?.user_id}`, {
            forceFormData: true,
            onSuccess: () => {
                setIsEditOpen(false);
                resetEdit();
                setSelectedPenghuni(null);
                toast.success('Data penghuni berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui data penghuni');
            }
        });
    };

    const handleDetailClick = (item: Penghuni) => {
        setSelectedPenghuni(item);
        setIsDetailOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(`/admin/penghuni/${deleteId}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeleteId(null);
                    toast.success('Penghuni berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus penghuni');
                    setIsDeleteOpen(false);
                }
            });
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penghuni" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Penghuni</h2>
                        <p className="text-sm text-muted-foreground">Kelola data penghuni kost dengan mudah.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#664229] hover:bg-[#4a2f1d] shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Penghuni
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
                                <TableHead className="hidden md:table-cell text-white">Agama</TableHead>
                                <TableHead className="text-right text-white">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {penghuni.length > 0 ? (
                                penghuni.map((item) => (
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
                                        <TableCell className="hidden md:table-cell">{item.religion || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleDetailClick(item)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data penghuni.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Penghuni Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan informasi detail penghuni baru di bawah ini.
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
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Label htmlFor="religion">Agama</Label>
                                    <Input
                                        id="religion"
                                        value={data.religion}
                                        onChange={e => setData('religion', e.target.value)}
                                        placeholder="Agama"
                                    />
                                    {errors.religion && <p className="text-destructive text-sm font-medium">{errors.religion}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Alamat asal..."
                                />
                                {errors.address && <p className="text-destructive text-sm font-medium">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="file_path_kk">Upload KK</Label>
                                    <Input
                                        id="file_path_kk"
                                        type="file"
                                        onChange={e => setData('file_path_kk', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    {errors.file_path_kk && <p className="text-destructive text-sm font-medium">{errors.file_path_kk}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="file_path_ktp">Upload KTP</Label>
                                    <Input
                                        id="file_path_ktp"
                                        type="file"
                                        onChange={e => setData('file_path_ktp', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    {errors.file_path_ktp && <p className="text-destructive text-sm font-medium">{errors.file_path_ktp}</p>}
                                </div>
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
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Data Penghuni</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi penghuni di bawah ini.
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
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-white"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <Label htmlFor="edit_religion">Agama</Label>
                                    <Input
                                        id="edit_religion"
                                        value={editData.religion}
                                        onChange={e => setEditData('religion', e.target.value)}
                                    />
                                    {editErrors.religion && <p className="text-destructive text-sm font-medium">{editErrors.religion}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_address">Alamat Lengkap</Label>
                                <textarea
                                    id="edit_address"
                                    value={editData.address}
                                    onChange={e => setEditData('address', e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {editErrors.address && <p className="text-destructive text-sm font-medium">{editErrors.address}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_file_path_kk">Update KK (Opsional)</Label>
                                    <Input
                                        id="edit_file_path_kk"
                                        type="file"
                                        onChange={e => setEditData('file_path_kk', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    {editErrors.file_path_kk && <p className="text-destructive text-sm font-medium">{editErrors.file_path_kk}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit_file_path_ktp">Update KTP (Opsional)</Label>
                                    <Input
                                        id="edit_file_path_ktp"
                                        type="file"
                                        onChange={e => setEditData('file_path_ktp', e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="cursor-pointer"
                                    />
                                    {editErrors.file_path_ktp && <p className="text-destructive text-sm font-medium">{editErrors.file_path_ktp}</p>}
                                </div>
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

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Detail Informasi Penghuni</DialogTitle>
                        </DialogHeader>
                        {selectedPenghuni && (
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Nama Lengkap</h4>
                                        <p className="text-base font-semibold text-gray-900">{selectedPenghuni.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Email User</h4>
                                        <p className="text-base text-gray-900">{selectedPenghuni.user?.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">No. WhatsApp</h4>
                                        <p className="text-base text-gray-900">{selectedPenghuni.no_wa || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Agama</h4>
                                        <p className="text-base text-gray-900">{selectedPenghuni.religion || '-'}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground">Alamat</h4>
                                        <p className="text-base text-gray-900">{selectedPenghuni.address || '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 border-t pt-4">
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                            Kartu Keluarga (KK)
                                        </h4>
                                        {selectedPenghuni.file_path_kk ? (
                                            <div className="rounded-lg border bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {selectedPenghuni.file_path_kk.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center h-48 bg-gray-100">
                                                        <span className="text-4xl mb-2">📄</span>
                                                        <p className="mb-3 text-sm text-gray-600 font-medium">Dokumen PDF</p>
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
                                                        className="block relative group"
                                                    >
                                                        <img
                                                            src={getImageUrl(selectedPenghuni.file_path_kk)!}
                                                            alt="KK"
                                                            className="w-full h-48 object-cover object-center"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                                            Lihat Gambar
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-48 rounded border border-dashed flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                                                <span className="text-2xl mb-2">🚫</span>
                                                <span className="text-sm">Tidak ada file KK</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                            Kartu Tanda Penduduk (KTP)
                                        </h4>
                                        {selectedPenghuni.file_path_ktp ? (
                                            <div className="rounded-lg border bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                {selectedPenghuni.file_path_ktp.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center h-48 bg-gray-100">
                                                        <span className="text-4xl mb-2">📄</span>
                                                        <p className="mb-3 text-sm text-gray-600 font-medium">Dokumen PDF</p>
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
                                                        className="block relative group"
                                                    >
                                                        <img
                                                            src={getImageUrl(selectedPenghuni.file_path_ktp)!}
                                                            alt="KTP"
                                                            className="w-full h-48 object-cover object-center"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                                            Lihat Gambar
                                                        </div>
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-48 rounded border border-dashed flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                                                <span className="text-2xl mb-2">🚫</span>
                                                <span className="text-sm">Tidak ada file KTP</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="sm:justify-between border-t pt-4">
                            <span className="text-xs text-muted-foreground self-center hidden sm:block">
                                ID: {selectedPenghuni?.user_id}
                            </span>
                            <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader className="flex flex-col items-center text-center">
                            <div className="rounded-full bg-red-100 p-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">Hapus Data Penghuni?</DialogTitle>
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
