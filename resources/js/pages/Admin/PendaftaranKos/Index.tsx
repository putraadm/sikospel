import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pendaftar',
        href: '/admin/pendaftaran-kos',
    },
];

interface PendaftaranKos {
    id: number;
    status: 'menunggu' | 'diterima' | 'ditolak' | 'dibatalkan';
    kos: {
        name: string;
        address: string;
    };
    calonPenghuni: {
        name: string;
        no_wa: string;
    };
    preferredRoom?: {
        room_number: string;
        monthly_rate: number;
    };
    created_at: string;
}

interface Props {
    pendaftaranKos: PendaftaranKos[];
}

export default function Index({ pendaftaranKos }: Props) {
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

    const columns: ColumnDef<PendaftaranKos>[] = [
        {
            accessorKey: 'calonPenghuni.name',
            header: 'Nama Calon Penghuni',
            cell: ({ row }) => <div className="font-medium">{row.original.calonPenghuni.name}</div>,
        },
        {
            accessorKey: 'calonPenghuni.no_wa',
            header: 'No. WhatsApp',
            cell: ({ row }) => <div>{row.original.calonPenghuni.no_wa}</div>,
        },
        {
            accessorKey: 'kos.name',
            header: 'Kos',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.kos.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.kos.address}</div>
                </div>
            ),
        },
        {
            accessorKey: 'preferredRoom',
            header: 'Kamar Pilihan',
            cell: ({ row }) => {
                const room = row.original.preferredRoom;
                return room ? (
                    <div>
                        <div className="font-medium">Kamar {room.room_number}</div>
                        <div className="text-sm text-muted-foreground">
                            Rp{room.monthly_rate.toLocaleString()}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Daftar',
            cell: ({ row }) => {
                const date = new Date(row.getValue('created_at'));
                return <div>{date.toLocaleDateString('id-ID')}</div>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.getValue('status')),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const pendaftaran = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/pendaftaran-kos/${pendaftaran.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pendaftaran Kos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Kelola Pendaftaran Kos</h1>
                        <p className="text-[#706f6c] dark:text-[#A1A09A]">
                            Kelola pendaftaran calon penghuni kos yang masuk
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                    <DataTable
                        columns={columns}
                        data={pendaftaranKos}
                        headerAction={<div />}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
