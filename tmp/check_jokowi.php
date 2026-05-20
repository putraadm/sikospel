<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Penghuni;
use App\Models\Invoice;
use App\Models\Penyewaan;

$p = Penghuni::where('name', 'like', '%Joko%')->first();
if ($p) {
    echo "Penghuni: " . $p->name . "\n";
    echo "Status: " . $p->status_penghuni . "\n";
    $tenancies = Penyewaan::where('penghuni_id', $p->user_id)->get();
    foreach ($tenancies as $t) {
        echo "Tenancy ID: " . $t->id . " - Status: " . $t->status . "\n";
        $invoices = Invoice::where('tenancy_id', $t->id)->get();
        foreach ($invoices as $inv) {
            echo "  Invoice ID: " . $inv->id . " - Period: " . $inv->billing_period . " - Status: " . $inv->status . "\n";
        }
    }
} else {
    echo "Joko not found\n";
}
