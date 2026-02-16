import { Head, useForm, Link } from '@inertiajs/react';
import { Calendar, Building2, Save, Info, DoorOpen, Banknote, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Tagihan',
        href: '/admin/tagihan',
    },
    {
        title: 'Tambah Pengaturan',
        href: '#',
    },
];

interface Kos {
    id: number;
    name: string;
    address: string;
}

interface TypeKamar {
    id: number;
    nama: string;
    harga: number;
}

interface Room {
    id: number;
    kos_id: number;
    room_number: string;
    capacity: number;
    status: string;
    billing_date?: number | null;
    type_kamar?: TypeKamar;
}

interface Props {
    kos: Kos[];
    rooms: Room[];
    room?: Room; // For edit mode
}

export default function Create({ kos = [], rooms = [], room: editingRoom }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        kos_id: editingRoom?.kos_id?.toString() || '',
        room_id: editingRoom?.id?.toString() || '',
        billing_date: editingRoom?.billing_date?.toString() || '',
        monthly_price: editingRoom?.type_kamar?.harga?.toString() || '0',
    });

    // Filter rooms based on selected kos
    const filteredRooms = useMemo(() => {
        if (!data.kos_id) return [];
        return rooms.filter(room => room.kos_id === parseInt(data.kos_id));
    }, [data.kos_id, rooms]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/tagihan');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengaturan Tagihan" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/tagihan">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {editingRoom ? 'Edit Pengaturan Tagihan' : 'Tambah Pengaturan Tagihan'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Atur tanggal tagihan bulanan untuk kos Anda
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 shadow-sm border border-gray-100">
                        <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#664229]/10 rounded-full">
                                    <Calendar className="h-5 w-5 text-[#664229]" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        Konfigurasi Tagihan
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        Pilih kos, kamar, tentukan harga dan tanggal tagihan
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kos_id" className="text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-[#664229]" />
                                            Pilih Kos
                                        </div>
                                    </Label>
                                    <Select
                                        value={data.kos_id}
                                        onValueChange={(value) => {
                                            setData('kos_id', value);
                                            setData('room_id', '');
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih kos yang ingin diatur" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kos.map((k) => (
                                                <SelectItem key={k.id} value={k.id.toString()}>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-medium">{k.name}</span>
                                                        <span className="text-xs text-muted-foreground">{k.address}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.kos_id && <p className="text-sm text-red-600">{errors.kos_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="room_id" className="text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <DoorOpen className="h-4 w-4 text-[#664229]" />
                                            Pilih Kamar
                                        </div>
                                    </Label>
                                    <Select
                                        value={data.room_id}
                                        onValueChange={(value) => {
                                            const room = rooms.find(r => r.id.toString() === value);
                                            if (room) {
                                                setData(data => ({
                                                    ...data,
                                                    room_id: value,
                                                    monthly_price: room.type_kamar?.harga.toString() || '0',
                                                    billing_date: room.billing_date?.toString() || ''
                                                }));
                                            } else {
                                                setData('room_id', value);
                                            }
                                        }}
                                        disabled={!data.kos_id}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={!data.kos_id ? "Pilih kos terlebih dahulu" : "Pilih kamar"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredRooms.map((room) => (
                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                    Kamar {room.room_number} ({room.type_kamar?.nama || 'No Type'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.room_id && <p className="text-sm text-red-600">{errors.room_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="monthly_price" className="text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4 text-[#664229]" />
                                            Harga Per Bulan
                                        </div>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                        <Input
                                            id="monthly_price"
                                            value={data.monthly_price}
                                            className="pl-12 bg-gray-50"
                                            readOnly
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Harga otomatis diambil dari tipe kamar</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_date" className="text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-[#664229]" />
                                            Tanggal Tagihan Bulanan
                                        </div>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="billing_date"
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={data.billing_date}
                                            onChange={(e) => setData('billing_date', e.target.value)}
                                            placeholder="Masukkan tanggal (1-31)"
                                            className="pr-16"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/ Bulan</span>
                                    </div>
                                    {errors.billing_date && <p className="text-sm text-red-600">{errors.billing_date}</p>}
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t font-medium">
                                    <Link href="/admin/tagihan">
                                        <Button type="button" variant="outline">Batal</Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing || !data.room_id || !data.billing_date}
                                        className="bg-[#664229] hover:bg-[#664229]/90 text-white"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-amber-100 bg-amber-50/30">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-[#664229]/10 rounded-full">
                                    <Info className="h-4 w-4 text-[#664229]" />
                                </div>
                                <CardTitle className="text-base font-semibold text-gray-800">Informasi</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-800">Tentang Tanggal Tagihan</h4>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    Tanggal tagihan adalah hari dalam sebulan ketika sewa kos jatuh tempo dan harus dibayarkan oleh penghuni.
                                </p>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-800">Catatan Penting</h4>
                                <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed">
                                    <li>Pilih tanggal yang konsisten setiap bulan</li>
                                    <li>Pertimbangkan tanggal gajian penghuni</li>
                                    <li>Tanggal 1-28 berlaku untuk semua bulan</li>
                                    <li>Tanggal 29-31 disesuaikan dengan jumlah hari dalam bulan</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
