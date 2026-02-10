import { Column, Table } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

export function ColumnFilterFaceted<T>({ column, table, reverse }: { column: Column<T>; table: Table<T>; reverse?: boolean }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);

    const uniqueValues = useMemo(() => {
        const values = Array.from(column.getFacetedUniqueValues().keys())
            .map((v) => (typeof v != 'string' ? v.toString() : v))
            .sort();

        if (reverse) {
            values.reverse();
        }

        return values;
    }, [column]);
    const filteredOptions = useMemo(() => uniqueValues.filter((value) => value.toLowerCase().includes(search.toLowerCase())), [uniqueValues, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className={`size-8 ${selected.length > 0 ? 'text-accent-foreground' : ''}`}>
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
                    {filteredOptions.map((value, index) => (
                        <div
                            key={index}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-muted/50"
                            onClick={() => {
                                const exists = selected.includes(value);
                                const data = exists ? selected.filter((id) => id !== value) : [...selected, value];
                                setSelected(data);
                                column.setFilterValue(data.length > 0 ? data : undefined);
                                table.setPageIndex(0);
                            }}
                        >
                            <Checkbox checked={selected.includes(value)} />
                            <span className="text-sm">{value}</span>
                        </div>
                    ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
