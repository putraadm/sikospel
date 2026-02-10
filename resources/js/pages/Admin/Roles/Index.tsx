import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/app/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
];

interface Role {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    roles: Role[];
}

export default function Index({ roles }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({ name: '' });

    // Delete confirmation state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/roles', {
            onSuccess: () => reset(),
        });
    };

    const handleEdit = (role: Role) => {
        setEditingId(role.id);
        setEditData({ name: role.name });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ name: '' });
    };

    const handleUpdate = (roleId: number) => {
        router.put(`/admin/roles/${roleId}`, editData, {
            onSuccess: () => {
                setEditingId(null);
                setEditData({ name: '' });
            },
        });
    };

    const confirmDelete = (roleId: number) => {
        setDeleteId(roleId);
        setConfirmOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            setIsDeleting(true);
            router.delete(`/admin/roles/${deleteId}`, {
                onSuccess: () => {
                    setConfirmOpen(false);
                    setDeleteId(null);
                    setIsDeleting(false);
                },
                onError: () => {
                    setIsDeleting(false);
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Kelola Roles</h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold">Tambah Role Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nama Role</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama role"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>
                            <Button type="submit" disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Role
                            </Button>
                        </form>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h2 className="mb-4 text-lg font-semibold">Daftar Roles</h2>
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center justify-between rounded-lg border p-3">
                                    {editingId === role.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <Input
                                                value={editData.name}
                                                onChange={(e) => setEditData({ name: e.target.value })}
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdate(role.id)}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{role.name}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(role)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => confirmDelete(role.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Hapus Role"
                    description="Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan."
                    onConfirm={handleDelete}
                    processing={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
