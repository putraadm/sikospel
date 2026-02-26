import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Room {
    id: number;
    room_number: string;
    kos_id: number;
    type_kamar_id: number;
    status: string;
}

interface Kos {
    id: number;
    name: string;
}

interface TypeKamar {
    id: number;
    nama: string;
}

interface Penghuni {
    user_id: number;
    name: string;
    no_wa: string | null;
    address: string | null;
    religion: string | null;
    file_path_kk: string | null;
    file_path_ktp: string | null;
    tanggal_daftar: string | null;
    status_penghuni: 'penghuni' | 'pra penghuni';
    user: {
        email: string;
    };
    current_room?: {
        id: number;
        kos?: { id: number };
        type_kamar?: { id: number };
    };
}

interface Props {
    penghuni: Penghuni;
    rooms: Room[];
    typeKamars: TypeKamar[];
    kos: Kos[];
}

const religions = [
    'Islam',
    'Kristen Protestan',
    'Katolik',
    'Hindu',
    'Buddha',
    'Khonghucu'
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Penghuni', href: '/admin/penghuni' },
    { title: 'Edit Penghuni', href: '#' },
];

export default function Edit({ penghuni, rooms, typeKamars, kos }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: penghuni.name,
        no_wa: penghuni.no_wa || '',
        address: penghuni.address || '',
        religion: penghuni.religion || '',
        file_path_kk: null as File | null,
        file_path_ktp: null as File | null,
        tanggal_daftar: penghuni.tanggal_daftar || '',
        status_penghuni: penghuni.status_penghuni,
        kos_id: penghuni.current_room?.kos?.id.toString() || '',
        type_kamar_id: penghuni.current_room?.type_kamar?.id.toString() || '',
        room_id: penghuni.current_room?.id.toString() || '',
    });

    const filteredRooms = rooms.filter((room: Room) =>
        (!data.kos_id || room.kos_id.toString() === data.kos_id) &&
        (!data.type_kamar_id || room.type_kamar_id.toString() === data.type_kamar_id) &&
        (room.status === 'tersedia' || room.id.toString() === data.room_id)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/penghuni/${penghuni.user_id}`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Penghuni" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Data Penghuni</h1>
                        <p className="text-muted-foreground text-sm">Update informasi data penghuni <strong>{penghuni.name}</strong>.</p>
                    </div>
                    <Link href="/admin/penghuni">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl rounded-xl border border-sidebar-border bg-white p-6 shadow-sm dark:bg-[#161615]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2 opacity-70">
                                <Label>User Akun (Email)</Label>
                                <Input value={penghuni.user.email} disabled className="bg-muted" />
                                <p className="text-[10px] italic">Email akun tidak dapat diubah.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama Lengkap"
                                />
                                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="no_wa">Nomor WhatsApp</Label>
                                <Input
                                    id="no_wa"
                                    value={data.no_wa}
                                    onChange={(e) => setData('no_wa', e.target.value)}
                                    placeholder="Contoh: 08123456789"
                                />
                                {errors.no_wa && <p className="text-xs text-red-600">{errors.no_wa}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="religion">Agama</Label>
                                <Select value={data.religion || ''} onValueChange={(val) => setData('religion', val)}>
                                    <SelectTrigger id="religion">
                                        <SelectValue placeholder="Pilih Agama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {religions.map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.religion && <p className="text-xs text-red-600">{errors.religion}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tanggal_daftar">Tanggal Daftar</Label>
                                <Input
                                    id="tanggal_daftar"
                                    type="date"
                                    value={data.tanggal_daftar}
                                    onChange={(e) => setData('tanggal_daftar', e.target.value)}
                                />
                                {errors.tanggal_daftar && <p className="text-xs text-red-600">{errors.tanggal_daftar}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status_penghuni">Status Penghuni</Label>
                                <Select value={data.status_penghuni} onValueChange={(val: any) => setData('status_penghuni', val)}>
                                    <SelectTrigger id="status_penghuni">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="penghuni">Penghuni Tetap</SelectItem>
                                        <SelectItem value="pra penghuni">Pra Penghuni</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status_penghuni && <p className="text-xs text-red-600">{errors.status_penghuni}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="kos_id">Pilih Kos</Label>
                                <Select value={data.kos_id} onValueChange={(val) => {
                                    setData(d => ({ ...d, kos_id: val, room_id: '' }));
                                }}>
                                    <SelectTrigger id="kos_id">
                                        <SelectValue placeholder="Pilih Kos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kos.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>{k.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type_kamar_id">Tipe Kamar</Label>
                                <Select value={data.type_kamar_id} onValueChange={(val) => {
                                    setData(d => ({ ...d, type_kamar_id: val, room_id: '' }));
                                }}>
                                    <SelectTrigger id="type_kamar_id">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeKamars.map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room_id">Unit Kamar</Label>
                                <Select value={data.room_id} onValueChange={(val) => setData('room_id', val)} disabled={!data.kos_id}>
                                    <SelectTrigger id="room_id">
                                        <SelectValue placeholder="Pilih Unit Kamar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredRooms.length > 0 ? (
                                            filteredRooms.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.room_number}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-muted-foreground">Tidak ada unit tersedia</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.room_id && <p className="text-xs text-red-600">{errors.room_id}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Alamat lengkap asal penghuni"
                                rows={3}
                            />
                            {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="file_path_kk">Update Kartu Keluarga (KK) <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span></Label>
                                <Input
                                    id="file_path_kk"
                                    type="file"
                                    onChange={(e) => setData('file_path_kk', e.target.files ? e.target.files[0] : null)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {errors.file_path_kk && <p className="text-xs text-red-600">{errors.file_path_kk}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file_path_ktp">Update KTP <span className="text-[10px] text-muted-foreground font-normal">(Opsional)</span></Label>
                                <Input
                                    id="file_path_ktp"
                                    type="file"
                                    onChange={(e) => setData('file_path_ktp', e.target.files ? e.target.files[0] : null)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {errors.file_path_ktp && <p className="text-xs text-red-600">{errors.file_path_ktp}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={processing} className="bg-[#664229] hover:bg-[#664229]/90 text-white min-w-[150px]">
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
