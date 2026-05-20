<?php

namespace App\Observers;

use App\Models\Invoice;
use App\Services\WhatsAppService;
use Carbon\Carbon;

class InvoiceObserver
{
    /**
     * Handle the Invoice "created" event.
     *
     * @param \App\Models\Invoice $invoice
     * @return void
     */
    public function created(Invoice $invoice): void
    {
        // Load related data safely
        $invoice->load(['tenancy.penghuni', 'tenancy.room.kos']);

        $penghuni = $invoice->tenancy->penghuni ?? null;
        if ($penghuni && !empty($penghuni->no_wa)) {
            $kosName = $invoice->tenancy->room->kos->name ?? 'Kos';
            $roomNumber = $invoice->tenancy->room->room_number ?? '-';
            
            // Format Amount to Rupiah (e.g. Rp 1.500.000)
            $amountFormatted = 'Rp ' . number_format($invoice->amount, 0, ',', '.');
            
            // Indonesian month mapper for guaranteed localized formatting
            $months = [
                1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
            ];

            $billingPeriodCarbon = Carbon::parse($invoice->billing_period);
            $periodFormatted = $months[$billingPeriodCarbon->month] . ' ' . $billingPeriodCarbon->year;

            $dueDateCarbon = Carbon::parse($invoice->due_date);
            $dueDateFormatted = $dueDateCarbon->day . ' ' . $months[$dueDateCarbon->month] . ' ' . $dueDateCarbon->year;

            $message = "Halo *{$penghuni->name}*,\n\n"
                     . "Tagihan baru untuk *{$kosName}* (Kamar {$roomNumber}) periode *{$periodFormatted}* telah terbit.\n\n"
                     . "Detail Tagihan:\n"
                     . "- *Jumlah:* {$amountFormatted}\n"
                     . "- *Jatuh Tempo:* {$dueDateFormatted}\n"
                     . "- *Status:* Belum Dibayar\n\n"
                     . "Silakan lakukan pembayaran melalui aplikasi SIKOSPEL.\n"
                     . "Terima kasih.";

            WhatsAppService::sendMessage($penghuni->no_wa, $message);
        }
    }
}
