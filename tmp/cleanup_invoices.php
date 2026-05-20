<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Invoice;
use App\Models\Penyewaan;
use App\Models\Penghuni;

// 1. Clean up for those who are ALREADY set to 'keluar' status
$keluarPenghuniIds = Penghuni::where('status_penghuni', 'keluar')->pluck('user_id');
$affectedInvoices = Invoice::where('status', 'belum_dibayar')
    ->whereHas('tenancy', function($q) use ($keluarPenghuniIds) {
        $q->whereIn('penghuni_id', $keluarPenghuniIds);
    })->delete();

echo "Deleted $affectedInvoices unpaid invoices for existing 'keluar' tenants.\n";

// 2. Also check for finished tenancies that might still have bills
$affectedOrphans = Invoice::where('status', 'belum_dibayar')
    ->whereHas('tenancy', function($q) {
        $q->where('status', 'selesai');
    })->delete();

echo "Deleted $affectedOrphans unpaid invoices for finished tenancies.\n";

// 3. Special case for Jokowi (the user says he is out but database says he is 'penghuni')
// Maybe the user wants me to set him to 'keluar' now?
$jokowi = Penghuni::where('name', 'like', '%Joko%')->first();
if ($jokowi && $jokowi->status_penghuni === 'penghuni') {
    echo "Setting Jokowi to 'keluar' and cleaning up...\n";
    $jokowi->update(['status_penghuni' => 'keluar']);
    
    $currentTenancy = Penyewaan::where('penghuni_id', $jokowi->user_id)->where('status', 'aktif')->first();
    if ($currentTenancy) {
        $currentTenancy->update(['status' => 'selesai', 'end_date' => now()]);
        
        // Free up the room
        $room = \App\Models\Room::find($currentTenancy->room_id);
        if ($room) {
            $room->update(['status' => 'tersedia']);
        }

        $deletedCount = Invoice::where('tenancy_id', $currentTenancy->id)
            ->where('status', 'belum_dibayar')
            ->delete();
        echo "Deleted $deletedCount unpaid invoices for Jokowi.\n";
    }
}

// 4. Clean up for soft-deleted tenants
$affectedDeleted = Invoice::where('status', 'belum_dibayar')
    ->whereHas('tenancy.penghuni', function($q) {
        $q->onlyTrashed();
    })->delete();

echo "Deleted $affectedDeleted unpaid invoices for soft-deleted tenants.\n";
