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
        title: 'Room',
        href: '/admin/room',
    },
];

interface Room {
    id: number;
    room_number: string;
    monthly_rate: number;
    status: string;
    description: string | null;
    kos_id: number;
    kos: {
        id: number;
        name: string;
        owner: {
            name: string;
            user: {
                name: string;
            };
        };
    };
}

interface Kos {
    id: number;
    name: string;
    owner: {
        user: {
            name: string;
        }
    }
}

interface Props {
    rooms: Room[];
    kos: Kos[];
}

export default function Index({ rooms, kos }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        kos_id: '',
        room_number: '',
        monthly_rate: '',
        status: 'available',
        description: '',
    });

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        kos_id: '',
        room_number: '',
        monthly_rate: '',
        status: '',
        description: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/room', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
                toast.success('Kamar berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan kamar');
            }
        });
    };

    const handleEditClick = (item: Room) => {
        setSelectedRoom(item);
        setEditData({
            kos_id: item.kos_id.toString(),
            room_number: item.room_number,
            monthly_rate: item.monthly_rate.toString(),
            status: item.status,
            description: item.description || '',
        });
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/room/${selectedRoom?.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                resetEdit();
                setSelectedRoom(null);
                toast.success('Kamar berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui kamar');
            }
        });
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(`/admin/room/${deleteId}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeleteId(null);
                    toast.success('Kamar berhasil dihapus');
                },
                onError: () => {
                    toast.error('Gagal menghapus kamar');
                    setIsDeleteOpen(false);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Kamar</h2>
                        <p className="text-sm text-muted-foreground">Kelola data kamar kos dengan mudah.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="bg-[#664229] hover:bg-[#4a2f1d] shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kamar
                    </Button>
                </div>

                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#664229]">
                            <TableRow className="hover:bg-[#664229]/90">
                                <TableHead className="w-[80px] text-white">ID</TableHead>
                                <TableHead className="text-white">Nomor Kamar</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Kos</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Harga Bulanan</TableHead>
                                <TableHead className="hidden md:table-cell text-white">Status</TableHead>
                                <TableHead className="hidden lg:table-cell text-white">Deskripsi</TableHead>
                                <TableHead className="text-right text-white">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rooms.length > 0 ? (
                                rooms.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.room_number}</span>
                                                <span className="md:hidden text-xs text-muted-foreground">{item.kos.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{item.kos.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">Rp {item.monthly_rate.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'occupied' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {item.status === 'available' ? 'Tersedia' : item.status === 'occupied' ? 'Terisi' : item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate" title={item.description || ''}>{item.description || '-'}</TableCell>
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
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Tidak ada data kamar.
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
                            <DialogTitle>Tambah Kamar Baru</DialogTitle>
                            <DialogDescription>
                                Masukkan informasi detail kamar baru di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="kos_id">Pilih Kos</Label>
                                <div className="relative">
                                    <select
                                        id="kos_id"
                                        value={data.kos_id}
                                        onChange={e => setData('kos_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih Kos</option>
                                        {kos.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.owner.user.name})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {errors.kos_id && <p className="text-destructive text-sm font-medium">{errors.kos_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="room_number">Nomor Kamar</Label>
                                <Input
                                    id="room_number"
                                    value={data.room_number}
                                    onChange={e => setData('room_number', e.target.value)}
                                    placeholder="Contoh: A-101"
                                    required
                                />
                                {errors.room_number && <p className="text-destructive text-sm font-medium">{errors.room_number}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="monthly_rate">Harga Bulanan (Rp)</Label>
                                <Input
                                    id="monthly_rate"
                                    type="number"
                                    value={data.monthly_rate}
                                    onChange={e => setData('monthly_rate', e.target.value)}
                                    placeholder="Contoh: 500000"
                                    required
                                />
                                {errors.monthly_rate && <p className="text-destructive text-sm font-medium">{errors.monthly_rate}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <div className="relative">
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="available">Tersedia</option>
                                        <option value="occupied">Terisi</option>
                                        <option value="maintenance">Perbaikan</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {errors.status && <p className="text-destructive text-sm font-medium">{errors.status}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Fasilitas AC, Wifi, dll..."
                                />
                                {errors.description && <p className="text-destructive text-sm font-medium">{errors.description}</p>}
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
                            <DialogTitle>Edit Data Kamar</DialogTitle>
                            <DialogDescription>
                                Perbarui informasi kamar di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_kos_id">Pilih Kos</Label>
                                <div className="relative">
                                    <select
                                        id="edit_kos_id"
                                        value={editData.kos_id}
                                        onChange={e => setEditData('kos_id', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="">Pilih Kos</option>
                                        {kos.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.owner.user.name})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {editErrors.kos_id && <p className="text-destructive text-sm font-medium">{editErrors.kos_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_room_number">Nomor Kamar</Label>
                                <Input
                                    id="edit_room_number"
                                    value={editData.room_number}
                                    onChange={e => setEditData('room_number', e.target.value)}
                                    required
                                />
                                {editErrors.room_number && <p className="text-destructive text-sm font-medium">{editErrors.room_number}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_monthly_rate">Harga Bulanan (Rp)</Label>
                                <Input
                                    id="edit_monthly_rate"
                                    type="number"
                                    value={editData.monthly_rate}
                                    onChange={e => setEditData('monthly_rate', e.target.value)}
                                    required
                                />
                                {editErrors.monthly_rate && <p className="text-destructive text-sm font-medium">{editErrors.monthly_rate}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <div className="relative">
                                    <select
                                        id="edit_status"
                                        value={editData.status}
                                        onChange={e => setEditData('status', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        required
                                    >
                                        <option value="available">Tersedia</option>
                                        <option value="occupied">Terisi</option>
                                        <option value="maintenance">Perbaikan</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {editErrors.status && <p className="text-destructive text-sm font-medium">{editErrors.status}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit_description">Deskripsi</Label>
                                <Textarea
                                    id="edit_description"
                                    value={editData.description}
                                    onChange={e => setEditData('description', e.target.value)}
                                />
                                {editErrors.description && <p className="text-destructive text-sm font-medium">{editErrors.description}</p>}
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
                            <DialogTitle className="text-xl">Hapus Data Kamar?</DialogTitle>
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
