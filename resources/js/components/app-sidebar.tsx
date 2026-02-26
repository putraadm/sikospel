import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, User, Users, FileText, BedDouble, Home, CreditCard, MessageSquare } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

// Admin & Pemilik nav items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Users,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: User,
    },
    {
        title: 'Pemilik',
        href: '/admin/pemilik',
        icon: User,
    },
    {
        title: 'Kos',
        href: '/admin/kos',
        icon: Home,
    },
    {
        title: 'Kamar',
        href: '/admin/room',
        icon: BedDouble,
    },
    {
        title: 'Tipe Kamar',
        href: '/admin/type-kamar',
        icon: BedDouble,
    },
    {
        title: 'Penghuni',
        href: '/admin/penghuni',
        icon: Users,
    },
    {
        title: 'Tagihan',
        href: '/admin/tagihan',
        icon: CreditCard,
    },
    {
        title: 'Laporan Keuangan',
        href: '/admin/laporan-keuangan',
        icon: FileText,
    },
    {
        title: 'Kritik & Saran',
        href: '/admin/feedback',
        icon: MessageSquare,
    },
];

// Penghuni nav items
const penghuniNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Tagihan',
        href: '/penghuni/tagihan',
        icon: CreditCard,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const roleName = auth.user?.role?.name;

    const getNavItems = (): NavItem[] => {
        if (roleName === 'penghuni') {
            return penghuniNavItems;
        }
        // Admin/pemilik — filter by role
        return adminNavItems.filter(item => {
            if (roleName === 'superadmin') return true;
            if (roleName === 'pemilik') {
                return ['Dashboard', 'Penghuni', 'Kos', 'Kamar', 'Tagihan', 'Tipe Kamar', 'Kritik & Saran', 'Laporan Keuangan'].includes(item.title);
            }
            return false;
        });
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={getNavItems()} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
