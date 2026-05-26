<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Invoice;
use App\Models\Penyewaan;

$orphans = Invoice::where('status', 'belum_dibayar')
    ->whereHas('tenancy', function($q) {
        $q->where('status', 'selesai');
    })
    ->with('tenancy.penghuni')
    ->get();

foreach ($orphans as $inv) {
    echo "Invoice ID: " . $inv->id . " - Tenant: " . ($inv->tenancy->penghuni->name ?? 'Unknown') . " - Period: " . $inv->billing_period . "\n";
}

if ($orphans->isEmpty()) {
    echo "No unpaid invoices for finished tenancies found.\n";
}
