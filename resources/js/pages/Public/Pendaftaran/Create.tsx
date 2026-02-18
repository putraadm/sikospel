import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/main-layout';
import { type BreadcrumbItem } from '@/types';
import { User, MapPin, Phone, CreditCard, Home, CheckCircle2, FileText, Sparkles, Building2, Shield, Search, ArrowRight, ArrowDown, Info, Gem, Trophy, Star, Crown, Activity, Calendar, Notebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogoIcon from '@/components/app-logo-icon';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ColorBends from '@/components/ui/color-bends';
import TextType from '@/components/ui/text-type';
import { Badge } from '@/components/ui/badge';

gsap.registerPlugin(ScrollTrigger);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Beranda', href: '/' },
    { title: 'Pendaftaran Kos', href: '/pendaftaran-kos' },
];

interface Kos {
    id: number;
    name: string;
    address: string;
    rooms: {
        id: number;
        room_number: string;
        type_kamar?: {
            id: number;
            nama: string;
            harga: number;
        };
        status: string;
    }[];
}

interface Props {
    kosList: Kos[];
    selectedKos?: Kos | null;
}

export default function Create({ kosList, selectedKos: initialSelectedKos }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        kos_id: initialSelectedKos ? initialSelectedKos.id.toString() : '',
        preferred_room_id: '',
        nama: '',
        alamat: '',
        agama: '',
        no_wa: '',
        file_ktp: null as File | null,
        file_kk: null as File | null,
        start_date: '',
        notes: '',
    });

    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!formRef.current) return;

        const ctx = gsap.context(() => {
            // Enhanced Hero Animations
            const tl = gsap.timeline();

            tl.from('.hero-badge', {
                y: -20,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            })
                .from('.hero-title > *', {
                    y: 50,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: 'power4.out'
                }, '-=0.5')
                .from('.hero-floating-card', {
                    y: 20,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.2,
                    ease: 'back.out(1.7)'
                }, '-=0.8')
                .from('.hero-description', {
                    y: 20,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out'
                }, '-=0.8')
                .from('.hero-scroll', {
                    y: -10,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                }, '-=0.5');

            // Floating movement for cards
            gsap.to('.hero-floating-card-left', {
                y: -15,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            gsap.to('.hero-floating-card-right', {
                y: -20,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 1
            });

            gsap.from('.form-step', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.3,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.form-step',
                    start: 'top 80%',
                }
            });

            gsap.from('.sticky-card', {
                scale: 0.95,
                opacity: 0,
                duration: 1.2,
                delay: 0.5,
                ease: 'expo.out'
            });
        }, formRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pendaftaran-kos', {
            forceFormData: true,
        });
    };

    const selectedKos = kosList.find(k => k.id.toString() === data.kos_id);
    const availableRooms = selectedKos?.rooms.filter(room => room.status === 'tersedia') || [];
    const totalAvailableRooms = kosList.reduce((acc, k) => acc + k.rooms.filter(r => r.status === 'tersedia').length, 0);

    return (
        <MainLayout breadcrumbs={breadcrumbs}>
            <Head title="Eksplorasi Hunian Elite - SIKOSPEL" />

            <div ref={formRef} className="min-h-screen bg-[#f8f1ea] dark:bg-[#0d0907] relative overflow-hidden pb-40">
                {/* Dynamic Luxury Background */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <ColorBends
                        colors={['#1e110a', '#3e2717', '#5a3a22', '#8b5e3c', '#c4a484']}
                        speed={0.08}
                        rotation={15}
                        scale={1.5}
                        noise={0.15}
                        transparent={true}
                    />
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/70 backdrop-blur-[100px]"></div>

                    {/* Architectural Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5e3c1a_1px,transparent_1px),linear-gradient(to_bottom,#8b5e3c1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                </div>

                {/* Grainy Texture Overlay */}
                <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="container mx-auto px-4 pt-32 relative z-10">
                    <div className="max-w-[90rem] mx-auto">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                            <div className="lg:col-span-12 xl:col-span-7 space-y-24 relative">
                                <div className="absolute left-8 top-10 bottom-0 w-px bg-gradient-to-b from-[#8b5e3c]/20 via-[#8b5e3c]/10 to-transparent hidden md:block"></div>

                                <div className="form-step relative pl-0 md:pl-24">
                                    <div className="absolute left-0 top-0 hidden md:flex size-16 rounded-2xl bg-[#f8f1ea] dark:bg-[#0d0907] border border-[#8b5e3c]/20 items-center justify-center z-10 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <span className="font-black text-xl text-[#8b5e3c]">01</span>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-5xl font-black text-[#1e110a] dark:text-white tracking-tighter">Profil</h3>
                                            <p className="text-[#3e2717]/60 text-lg max-w-md">Identitas Anda sebagai calon penghuni terhormat.</p>
                                        </div>

                                        <Card className="border-none rounded-[3rem] bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 group ring-1 ring-[#3e2717]/5">
                                            <CardContent className="p-8 md:p-12 space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">Full Name</Label>
                                                        <Input
                                                            value={data.nama}
                                                            onChange={(e) => setData('nama', e.target.value)}
                                                            className="h-20 rounded-[2rem] border-2 border-[#3e2717]/5 bg-white/60 px-8 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all placeholder:text-[#3e2717]/20"
                                                            placeholder="Nama Lengkap"
                                                        />
                                                        {errors.nama && <p className="text-xs font-bold text-red-500 ml-4">{errors.nama}</p>}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">WhatsApp</Label>
                                                        <Input
                                                            value={data.no_wa}
                                                            onChange={(e) => setData('no_wa', e.target.value)}
                                                            className="h-20 rounded-[2rem] border-2 border-[#3e2717]/5 bg-white/60 px-8 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all placeholder:text-[#3e2717]/20"
                                                            placeholder="08xxxxxxxxxx"
                                                        />
                                                        {errors.no_wa && <p className="text-xs font-bold text-red-500 ml-4">{errors.no_wa}</p>}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">Religion</Label>
                                                        <Select value={data.agama} onValueChange={(value) => setData('agama', value)}>
                                                            <SelectTrigger className="h-20 rounded-[2rem] border-2 border-[#3e2717]/5 bg-white/60 px-8 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all">
                                                                <SelectValue placeholder="Pilih Agama" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-[2rem] border-none shadow-xl p-2">
                                                                {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((agama) => (
                                                                    <SelectItem key={agama} value={agama} className="rounded-[1.2rem] py-3 px-6 font-bold">{agama}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.agama && <p className="text-xs font-bold text-red-500 ml-4">{errors.agama}</p>}
                                                    </div>

                                                    <div className="space-y-4 md:col-span-2">
                                                        <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">Address</Label>
                                                        <Textarea
                                                            value={data.alamat}
                                                            onChange={(e) => setData('alamat', e.target.value)}
                                                            className="min-h-[150px] rounded-[2.5rem] border-2 border-[#3e2717]/5 bg-white/60 p-8 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all placeholder:text-[#3e2717]/20 resize-none"
                                                            placeholder="Alamat Lengkap (Jalan, RT/RW, Kelurahan, Kecamatan, Kota)"
                                                        />
                                                        {errors.alamat && <p className="text-xs font-bold text-red-500 ml-4">{errors.alamat}</p>}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="form-step relative pl-0 md:pl-24">
                                    <div className="absolute left-0 top-0 hidden md:flex size-16 rounded-2xl bg-[#f8f1ea] dark:bg-[#0d0907] border border-[#8b5e3c]/20 items-center justify-center z-10 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <span className="font-black text-xl text-[#8b5e3c]">02</span>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-5xl font-black text-[#1e110a] dark:text-white tracking-tighter">Legalitas</h3>
                                            <p className="text-[#3e2717]/60 text-lg max-w-md">Dokumen resmi dan rencana masuk Anda.</p>
                                        </div>

                                        <Card className="border-none rounded-[3rem] bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500 ring-1 ring-[#3e2717]/5">
                                            <CardContent className="p-8 md:p-12 space-y-12">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    {[
                                                        { label: 'KTP', field: 'file_ktp' as const, icon: CreditCard, subtitle: 'Kartu Tanda Penduduk' },
                                                        { label: 'KK', field: 'file_kk' as const, icon: FileText, subtitle: 'Kartu Keluarga' }
                                                    ].map((doc, idx) => (
                                                        <div key={doc.field} className="relative h-[240px] rounded-[2.5rem] border-2 border-dashed border-[#3e2717]/10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#3e2717]/5 transition-colors group/doc">
                                                            <Input
                                                                type="file"
                                                                onChange={(e) => setData(doc.field, e.target.files?.[0] || null)}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-20 h-full w-full"
                                                                accept="image/*,.pdf"
                                                            />

                                                            {data[doc.field] ? (
                                                                <div className="animate-in fade-in zoom-in-75 duration-500 flex flex-col items-center gap-4">
                                                                    <div className="size-16 rounded-full bg-[#3e2717] flex items-center justify-center text-white shadow-lg">
                                                                        <CheckCircle2 className="size-6" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-sm text-[#1e110a] dark:text-white max-w-[150px] truncate">{data[doc.field]?.name}</p>
                                                                        <p className="text-[10px] font-bold text-[#8b5e3c]">READY</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4 flex flex-col items-center">
                                                                    <div className="size-16 rounded-2xl bg-[#f8f1ea] border border-[#3e2717]/10 flex items-center justify-center group-hover/doc:scale-110 transition-transform duration-300">
                                                                        <doc.icon className="size-8 text-[#3e2717]" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-black text-lg text-[#3e2717] dark:text-white">{doc.label}</p>
                                                                        <p className="text-xs font-medium text-[#3e2717]/50">{doc.subtitle}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">Check-in Plan</Label>
                                                    <div className="relative">
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <Calendar className="size-5 text-[#3e2717]/40" />
                                                        </div>
                                                        <Input
                                                            type="date"
                                                            value={data.start_date}
                                                            onChange={(e) => setData('start_date', e.target.value)}
                                                            className="h-20 pl-16 rounded-[2rem] border-2 border-[#3e2717]/5 bg-white/60 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all placeholder:text-[#3e2717]/20"
                                                        />
                                                    </div>
                                                    {errors.start_date && <p className="text-xs font-bold text-red-500 ml-4">{errors.start_date}</p>}
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="text-xs font-black uppercase tracking-[0.3em] text-[#664229]/40 ml-4">Additional Notes</Label>
                                                    <div className="relative">
                                                        <div className="absolute left-6 top-8 pointer-events-none">
                                                            <Notebook className="size-5 text-[#3e2717]/40" />
                                                        </div>
                                                        <Textarea
                                                            value={data.notes}
                                                            onChange={(e) => setData('notes', e.target.value)}
                                                            className="min-h-[120px] pl-16 py-6 rounded-[2.5rem] border-2 border-[#3e2717]/5 bg-white/60 text-lg font-bold focus:ring-4 focus:ring-[#8b5e3c]/5 focus:border-[#8b5e3c]/20 transition-all placeholder:text-[#3e2717]/20 resize-none"
                                                            placeholder="Catatan tambahan (parkir, hewan peliharaan, dll)..."
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Summary - 5 Columns */}
                            <div className="lg:col-span-12 xl:col-span-5 sticky top-10 xl:top-32 z-20 mt-12 xl:mt-0">
                                <div className="sticky-card">
                                    <div className="relative group/summary">
                                        {/* Back Glow */}
                                        <div className="absolute -inset-4 bg-gradient-to-b from-[#3e2717]/20 to-transparent rounded-[4rem] blur-2xl opacity-0 group-hover/summary:opacity-100 transition-opacity duration-700"></div>

                                        <Card className="relative border-none rounded-[4rem] bg-[#1e110a] text-[#f8f1ea] overflow-hidden shadow-2xl ring-1 ring-white/10">
                                            {/* Top Texture */}
                                            <div className="absolute top-0 inset-x-0 h-32 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#8b5e3c] via-[#c4a484] to-[#8b5e3c]"></div>

                                            <CardContent className="p-10 md:p-14 relative z-10 flex flex-col gap-12">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3">
                                                            <AppLogoIcon className="size-full fill-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black uppercase tracking-wider">Sikospel</h4>
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-1.5 bg-[#8b5e3c] rounded-full animate-pulse"></div>
                                                                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Booking Pass</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-8">
                                                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Location</span>
                                                            <p className="text-2xl font-black">{selectedKos?.name || '---'}</p>
                                                        </div>
                                                        <div className="h-px bg-white/5"></div>
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Unit</span>
                                                                <p className="text-3xl font-black text-[#8b5e3c]">
                                                                    {data.preferred_room_id ? `#${availableRooms.find(r => r.id.toString() === data.preferred_room_id)?.room_number}` : '--'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Price/Mo</span>
                                                                <p className="text-xl font-bold">
                                                                    {data.preferred_room_id ? `Rp ${Number(availableRooms.find(r => r.id.toString() === data.preferred_room_id)?.type_kamar?.harga || 0).toLocaleString()}` : 'Rp 0'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        disabled={processing || !data.kos_id}
                                                        className="w-full h-24 rounded-[2.5rem] bg-[#f8f1ea] hover:bg-white text-[#1e110a] font-black text-xl tracking-tight shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
                                                    >
                                                        {processing ? (
                                                            <span className="animate-pulse">PROCESSING...</span>
                                                        ) : (
                                                            <span className="flex items-center gap-3">CONFIRM RESERVATION <ArrowRight className="size-5" /></span>
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="text-center">
                                                    <p className="text-[10px] text-white/30 font-medium leading-relaxed">
                                                        Dengan menekan tombol di atas, Anda menyetujui Syarat & Ketentuan SIKOSPEL. Data Anda dilindungi dengan enkripsi end-to-end.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
