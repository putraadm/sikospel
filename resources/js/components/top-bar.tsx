import { Pengaturan } from '@/types';
import { Calendar } from 'lucide-react';
import Facebook from './facebook';
import Instagram from './instagram';
import XTwitter from './x-twitter';

export function TopBar({ pengaturan }: { pengaturan: Pengaturan }) {
    return (
        <div className="hidden bg-primary px-4 py-2 text-primary-foreground lg:block">
            <div className="container mx-auto flex justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('id', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <a href={pengaturan.facebook} target="_blank">
                        <Facebook className="h-[16px]" />
                    </a>
                    <a href={pengaturan.twitter} target="_blank">
                        <XTwitter className="h-[16px]" />
                    </a>
                    <a href={pengaturan.instagram} target="_blank">
                        <Instagram className="h-[16px]" />
                    </a>
                </div>
            </div>
        </div>
    );
}
