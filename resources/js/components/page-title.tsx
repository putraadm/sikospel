import { ReactNode } from 'react';

export function PageTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
    return (
        <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-primary">{title}</h2>
            {subtitle && <h3>{subtitle}</h3>}
        </div>
    );
}
