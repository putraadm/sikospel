import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

export type ColumnFilterOption = { id: string; label: string };

export function ColumnFilter<U>({ column, data }: { column: Column<U>; data: ColumnFilterOption[] }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    const filteredOptions = useMemo(() => {
        return data.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
    }, [data, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="size-8">
                    <Filter size={16} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-60 space-y-2 p-3"
                side="bottom"
                onEscapeKeyDown={(e) => e.stopPropagation()}
                // onPointerDownOutside={(e) => e.preventDefault()}
            >
                <Input
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    autoFocus
                    className="text-sm"
                />
                <ScrollArea className="h-40">
                    {filteredOptions.map((opt) => (
                        <div
                            key={opt.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-muted/50"
                            onClick={() => {
                                const exists = selected.includes(opt.id);
                                const data = exists ? selected.filter((id) => id !== opt.id) : [...selected, opt.id];
                                setSelected(data);
                                column.setFilterValue(data.length > 0 ? data : undefined);
                            }}
                        >
                            <Checkbox checked={selected.includes(opt.id)} />
                            <span className="text-sm">{opt.label}</span>
                        </div>
                    ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
