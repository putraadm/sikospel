import { Head, Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pendaftaran Kos',
        href: '/admin/pendaftaran-kos',
    },
    {
        title: 'Detail Pendaftaran',
        href: '#',
    },
];

interface PendaftaranKos {
    id: number;
    status: 'menunggu' | 'diterima' | 'ditolak' | 'dibatalkan';
    notes: string | null;
    kos: {
        name: string;
        address: string;
    };
    calonPenghuni: {
        name: string;
        no_wa: string;
        address: string;
        religion: string;
        file_path_kk: string;
        file_path_ktp: string;
    };
    preferredRoom?: {
        room_number: string;
        monthly_rate: number;
        status: string;
    };
    created_at: string;
    verified_at: string | null;
}

interface Props {
    pendaftaranKos: PendaftaranKos;
}

export default function Show({ pendaftaranKos }: Props) {
    const { data, setData, put, processing } = useForm({
        status: pendaftaranKos.status,
        notes: pendaftaranKos.notes || '',
    });

    const getStatusBadge = (status: string) => {
        const variants = {
            menunggu: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            diterima: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            ditolak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            dibatalkan: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        };

        const labels = {
            menunggu: 'Menunggu',
            diterima: 'Diterima',
            ditolak: 'Ditolak',
            dibatalkan: 'Dibatalkan',
        };

        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {labels[status as keyof typeof labels]}
            </Badge>
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/admin/pendaftaran-kos/${pendaftaranKos.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Pendaftaran Kos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Pendaftaran Kos</h1>
                        <p className="text-[#706f6c] dark:text-[#A1A09A]">
                            Kelola status pendaftaran penghuni kos
                        </p>
                    </div>
                    <Link
                        href="/admin/pendaftaran-kos"
                        className="inline-block rounded-sm border border-[#19140035] px-4 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Kembali
                    </Link>
                </div>

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
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            {pendaftaranKos.verified_at && (
                                <div>
                                    <Label>Tanggal Verifikasi</Label>
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {new Date(pendaftaranKos.verified_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
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
                                <p className="mt-1 text-sm">{pendaftaranKos.kos.name}</p>
                            </div>
                            <div>
                                <Label>Alamat Kos</Label>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {pendaftaranKos.kos.address}
                                </p>
                            </div>
                            {pendaftaranKos.preferredRoom && (
                                <div>
                                    <Label>Kamar Pilihan</Label>
                                    <div className="mt-1">
                                        <p className="text-sm font-medium">
                                            Kamar {pendaftaranKos.preferredRoom.room_number}
                                        </p>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            Rp{pendaftaranKos.preferredRoom.monthly_rate.toLocaleString()} / bulan
                                        </p>
                                        <Badge
                                            className={`mt-1 ${
                                                pendaftaranKos.preferredRoom.status === 'tersedia'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {pendaftaranKos.preferredRoom.status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia'}
                                        </Badge>
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
                                <p className="mt-1 text-sm">{pendaftaranKos.calonPenghuni.name}</p>
                            </div>
                            <div>
                                <Label>No. WhatsApp</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.calonPenghuni.no_wa}</p>
                            </div>
                            <div>
                                <Label>Agama</Label>
                                <p className="mt-1 text-sm">{pendaftaranKos.calonPenghuni.religion}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label>Alamat</Label>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {pendaftaranKos.calonPenghuni.address}
                                </p>
                            </div>
                            <div>
                                <Label>File KTP</Label>
                                {pendaftaranKos.calonPenghuni.file_path_ktp ? (
                                    <a
                                        href={`/storage/${pendaftaranKos.calonPenghuni.file_path_ktp}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Lihat KTP
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Tidak ada file</p>
                                )}
                            </div>
                            <div>
                                <Label>File KK</Label>
                                {pendaftaranKos.calonPenghuni.file_path_kk ? (
                                    <a
                                        href={`/storage/${pendaftaranKos.calonPenghuni.file_path_kk}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Lihat KK
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">Tidak ada file</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Update Status */}
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
                        <div>
                            <Label htmlFor="notes">Catatan</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Tambahkan catatan untuk pendaftaran ini..."
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
            </div>
        </AppLayout>
    );
}
