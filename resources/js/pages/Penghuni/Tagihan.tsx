import { Head } from '@inertiajs/react';
import { CreditCard, Calendar, AlertTriangle, CheckCircle, Clock, Loader2, FileText, ShieldCheck, Receipt, ArrowRight, Home } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { usePage, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Tagihan', href: '/penghuni/tagihan' },
];

interface InvoiceData {
    id: number;
    tenancy_id: number;
    amount: string;
    due_date: string;
    billing_period: string;
    status: 'belum_dibayar' | 'lunas' | 'terlambat';
    tenancy: {
        room: {
            room_number: string;
            kos: {
                name: string;
            };
        };
    };
    payments?: {
        id: number;
        status: string;
        feedback?: string;
        admin_response?: string;
    }[];
}

interface Props {
    invoices: InvoiceData[];
    midtrans_client_key: string;
    midtrans_is_production: boolean;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function Tagihan({ invoices, midtrans_client_key, midtrans_is_production }: Props) {
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const paymentStatus = queryParams.get('payment_status');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (paymentStatus === 'success') {
            setShowSuccessDialog(true);
            const newUrl = url.split('?')[0];
            router.visit(newUrl, { replace: true, preserveState: true, preserveScroll: true });
        }
    }, [paymentStatus, url]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const formatPeriod = (dateString: string) =>
        new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const statusConfig = {
        belum_dibayar: {
            label: 'BELUM DIBAYAR',
            icon: <Clock className="h-3 w-3" />,
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
            borderClass: 'border-l-amber-500',
        },
        lunas: {
            label: 'LUNAS',
            icon: <CheckCircle className="h-3 w-3" />,
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            borderClass: 'border-l-emerald-500',
        },
        terlambat: {
            label: 'TERLAMBAT',
            icon: <AlertTriangle className="h-3 w-3" />,
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
            borderClass: 'border-l-rose-500',
        },
    };

    const [loadingInvoiceId, setLoadingInvoiceId] = useState<number | null>(null);
    const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});

    const handleFeedbackChange = (invoiceId: number, value: string) => {
        setFeedbacks(prev => ({ ...prev, [invoiceId]: value }));
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = midtrans_is_production
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', midtrans_client_key);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [midtrans_client_key]);

    const handlePayment = async (invoiceId: number) => {
        setLoadingInvoiceId(invoiceId);
        try {
            const response = await axios.post('/payment/token', {
                invoice_id: invoiceId,
                feedback: feedbacks[invoiceId] || '',
            });

            const snapToken = response.data.snap_token;

            window.snap.pay(snapToken, {
                onSuccess: async function (result: any) {
                    try {
                        await axios.post('/payment/status', { order_id: result.order_id });
                    } catch (e) {
                        console.error('Manual status sync failed:', e);
                    }
                    toast.success('Pembayaran berhasil!');
                    window.location.reload();
                },
                onPending: async function (result: any) {
                    try {
                        await axios.post('/payment/status', { order_id: result.order_id });
                    } catch (e) {
                        console.error('Manual status sync failed:', e);
                    }
                    toast.info('Menunggu pembayaran...');
                },
                onError: function (result: any) {
                    toast.error('Pembayaran gagal!');
                },
                onClose: function () {
                    toast.warning('Pembayaran dibatalkan.');
                }
            });
        } catch (error: any) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat memulai pembayaran.');
        } finally {
            setLoadingInvoiceId(null);
        }
    };

    const handlePrintReceipt = (paymentId: number) => {
        window.open(`/payment/receipt/${paymentId}`, '_blank');
    };

    const belumDibayar = invoices.filter(i => i.status === 'belum_dibayar' || i.status === 'terlambat');
    const lunas = invoices.filter(i => i.status === 'lunas');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tagihan Saya" />
            <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 bg-[#fafafa]">

                {/* Formal Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#664229] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                            <ShieldCheck size={14} /> Administrasi Keuangan
                        </div>
                        <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                            Laporan <span className="font-semibold text-[#664229]">Tagihan Saya</span>
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">Daftar kewajiban pembayaran dan riwayat transaksi resmi.</p>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-amber-500"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Terbayar</span>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{belumDibayar.length}</h3>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <Clock className="text-slate-400" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-emerald-500"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaksi Lunas</span>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{lunas.length}</h3>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="text-slate-400" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-stretch h-32">
                                <div className="w-1.5 bg-[#664229]"></div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoice</span>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tighter">{invoices.length}</h3>
                                </div>
                                <div className="p-6 flex items-center">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <Receipt className="text-slate-400" size={24} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Daftar Tagihan</h2>
                        <div className="w-full h-[1px] bg-slate-200"></div>
                    </div>

                    {invoices.length > 0 ? (
                        <div className="space-y-4">
                            {invoices.map((invoice) => {
                                const config = statusConfig[invoice.status];
                                return (
                                    <Card key={invoice.id} className="border-none shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden transition-all hover:ring-[#664229]/20">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                                {/* Left: Info */}
                                                <div className="flex-1 p-8">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black text-[#664229] uppercase tracking-widest leading-none mb-1">Periode Penagihan</p>
                                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                                                Tagihan {formatPeriod(invoice.billing_period)}
                                                            </h3>
                                                        </div>
                                                        <Badge variant="outline" className={`rounded-md px-3 py-1 font-black text-[9px] tracking-[0.1em] border ${config.badgeClass} flex items-center gap-1.5 h-fit whitespace-nowrap`}>
                                                            {config.icon}
                                                            {config.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-slate-50 flex items-center justify-center rounded-lg text-slate-300">
                                                                <Calendar size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Jatuh Tempo</p>
                                                                <p className="text-sm font-bold text-slate-700">{formatDate(invoice.due_date)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-slate-50 flex items-center justify-center rounded-lg text-slate-300">
                                                                <Home size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Unit Hunian</p>
                                                                <p className="text-sm font-bold text-slate-700">{invoice.tenancy?.room?.room_number} - {invoice.tenancy?.room?.kos?.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="w-full lg:w-80 p-8 bg-slate-50/50 flex flex-col justify-center items-center lg:items-end text-center lg:text-right gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Kewajiban</p>
                                                        <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                                            {formatCurrency(Number(invoice.amount))}
                                                        </p>
                                                    </div>

                                                    <div className="w-full space-y-3">
                                                        {invoice.status === 'lunas' && invoice.payments && invoice.payments.length > 0 && (
                                                            <div className="space-y-4 w-full">
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full border-[#664229] text-[#664229] hover:bg-[#664229] hover:text-white rounded-lg font-bold text-xs py-5 transition-all"
                                                                    onClick={() => handlePrintReceipt(invoice.payments![0].id)}
                                                                >
                                                                    <FileText className="h-4 w-4 mr-2" />
                                                                    CETAK BUKTI BAYAR
                                                                </Button>

                                                                {invoice.payments[0].feedback && (
                                                                    <div className="text-left bg-white p-4 rounded-lg border border-slate-200 mt-4 space-y-3">
                                                                        <div>
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                                                Saran Anda
                                                                            </p>
                                                                            <p className="text-sm text-slate-700 italic">
                                                                                "{invoice.payments[0].feedback}"
                                                                            </p>
                                                                        </div>
                                                                        {invoice.payments[0].admin_response && (
                                                                            <div className="pt-3 border-t border-slate-100">
                                                                                <p className="text-[10px] font-black text-[#664229] uppercase tracking-widest leading-none mb-1 flex items-center gap-1">
                                                                                    <ShieldCheck size={12} /> Tanggapan Admin
                                                                                </p>
                                                                                <p className="text-sm text-slate-700 bg-[#664229]/5 p-2 rounded-md">
                                                                                    {invoice.payments[0].admin_response}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {(invoice.status === 'belum_dibayar' || invoice.status === 'terlambat') && (
                                                            <div className="space-y-4 w-full">
                                                                <div className="space-y-2 text-left">
                                                                    <Label htmlFor={`feedback-${invoice.id}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                                        Lampiran Saran (Opsional)
                                                                    </Label>
                                                                    <Textarea
                                                                        id={`feedback-${invoice.id}`}
                                                                        placeholder="Tambahkan catatan untuk manajemen..."
                                                                        className="text-xs min-h-[80px] border-slate-200 focus:ring-[#664229]/20 focus:border-[#664229] rounded-lg"
                                                                        value={feedbacks[invoice.id] || ''}
                                                                        onChange={(e) => handleFeedbackChange(invoice.id, e.target.value)}
                                                                        maxLength={255}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    className="w-full bg-[#664229] hover:bg-[#4d321f] text-white rounded-lg font-bold text-xs py-5 shadow-lg shadow-[#664229]/20 transition-all flex items-center justify-center gap-2 group"
                                                                    onClick={() => handlePayment(invoice.id)}
                                                                    disabled={loadingInvoiceId === invoice.id}
                                                                >
                                                                    {loadingInvoiceId === invoice.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <CreditCard className="h-4 w-4" />
                                                                            BAYAR SEKARANG
                                                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm ring-1 ring-slate-100 bg-white rounded-2xl overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 flex items-center justify-center rounded-full mb-6 text-slate-200">
                                    <Receipt size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 whitespace-nowrap uppercase tracking-tighter">Aktivitas Tagihan Nihil</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Seluruh catatan tagihan akan otomatis muncul di sini setelah divalidasi oleh sistem administrasi.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-2xl p-0 overflow-hidden">
                    <div className="bg-emerald-500 p-8 flex flex-col items-center justify-center text-white">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Pembayaran Sukses</h2>
                    </div>
                    <div className="p-8 text-center space-y-6">
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Terima kasih. Dana Anda telah kami terima melalui saluran pembayaran resmi.
                            Status tagihan akan diperbarui secara otomatis di sistem kami dalam waktu dekat.
                        </p>
                        <Button
                            type="button"
                            className="w-full bg-[#664229] hover:bg-[#4d321f] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#664229]/20"
                            onClick={() => setShowSuccessDialog(false)}
                        >
                            KEMBALI KE PENAGIHAN
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
