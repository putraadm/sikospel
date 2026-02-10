import { Share2 } from 'lucide-react';
import Facebook from './facebook';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import WhatsApp from './whatsapp';
import XTwitter from './x-twitter';

export function ButtonShare({ text }: { text: string }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button size="lg">
                    <Share2 />
                    Bagikan
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-40 flex-col overflow-hidden p-0 text-sm">
                <a
                    href={`https://twitter.com/intent/tweet?text=${text}&url=${window.location.href}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-gray-200"
                >
                    {/* <Twitter size={20} fill="black" strokeWidth={0} className="shrink-0" /> */}
                    <XTwitter className="h-[20px] shrink-0" />
                    X/Twitter
                </a>
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-gray-200"
                >
                    {/* <Facebook size={20} fill="black" strokeWidth={0} className="shrink-0" /> */}
                    <Facebook className="h-[20px] shrink-0 text-[#1773ea]" />
                    Facebook
                </a>
                <a
                    href={`https://wa.me/?text=${text + ' ' + window.location.href}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-gray-200"
                >
                    <WhatsApp className="h-[20px] shrink-0 text-[#0cc143]" />
                    WhatsApp
                </a>
            </PopoverContent>
        </Popover>
    );
}
