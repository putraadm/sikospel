import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/favicon-96x96.png"
            alt="SIKOSPEL Logo"
        />
    );
}
