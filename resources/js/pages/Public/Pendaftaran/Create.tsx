import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface FormData {
    nama: string;
    no_wa: string;
    alamat: string;
    agama: string;
    file_ktp: File | null;
    file_kk: File | null;
    kos_id: string;
    start_date: string;
    notes: string;
}

interface Room {
    id: number;
    room_number: string;
    type_kamar?: {
        id: number;
        nama: string;
        harga: number;
    };
    status: string;
}

interface Kos {
    id: number;
    name: string;
    address: string;
    rooms: Room[];
}

interface Props {
    kosList: Kos[];
    selectedKos: Kos | null;
}

export default function Create({ kosList, selectedKos }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        nama: '',
        no_wa: '',
        alamat: '',
        agama: '',
        file_ktp: null,
        file_kk: null,
        kos_id: selectedKos ? selectedKos.id.toString() : '',
        start_date: '',
        notes: '',
    });

    // Info ketersediaan kamar
    const selectedKosData = data.kos_id ? kosList.find(k => k.id.toString() === data.kos_id) : null;
    const availableRoomCount = selectedKosData
        ? selectedKosData.rooms.filter(r => r.status === 'tersedia').length
        : 0;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/pendaftaran-kos', {
            forceFormData: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Pendaftaran Kos" />

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Formulir Pendaftaran Kos</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Silakan lengkapi data diri Anda untuk mengajukan permohonan sewa.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Pendaftaran</CardTitle>
                        <CardDescription>
                            Mohon isi data dengan sebenar-benarnya. Setelah pendaftaran disetujui oleh pemilik kos, Anda akan mendapatkan akun untuk mengakses sistem.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">

                            {/* Section 1: Data Pribadi */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">1. Data Pribadi</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nama">Nama Lengkap (Sesuai KTP)</Label>
                                        <Input
                                            id="nama"
                                            value={data.nama}
                                            onChange={(e) => setData('nama', e.target.value)}
                                            required
                                        />
                                        {errors.nama && <p className="text-sm text-red-600">{errors.nama}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="no_wa">No. WhatsApp</Label>
                                        <Input
                                            id="no_wa"
                                            value={data.no_wa}
                                            onChange={(e) => setData('no_wa', e.target.value)}
                                            required
                                            placeholder="08xxxxxxxxxx"
                                        />
                                        {errors.no_wa && <p className="text-sm text-red-600">{errors.no_wa}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="alamat">Alamat Asal (Sesuai KTP)</Label>
                                        <Textarea
                                            id="alamat"
                                            value={data.alamat}
                                            onChange={(e) => setData('alamat', e.target.value)}
                                            required
                                        />
                                        {errors.alamat && <p className="text-sm text-red-600">{errors.alamat}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="agama">Agama</Label>
                                        <Select value={data.agama} onValueChange={(val) => setData('agama', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Agama" />
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
                                        {errors.agama && <p className="text-sm text-red-600">{errors.agama}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="file_ktp">Upload KTP (Max 2MB)</Label>
                                        <Input
                                            id="file_ktp"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setData('file_ktp', e.target.files ? e.target.files[0] : null)}
                                            required
                                        />
                                        {errors.file_ktp && <p className="text-sm text-red-600">{errors.file_ktp}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="file_kk">Upload Kartu Keluarga (Max 2MB)</Label>
                                        <Input
                                            id="file_kk"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setData('file_kk', e.target.files ? e.target.files[0] : null)}
                                            required
                                        />
                                        {errors.file_kk && <p className="text-sm text-red-600">{errors.file_kk}</p>}
                                    </div>
                                </div>
                                <Separator />
                            </div>

                            {/* Section 2: Pilihan Kos */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">2. Pilihan Kos</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <Label htmlFor="kos_id">Pilih Kos</Label>
                                        <Select value={data.kos_id} onValueChange={(val) => setData('kos_id', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Lokasi Kos" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kosList.map((kos) => (
                                                    <SelectItem key={kos.id} value={kos.id.toString()}>
                                                        {kos.name} - {kos.address}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.kos_id && <p className="text-sm text-red-600">{errors.kos_id}</p>}
                                    </div>

                                    {selectedKosData && (
                                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm">
                                            <p className="font-medium text-blue-800 dark:text-blue-200">
                                                Kamar tersedia: {availableRoomCount} kamar
                                            </p>
                                            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
                                                Kamar akan ditentukan oleh pemilik kos setelah pendaftaran disetujui.
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="start_date">Rencana Tanggal Masuk</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            required
                                        />
                                        {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Catatan Tambahan</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Contoh: Saya bawa motor, butuh parkir."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="w-full md:w-auto" disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Kirim Pendaftaran'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
