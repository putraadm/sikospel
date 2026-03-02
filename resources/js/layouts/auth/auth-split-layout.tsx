import { Link } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import gsap from 'gsap';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(leftRef.current,
                { opacity: 0, x: -50 },
                { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo(rightRef.current,
                { opacity: 0, x: 50 },
                { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo(contentRef.current?.children || [],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="flex min-h-svh bg-background">
            <div
                ref={leftRef}
                className="relative hidden w-1/2 overflow-hidden bg-primary lg:block"
            >
                <img
                    src="/images/login-bg.png"
                    alt="Login Background"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-12 text-white">
                    <Link href={home()} className="flex items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                            <AppLogoIcon className="size-8 fill-current text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">SIKOSPEL</span>
                    </Link>

                    <div className="max-w-md space-y-4">
                        <h2 className="text-4xl font-bold leading-tight">
                            Kelola Hunian Anda dengan Lebih Profesional.
                        </h2>
                        <p className="text-lg text-white/80">
                            Sistem Informasi Kost dan Pengelolaan Properti (SIKOSPEL) hadir untuk membantu Anda mengelola penyewaan dengan mudah, cepat, dan transparan.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>© 2024 SIKOSPEL. All rights reserved.</span>
                    </div>
                </div>
            </div>

            <div
                ref={rightRef}
                className="flex w-full flex-col justify-center p-6 md:p-12 lg:w-1/2"
            >
                <div className="mx-auto w-full max-w-md space-y-8">
                    <div ref={contentRef} className="space-y-6">
                        <div className="flex justify-center lg:hidden">
                            <Link href={home()} className="flex flex-col items-center gap-2">
                                <AppLogoIcon className="size-12 fill-current text-primary" />
                                <span className="text-xl font-bold text-primary">SIKOSPEL</span>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                            <p className="text-muted-foreground">{description}</p>
                        </div>

                        <div className="rounded-2xl border bg-card p-1 shadow-sm">
                            <div className="rounded-[calc(var(--radius)-4px)] p-6">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
