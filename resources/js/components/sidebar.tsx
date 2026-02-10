// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Berita, Pengaturan } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import Facebook from './facebook';
import Instagram from './instagram';
import { Skeleton } from './ui/skeleton';
import WhatsApp from './whatsapp';

export function Sidebar({ berita, pengaturan }: { berita: Berita[] | null; pengaturan: Pengaturan }) {
    return (
        <aside className="w-full shrink-0 space-y-4 lg:max-w-xs">
            <Card>
                <CardContent>
                    {/* Social Network */}
                    <h1 className="text-center text-xl font-bold">Ikuti Kami</h1>
                    <div className="mt-4 grid grid-cols-4 justify-items-center">
                        <a href={pengaturan.facebook} target="_blank" className="rounded-full p-2 text-[#1773ea] transition-colors hover:bg-gray-100">
                            {/* <Facebook size={24} /> */}
                            <Facebook className="h-[24px]" />
                        </a>

                        {/* <a href="https://t.me/Pemerintah_Daerah" target="_blank" className="rounded-full p-2 text-[#25a1de] hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor" className="h-[24px]">
                                <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z" />
                            </svg>
                        </a> */}

                        <a
                            href={pengaturan.instagram}
                            target="_blank"
                            className="rounded-full p-2 text-[#bf2c69] transition-colors hover:bg-gray-100"
                        >
                            {/* <Instagram size={24} /> */}
                            <Instagram className="h-[24px]" />
                        </a>

                        <a href={pengaturan.youtube} target="_blank" className="rounded-full p-2 text-[#ff0033] transition-colors hover:bg-gray-100">
                            {/* <Youtube size={24} /> */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="h-[24px]">
                                <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z" />
                            </svg>
                        </a>

                        <a
                            href={'https://wa.me/62' + pengaturan.no_telp}
                            target="_blank"
                            className="rounded-full p-2 text-[#0cc143] transition-colors hover:bg-gray-100"
                        >
                            <WhatsApp className="h-[24px]" />
                        </a>
                        {/* <a href="/index.php?pages=visitor" className="flex items-center gap-2 text-yellow-600 hover:underline">
                            <BarChart2 size={16} /> Visitor <span className="font-bold">{visitor}K</span>
                        </a> */}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="flex flex-col gap-6">
                    {/* <h1>Jadwal Pimpinan</h1>
                <ul className="space-y-4">
                    {pimpinan.map((item, idx) => (
                        <li key={idx} className="border-b pb-2">
                            <div className="font-semibold">{item.nama}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={14} /> {item.tanggal}
                                <span className="ml-2">{item.status}</span>
                            </div>
                        </li>
                    ))}
                </ul> */}
                    {/* <h1 className="font-bold">Berita</h1> */}
                    <div className="text-xl font-bold">
                        {/* <LinkUnderline href={route('berita')} className="text-lg font-bold"> */}
                        Berita
                        {/* </LinkUnderline> */}
                    </div>
                    <div className="space-y-4">
                        {berita
                            ? berita.slice(0, 6).map((item, index, array) => (
                                  <Link
                                      href={route('berita.detail', item.id)}
                                      key={index}
                                      className={`flex gap-2 ${index < array.length - 1 ? 'border-b' : ''} group pb-2`}
                                  >
                                      <div className="shrink-0">
                                          <img src={'/storage/' + item.gambar} alt={item.judul} className="h-12 w-12 rounded object-cover" />
                                      </div>
                                      <div>
                                          <div className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">{item.judul}</div>
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Calendar size={14} />
                                              {new Date(item.created_at).toLocaleDateString('id', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })}
                                          </div>
                                      </div>
                                  </Link>
                              ))
                            : Array.from({ length: 3 }).map((_, index) => <Skeleton className={`h-[3lh] w-full`} key={index} />)}
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
