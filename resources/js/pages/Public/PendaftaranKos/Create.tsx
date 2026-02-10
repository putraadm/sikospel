import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/main-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/',
    },
    {
        title: 'Pendaftaran Kos',
        href: '/pendaftaran-kos',
    },
];

interface Kos {
    id: number;
    name: string;
    address: string;
    rooms: {
        id: number;
        room_number: string;
        monthly_rate: number;
        status: string;
    }[];
}

interface Props {
    kos: Kos[];
}

export default function Create({ kos }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        kos_id: '',
        preferred_room_id: '',
        name: '',
        address: '',
        religion: '',
        no_wa: '',
        file_ktp: null as File | null,
        file_kk: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pendaftaran-kos', {
            forceFormData: true,
        });
    };

    const selectedKos = kos.find(k => k.id.toString() === data.kos_id);
    const availableRooms = selectedKos?.rooms.filter(room => room.status === 'tersedia') || [];

    return (
        <MainLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran Kos" />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Pendaftaran Kos
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Isi formulir berikut untuk mendaftar sebagai penghuni kos
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Formulir Pendaftaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Pilih Kos */}
                                <div>
                                    <Label htmlFor="kos_id">Pilih Kos</Label>
                                    <Select value={data.kos_id} onValueChange={(value) => setData('kos_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kos yang diinginkan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kos.map((k) => (
                                                <SelectItem key={k.id} value={k.id.toString()}>
                                                    {k.name} - {k.address}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.kos_id && <p className="text-sm text-red-600 mt-1">{errors.kos_id}</p>}
                                </div>

                                {/* Pilih Kamar (Opsional) */}
                                {selectedKos && availableRooms.length > 0 && (
                                    <div>
                                        <Label htmlFor="preferred_room_id">Pilih Kamar (Opsional)</Label>
                                        <Select value={data.preferred_room_id} onValueChange={(value) => setData('preferred_room_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kamar pilihan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.map((room) => (
                                                    <SelectItem key={room.id} value={room.id.toString()}>
                                                        Kamar {room.room_number} - Rp{room.monthly_rate.toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.preferred_room_id && <p className="text-sm text-red-600 mt-1">{errors.preferred_room_id}</p>}
                                    </div>
                                )}

                                {/* Data Pribadi */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="no_wa">No. WhatsApp</Label>
                                        <Input
                                            id="no_wa"
                                            type="text"
                                            value={data.no_wa}
                                            onChange={(e) => setData('no_wa', e.target.value)}
                                            required
                                        />
                                        {errors.no_wa && <p className="text-sm text-red-600 mt-1">{errors.no_wa}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">Alamat Lengkap</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    />
                                    {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="religion">Agama</Label>
                                    <Select value={data.religion} onValueChange={(value) => setData('religion', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih agama" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Islam">Islam</SelectItem>
                                            <SelectItem value="Kristen">Kristen</SelectItem>
                                            <SelectItem value="Katolik">Katolik</SelectItem>
                                            <SelectItem value="Hindu">Hindu</SelectItem>
                                            <SelectItem value="Buddha">Buddha</SelectItem>
                                            <SelectItem value="Konghucu">Konghucu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.religion && <p className="text-sm text-red-600 mt-1">{errors.religion}</p>}
                                </div>

                                {/* Upload Files */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="file_ktp">Upload KTP</Label>
                                        <Input
                                            id="file_ktp"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => setData('file_ktp', e.target.files?.[0] || null)}
                                            required
                                        />
                                        {errors.file_ktp && <p className="text-sm text-red-600 mt-1">{errors.file_ktp}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF. Max: 2MB</p>
                                    </div>
                                    <div>
                                        <Label htmlFor="file_kk">Upload KK</Label>
                                        <Input
                                            id="file_kk"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => setData('file_kk', e.target.files?.[0] || null)}
                                            required
                                        />
                                        {errors.file_kk && <p className="text-sm text-red-600 mt-1">{errors.file_kk}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF. Max: 2MB</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                        {processing ? 'Mengirim...' : 'Kirim Pendaftaran'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
