import { cn } from '@/lib/utils';
import { NavbarMenu } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function DropdownMenu({ item, className, isMobile = false, currentUrl }: { item: NavbarMenu; className?: string; isMobile?: boolean; currentUrl: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const isActive = currentUrl === item.url || (item.submenu && item.submenu.some((sub) => currentUrl === sub.url));

    function handleMouseEnter() {
        setIsOpen(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = null;
    }

    function handleMouseLeave() {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 250) as unknown as number;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!item.submenu || item.submenu.length === 0) {
        return (
            <Link href={item.url} className={cn('font-medium hover:text-primary', className, isActive ? 'text-primary' : '')}>
                {item.judul}
            </Link>
        );
    }

    if (isMobile) {
        return (
            <div className="w-full">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn('flex w-full items-center justify-between font-medium hover:text-primary', className, isActive ? 'text-primary' : '')}
                >
                    {item.judul}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                    <div className="mt-2 ml-4 space-y-2">
                        {item.submenu.map((subItem) => (
                            <Link key={subItem.id} href={subItem.url} className={cn("block text-sm text-gray-600 hover:text-primary", currentUrl === subItem.url ? 'text-primary' : '')}>
                                {subItem.judul}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <span ref={dropdownRef} className="relative" onMouseLeave={handleMouseLeave}>
            <Link
                href={item.url}
                onMouseEnter={handleMouseEnter}
                className={cn('inline-flex items-center gap-1 font-medium hover:text-primary', className, isActive ? 'text-primary' : '')}
            >
                {item.judul}
                <ChevronDown className={cn('h-4 w-4 transition-transform')} />
            </Link>
            {isOpen && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 min-w-48 rounded-md border bg-white p-1 shadow-lg"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {item.submenu.map((subItem) => (
                        <Link key={subItem.id} href={subItem.url} className={cn("block px-4 py-2 text-sm hover:bg-gray-100 hover:text-primary", currentUrl === subItem.url ? 'text-primary' : '')}>
                            {subItem.judul}
                        </Link>
                    ))}
                </div>
            )}
        </span>
    );
}
