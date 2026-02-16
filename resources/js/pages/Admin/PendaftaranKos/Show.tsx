import { Head, Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Copy, FileText, Key } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pendaftaran Kos', href: '/admin/pendaftaran-kos' },
    { title: 'Detail Pendaftaran', href: '#' },
];

interface TypeKamar {
    id: number;
    nama: string;
    harga: number;
}

interface Room {
    id: number;
    room_number: string;
    status: string;
    type_kamar?: TypeKamar;
}

interface PendaftaranKos {
    id: number;
    status: 'menunggu' | 'diterima' | 'ditolak' | 'dibatalkan';
    nama: string;
    no_wa: string;
    alamat: string;
    agama: string;
    file_path_ktp: string | null;
    file_path_kk: string | null;
    start_date: string | null;
    notes: string | null;
    kos: {
        name: string;
        address: string;
        rooms: Room[];
    } | null;
    assigned_room?: {
        room_number: string;
        status: string;
        type_kamar?: TypeKamar;
    };
    created_at: string;
    verified_at: string | null;
}

interface Props {
    pendaftaranKos: PendaftaranKos;
    availableRooms: Room[];
    generatedCredentials?: {
        username: string;
        email: string;
        password: string;
    } | null;
}

export default function Show({ pendaftaranKos, availableRooms, generatedCredentials }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        status: pendaftaranKos.status,
        notes: pendaftaranKos.notes || '',
        assigned_room_id: '',
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            menunggu: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            diterima: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            ditolak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            dibatalkan: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };
        const labels: Record<string, string> = {
            menunggu: 'Menunggu', diterima: 'Diterima', ditolak: 'Ditolak', dibatalkan: 'Dibatalkan',
        };
        return <Badge className={variants[status]}>{labels[status]}</Badge>;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/admin/pendaftaran-kos/${pendaftaranKos.id}`);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const isAlreadyProcessed = pendaftaranKos.status === 'diterima' || pendaftaranKos.status === 'ditolak';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pendaftaran Kos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Pendaftaran Kos</h1>
                        <p className="text-[#706f6c] dark:text-[#A1A09A]">Kelola status pendaftaran penghuni kos</p>
                    </div>
                    <Link
                        href="/admin/pendaftaran-kos"
                        className="inline-block rounded-sm border border-[#19140035] px-4 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Kembali
                    </Link>
                </div>

                {/* Credentials yang baru di-generate (ditampilkan setelah approve) */}
                {generatedCredentials && (
                    <div className="rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Key className="h-5 w-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                Akun Penghuni Berhasil Dibuat
                            </h2>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                            Berikut adalah kredensial login untuk penghuni. Sampaikan informasi ini kepada penghuni.
                        </p>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                <div><span className="text-gray-500">Username:</span> <strong>{generatedCredentials.username}</strong></div>
                                <button onClick={() => copyToClipboard(generatedCredentials.username)} className="text-gray-400 hover:text-gray-600"><Copy className="h-4 w-4" /></button>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                <div><span className="text-gray-500">Email:</span> <strong>{generatedCredentials.email}</strong></div>
                                <button onClick={() => copyToClipboard(generatedCredentials.email)} className="text-gray-400 hover:text-gray-600"><Copy className="h-4 w-4" /></button>
                            </div>
                            <div className="flex items-center justify-between rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                <div><span className="text-gray-500">Password:</span> <strong>{generatedCredentials.password}</strong></div>
                                <button onClick={() => copyToClipboard(generatedCredentials.password)} className="text-gray-400 hover:text-gray-600"><Copy className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Informasi Pendaftaran */}
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold">Informasi Pendaftaran</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Status</Label>
                                <div className="mt-1">{getStatusBadge(pendaftaranKos.status)}</div>
                            </div>
                            <div>
                                <Label>Tanggal Daftar</Label>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {new Date(pendaftaranKos.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            {pendaftaranKos.start_date && (
                                <div>
                                    <Label>Rencana Tanggal Masuk</Label>
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {new Date(pendaftaranKos.start_date).toLocaleDateString('id-ID', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                            {pendaftaranKos.notes && (
                                <div>
                                    <Label>Catatan</Label>
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{pendaftaranKos.notes}</p>
                                </div>
                            )}
                            {pendaftaranKos.verified_at && (
                                <div>
                                    <Label>Tanggal Verifikasi</Label>
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {new Date(pendaftaranKos.verified_at).toLocaleDateString('id-ID', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informasi Kos */}
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold">Informasi Kos</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Nama Kos</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.kos?.name ?? '-'}</p>
                            </div>
                            <div>
                                <Label>Alamat Kos</Label>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{pendaftaranKos.kos?.address ?? '-'}</p>
                            </div>
                            {pendaftaranKos.assigned_room && (
                                <div>
                                    <Label>Kamar yang Ditempati</Label>
                                    <div className="mt-1">
                                        <p className="text-sm font-medium">Kamar {pendaftaranKos.assigned_room.room_number}</p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            {pendaftaranKos.assigned_room.type_kamar
                                                ? `${pendaftaranKos.assigned_room.type_kamar.nama} - Rp${Number(pendaftaranKos.assigned_room.type_kamar.harga).toLocaleString()} / bulan`
                                                : 'Rp - / bulan'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Informasi Calon Penghuni */}
                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <h2 className="mb-4 text-lg font-semibold">Informasi Calon Penghuni</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <Label>Nama Lengkap</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.nama}</p>
                            </div>
                            <div>
                                <Label>No. WhatsApp</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.no_wa}</p>
                            </div>
                            <div>
                                <Label>Agama</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.agama}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>Alamat</Label>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">{pendaftaranKos.alamat}</p>
                            </div>
                            <div>
                                <Label>File KTP</Label>
                                {pendaftaranKos.file_path_ktp ? (
                                    <div className="mt-2 overflow-hidden rounded-lg border bg-gray-50 shadow-sm transition-shadow hover:shadow-md">
                                        {pendaftaranKos.file_path_ktp.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                                                <FileText className="mb-2 h-8 w-8 text-gray-400" />
                                                <p className="mb-2 text-xs font-medium text-gray-600">Dokumen PDF</p>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/storage/${pendaftaranKos.file_path_ktp}`} target="_blank" rel="noopener noreferrer">
                                                        Buka KTP
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <a
                                                href={`/storage/${pendaftaranKos.file_path_ktp}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative block"
                                            >
                                                <img
                                                    src={`/storage/${pendaftaranKos.file_path_ktp}`}
                                                    alt="KTP"
                                                    className="h-32 w-full object-cover object-center"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                    Lihat KTP
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Tidak ada file</p>
                                )}
                            </div>
                            <div>
                                <Label>File KK</Label>
                                {pendaftaranKos.file_path_kk ? (
                                    <div className="mt-2 overflow-hidden rounded-lg border bg-gray-50 shadow-sm transition-shadow hover:shadow-md">
                                        {pendaftaranKos.file_path_kk.toLowerCase().endsWith('.pdf') ? (
                                            <div className="flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
                                                <FileText className="mb-2 h-8 w-8 text-gray-400" />
                                                <p className="mb-2 text-xs font-medium text-gray-600">Dokumen PDF</p>
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={`/storage/${pendaftaranKos.file_path_kk}`} target="_blank" rel="noopener noreferrer">
                                                        Buka KK
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <a
                                                href={`/storage/${pendaftaranKos.file_path_kk}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative block"
                                            >
                                                <img
                                                    src={`/storage/${pendaftaranKos.file_path_kk}`}
                                                    alt="KK"
                                                    className="h-32 w-full object-cover object-center"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                    Lihat KK
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Tidak ada file</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Update Status — hanya tampil jika belum diproses */}
                {!isAlreadyProcessed && (
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold">Update Status Pendaftaran</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="mt-1 block w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                                >
                                    <option value="menunggu">Menunggu</option>
                                    <option value="diterima">Diterima</option>
                                    <option value="ditolak">Ditolak</option>
                                    <option value="dibatalkan">Dibatalkan</option>
                                </select>
                            </div>

                            {/* Pilih Kamar — hanya saat status "Diterima" */}
                            {data.status === 'diterima' && (
                                <div>
                                    <Label htmlFor="assigned_room_id">Tentukan Kamar untuk Penghuni *</Label>
                                    <Select value={data.assigned_room_id} onValueChange={(val) => setData('assigned_room_id', val)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih Kamar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRooms.length > 0 ? (
                                                availableRooms.map((room) => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        Kamar {room.room_number} — {room.type_kamar ? `${room.type_kamar.nama} (Rp${Number(room.type_kamar.harga).toLocaleString()})` : 'Harga belum diatur'}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>Tidak ada kamar tersedia</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_room_id && <p className="text-sm text-red-600">{errors.assigned_room_id}</p>}
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A] mt-1">
                                        Wajib dipilih saat menerima pendaftaran. Akun penghuni akan otomatis dibuat.
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="notes">Catatan Admin</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Tambahkan catatan..."
                                    className="mt-1 block w-full rounded-md border border-[#19140035] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Update Status'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
