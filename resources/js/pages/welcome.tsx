import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
    kos = [],
}: {
    canRegister?: boolean;
    kos?: any[];
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-83.75 text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-83.75 flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-5 shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-1 font-medium">
                                Daftar Kos
                            </h1>
                            <p className="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
                                Pilih kos yang tersedia dan daftar sebagai penghuni.
                            </p>
                            <div className="mb-4">
                                {kos.length > 0 ? (
                                    <div className="grid gap-4">
                                        {kos.map((k: any) => (
                                            <div key={k.id} className="border rounded-lg p-4 dark:border-[#3E3E3A]">
                                                <h3 className="font-medium">{k.name}</h3>
                                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{k.address}</p>
                                                <div className="mt-2">
                                                    <p className="text-sm font-medium">Kamar Tersedia:</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {k.rooms && k.rooms.filter((room: any) => room.status === 'tersedia').map((room: any) => (
                                                            <span key={room.id} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">
                                                                {room.type_kamar ? (
                                                                    <>
                                                                        {room.type_kamar.nama} - Rp{Number(room.type_kamar.harga).toLocaleString('id-ID')}
                                                                    </>
                                                                ) : (
                                                                    <>Tipe belum diatur</>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/pendaftaran-kos?kos_id=${k.id}`}
                                                    className="inline-block mt-3 rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                                >
                                                    Daftar
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">Belum ada kos tersedia.</p>
                                )}
                            </div>

                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
