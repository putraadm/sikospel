import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    role?: {
        name: string;
    };
    [key: string]: unknown;
}

export interface Pemilik {
    id: number;
    user_id: number;
    name: string;
    no_wa: string | null;
    address: string | null;
    user: User;
}

export interface Kos {
    id: number;
    owner_id: number;
    name: string;
    address: string;
    description: string;
    slug: string;
    image: string;
    owner: Pemilik;
    rooms?: Room[];
}

export interface Room {
    id: number;
    kos_id: number;
    room_number: string;
    monthly_rate: number;
    status: string;
    description: string | null;
    image: string | null;
    kos: Kos;
}
