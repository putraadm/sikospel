import { Pengaturan } from '@/lib/types';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function HeadSeo({
    title,
    description,
    keywords,
    image,
    pengaturan,
    children,
}: PropsWithChildren<{ title?: string; description?: string; keywords?: string; image?: string; pengaturan: Pengaturan }>) {
    // NOTE(syfq): ambil @username
    const twitter = pengaturan.twitter.split('/');

    return (
        <Head title={title}>
            {/* <meta name="description" content={description ?? pengaturan.deskripsi} />
            <meta name="keywords" content={keywords} />
            <meta name="twitter:title" content={title ?? pengaturan.judul} />
            <meta name="twitter:description" content={description ?? pengaturan.deskripsi} />
            <meta name="twitter:creator" content={twitter[twitter.length - 1]} />
            <meta name="twitter:site" content={twitter[twitter.length - 1]} />
            <meta name="og:type" content={'website'} />
            <meta name="og:title" content={title ?? pengaturan.judul} />
            <meta name="og:description" content={description ?? pengaturan.deskripsi} />
            {image ? (
                <>
                    <meta name="twitter:image" content={image} />
                    <meta name="twitter:card" content={'summary_large_image'} />
                    <meta name="og:image" content={image} />
                </>
            ) : null} */}
            {children}
        </Head>
    );
}
