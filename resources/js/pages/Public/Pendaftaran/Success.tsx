import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    pendaftaran: {
        id: number;
        nama: string;
        status: 'menunggu' | 'diterima' | 'ditolak' | 'dibatalkan';
        start_date: string;
        assigned_room?: {
            room_number: string;
            type_kamar?: {
                id: number;
                nama: string;
                harga: number;
            };
        } | null;
        calon_penghuni?: {
            user_id: number;
        } | null;
        kos: {
            name: string;
            address: string;
        };
        created_at: string;
    };
    generatedUser?: {
        username: string;
        email: string;
        password: string;
    } | null;
}

export default function Success({ pendaftaran, generatedUser }: Props) {
    const statusConfig = {
        menunggu: {
            icon: <Clock className="h-10 w-10 text-yellow-500" />,
            bgIcon: 'bg-yellow-100 dark:bg-yellow-900/30',
            title: 'Pendaftaran Berhasil Dikirim!',
            badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            badgeText: 'Menunggu Persetujuan',
        },
        diterima: {
            icon: <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />,
            bgIcon: 'bg-green-100 dark:bg-green-900/30',
            title: 'Pendaftaran Diterima!',
            badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            badgeText: 'Diterima',
        },
        ditolak: {
            icon: <XCircle className="h-10 w-10 text-red-500" />,
            bgIcon: 'bg-red-100 dark:bg-red-900/30',
            title: 'Pendaftaran Ditolak',
            badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            badgeText: 'Ditolak',
        },
        dibatalkan: {
            icon: <XCircle className="h-10 w-10 text-gray-500" />,
            bgIcon: 'bg-gray-100 dark:bg-gray-900/30',
            title: 'Pendaftaran Dibatalkan',
            badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            badgeText: 'Dibatalkan',
        },
    };

    const config = statusConfig[pendaftaran.status];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={config.title} />

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center pb-2">
                        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.bgIcon}`}>
                            {config.icon}
                        </div>
                        <CardTitle className="text-2xl">{config.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center text-gray-600 dark:text-gray-400">
                            {pendaftaran.status === 'menunggu' && (
                                <p>Terima kasih, <strong>{pendaftaran.nama}</strong>. Pendaftaran Anda telah kami terima dan sedang menunggu persetujuan pemilik kos.</p>
                            )}
                            {pendaftaran.status === 'diterima' && (
                                <p>Selamat, <strong>{pendaftaran.nama}</strong>! Pendaftaran Anda telah disetujui oleh pemilik kos.</p>
                            )}
                            {pendaftaran.status === 'ditolak' && (
                                <p>Maaf, <strong>{pendaftaran.nama}</strong>. Pendaftaran Anda tidak dapat disetujui saat ini.</p>
                            )}
                            {pendaftaran.status === 'dibatalkan' && (
                                <p>Pendaftaran atas nama <strong>{pendaftaran.nama}</strong> telah dibatalkan.</p>
                            )}
                        </div>

                        {/* Info Pendaftaran */}
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Detail Pendaftaran
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">No. Pendaftaran</p>
                                    <p className="font-medium">#{pendaftaran.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Kos</p>
                                    <p className="font-medium">{pendaftaran.kos?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Rencana Tanggal Masuk</p>
                                    <p className="font-medium">
                                        {new Date(pendaftaran.start_date).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}>
                                        {config.badgeText}
                                    </span>
                                </div>
                                {pendaftaran.assigned_room && (
                                    <>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Kamar</p>
                                            <p className="font-medium">Kamar {pendaftaran.assigned_room.room_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Harga/Bulan</p>
                                            <p className="font-medium">Rp{Number(pendaftaran.assigned_room.type_kamar?.harga || 0).toLocaleString()}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info Akun — hanya jika diterima */}
                        {pendaftaran.status === 'diterima' && generatedUser && (
                            <div className="rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    <h3 className="font-semibold text-green-800 dark:text-green-200">Informasi Akun Anda</h3>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Gunakan informasi berikut untuk login ke sistem.
                                </p>
                                <div className="grid gap-1 text-sm">
                                    <div className="rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                        <span className="text-gray-500">Username:</span> <strong>{generatedUser.username}</strong>
                                    </div>
                                    <div className="rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                        <span className="text-gray-500">Email:</span> <strong>{generatedUser.email}</strong>
                                    </div>
                                    <div className="rounded-md bg-white dark:bg-gray-800 px-3 py-2">
                                        <span className="text-gray-500">Password:</span> <strong>{generatedUser.password}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Langkah Selanjutnya — hanya jika menunggu */}
                        {pendaftaran.status === 'menunggu' && (
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Langkah Selanjutnya</h3>
                                <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>Pemilik kos akan mereview data pendaftaran Anda.</li>
                                    <li>Jika disetujui, Anda akan ditempatkan pada kamar yang tersedia.</li>
                                    <li>Sistem akan membuat akun (<strong>username</strong>, <strong>email</strong>, dan <strong>password</strong>) untuk Anda.</li>
                                    <li>Hubungi pemilik kos untuk mendapatkan informasi akun Anda.</li>
                                </ol>
                            </div>
                        )}

                        <div className="flex justify-center pt-2">
                            <Link href="/">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali ke Beranda
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
