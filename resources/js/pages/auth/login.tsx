import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { LogIn, User, Lock } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Selamat Datang Kembali"
            description="Silakan masuk ke akun Anda untuk mulai mengelola properti."
        >
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        name="username"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="Ketik username Anda"
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-medium text-primary hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer select-none">Ingat saya untuk sesi berikutnya</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : <LogIn className="mr-2 size-4" />}
                                Masuk ke Dashboard
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-neutral-500">
                                Belum punya akun?{' '}
                                <TextLink href={register()} tabIndex={5} className="font-bold text-primary hover:underline">
                                    Daftar Sekarang
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 border border-green-100">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
