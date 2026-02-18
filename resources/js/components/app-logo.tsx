import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary shadow-[0_4px_12px_rgba(102,66,41,0.2)] group-hover:shadow-[0_6px_20px_rgba(102,66,41,0.3)] transition-all">
                <AppLogoIcon className="size-6 fill-current text-white" />
            </div>
            <div className="ml-3 flex flex-col items-start leading-none gap-1">
                <span className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white">
                    SIKOSPEL
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 dark:text-neutral-500">
                    Sistem KOS & Pelaporan
                </span>
            </div>
        </>
    );
}
