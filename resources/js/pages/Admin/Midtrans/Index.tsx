import { Head, router, useForm } from '@inertiajs/react';
import { CreditCard, Save, ShieldCheck, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kos } from '@/types';
import { toast } from 'sonner';

interface Props {
    kos: Kos[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pengaturan Midtrans',
        href: '/admin/midtrans',
    },
];

export default function Index({ kos }: Props) {
    const handleUpdate = (kosId: number, serverKey: string, clientKey: string) => {
        router.patch(`/admin/midtrans/${kosId}`, {
            midtrans_server_key: serverKey,
            midtrans_client_key: clientKey,
        }, {
            onSuccess: () => toast.success('Berhasil memperbarui pengaturan.'),
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Midtrans" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan Pembayaran Midtrans</h1>
                    <p className="text-muted-foreground">
                        Kelola akun Midtrans untuk setiap unit kos Anda agar pembayaran sewa langsung masuk ke akun Anda.
                    </p>
                </div>

                <div className="grid gap-6">
                    <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="h-3 w-3" /> Rekomendasi Sistem Pembayaran
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">Pendaftaran Akun Midtrans</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Untuk mulai menerima pembayaran sewa secara otomatis, Anda perlu mendaftarkan akun di Midtrans.
                                        Sistem kami akan menggunakan API Key Anda untuk memproses transaksi secara aman dan transparan.
                                    </p>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20" asChild>
                                            <a href="https://dashboard.midtrans.com/register" target="_blank" rel="noreferrer">
                                                Daftar Akun Sekarang <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="outline" size="lg" className="bg-white" asChild>
                                            <a href="https://dashboard.midtrans.com/" target="_blank" rel="noreferrer">
                                                Masuk ke Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900/50">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-primary" /> Langkah Aktivasi:
                                    </h4>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex gap-3 items-start">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold dark:bg-slate-800">1</span>
                                            Daftar akun di website resmi Midtrans.
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold dark:bg-slate-800">2</span>
                                            Verifikasi identitas bisnis/pribadi.
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold dark:bg-slate-800">3</span>
                                            Salin <b>Server Key</b> & <b>Client Key</b> dari menu <i>Settings</i>.
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold dark:bg-slate-800">4</span>
                                            Simpan Keys tersebut pada formulir di bawah ini.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {kos.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">Belum ada unit kos</h3>
                                <p className="text-muted-foreground">Silakan tambahkan unit kos terlebih dahulu untuk mengatur pembayaran.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {kos.map((item) => (
                                <KosSettingsCard key={item.id} item={item} onUpdate={handleUpdate} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function KosSettingsCard({ item, onUpdate }: { item: Kos; onUpdate: (id: number, sk: string, ck: string) => void }) {
    const { data, setData, processing } = useForm({
        serverKey: item.midtrans_server_key || '',
        clientKey: item.midtrans_client_key || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(item.id, data.serverKey, data.clientKey);
    };

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.address}</CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <CreditCard className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`sk-${item.id}`} className="flex items-center gap-2">
                            Server Key
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        </Label>
                        <Input
                            id={`sk-${item.id}`}
                            value={data.serverKey}
                            onChange={(e) => setData('serverKey', e.target.value)}
                            placeholder="SB-Mid-server-..."
                            type="password"
                        />
                        <p className="text-[10px] text-muted-foreground italic">Gunakan Prefix SB- untuk Sandbox atau Production Server Key.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`ck-${item.id}`}>Client Key</Label>
                        <Input
                            id={`ck-${item.id}`}
                            value={data.clientKey}
                            onChange={(e) => setData('clientKey', e.target.value)}
                            placeholder="SB-Mid-client-..."
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Data dienkripsi saat transit
                        </p>
                        <Button type="submit" disabled={processing} className="min-w-[120px]">
                            {processing ? 'Menyimpan...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Simpan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
