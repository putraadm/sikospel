// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Lupa Password?"
            description="Masukkan email Anda dan kami akan mengirimkan link untuk mereset password."
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-600 border border-green-100">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="email@contoh.com"
                                        className="pl-10"
                                    />
                                </div>

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-lg font-semibold transition-all duration-200 active:scale-[0.98]"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing ? (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 size-4" />
                                    )}
                                    Kirim Link Reset Password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="flex items-center justify-center space-x-1 text-center text-sm text-neutral-500">
                    <ArrowLeft className="size-3" />
                    <span>Kembali ke</span>
                    <TextLink href={login()} className="font-bold text-primary hover:underline">halaman masuk</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
