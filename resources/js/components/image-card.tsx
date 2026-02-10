import { Calendar, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

export function ImageCard({
    gambar,
    nama,
    tanggal,
    alamat,
    tipe,
    tanggalTitle,
}: {
    gambar: string;
    nama: string;
    tanggal?: string;
    alamat?: string;
    tipe?: string;
    tanggalTitle?: string;
}) {
    return (
        <Card className="group h-full p-0">
            <CardContent className="flex aspect-[3/1] flex-1 flex-col items-center justify-center p-0">
                <div className="relative w-full">
                    <img src={gambar} alt={nama} className="h-48 w-full rounded-t-xl object-cover object-top" />
                    {tipe ? (
                        <Badge className="absolute right-2 bottom-2 line-clamp-1 max-w-[calc(100%-var(--spacing)*4)] capitalize">{tipe}</Badge>
                    ) : null}
                </div>
                <div className="flex w-full flex-1 flex-col justify-between p-4">
                    <h1 className="line-clamp-2 font-bold transition-colors group-hover:text-primary">{nama}</h1>
                    {tanggal ? (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500" title={tanggalTitle}>
                            <Calendar size={16} />
                            {tanggal}
                        </div>
                    ) : null}
                    {alamat ? (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={16} className="shrink-0" />
                            <div className="line-clamp-1 break-all" title={alamat}>
                                {alamat}
                            </div>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
