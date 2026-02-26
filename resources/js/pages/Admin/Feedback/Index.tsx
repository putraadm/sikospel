import { Head } from '@inertiajs/react';
import { MessageSquare, Calendar, User, Home, CreditCard } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kritik & Saran', href: '/admin/feedback' },
];

interface Feedback {
    id: number;
    feedback: string;
    payment_date: string;
    amount_paid: string;
    invoice: {
        tenancy: {
            penghuni: {
                name: string;
            };
            room: {
                room_number: string;
                kos: {
                    name: string;
                };
            };
        };
    };
}

interface Props {
    feedbacks: Feedback[];
}

export default function Index({ feedbacks }: Props) {
    const columns: ColumnDef<Feedback>[] = [
        {
            accessorKey: 'payment_date',
            header: 'Tanggal',
            cell: ({ row }) => {
                const date = new Date(row.original.payment_date);
                return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                );
            },
        },
        {
            id: 'penghuni',
            header: 'Penghuni',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                            <User className="h-4 w-4 text-[#664229]" />
                            {item.invoice.tenancy.penghuni.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Home className="h-3 w-3" />
                            {item.invoice.tenancy.room.kos.name} - Kamar {item.invoice.tenancy.room.room_number}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'feedback',
            header: 'Isi Kritik & Saran',
            cell: ({ row }) => (
                <div className="max-w-md bg-muted/30 p-3 rounded-lg border border-border/50 italic text-sm text-gray-700 dark:text-gray-300">
                    "{row.original.feedback}"
                </div>
            ),
        },
        // {
        //     id: 'status',
        //     header: 'Status',
        //     cell: () => (
        //         <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
        //             Selesai
        //         </Badge>
        //     ),
        // }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kritik & Saran" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-x-hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Kritik & Saran</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Daftar masukan dari penghuni saat melakukan pembayaran.
                        </p>
                    </div>
                </div>

                <Card className="border-sidebar-border/70 shadow-sm overflow-hidden">
                    <CardHeader className="bg-[#664229]/5 border-b border-[#664229]/10">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#664229]">
                            <MessageSquare className="h-4 w-4" />
                            Masukan Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns}
                            data={feedbacks}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
