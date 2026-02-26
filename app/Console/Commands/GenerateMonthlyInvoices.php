<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Room;
use App\Models\Invoice;

class GenerateMonthlyInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:invoices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly invoices based on room billing dates';
    
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now()->day;
        $this->info("Checking rooms with billing_date: {$today}");

        $rooms = Room::where('billing_date', $today)
            ->where('status', 'ditempati')
            ->with(['typeKamar', 'currentPenyewaan'])
            ->get();

        $count = 0;
        foreach ($rooms as $room) {
            $tenancy = $room->currentPenyewaan;

            if (!$tenancy) {
                $this->warn("Room {$room->room_number} is occupied but has no active tenancy.");
                continue;
            }

            $billingPeriod = now()->startOfMonth()->toDateString();
            
            // Check if invoice already exists for this month
            $exists = Invoice::where('tenancy_id', $tenancy->id)
                ->where('billing_period', $billingPeriod)
                ->exists();

            if (!$exists) {
                $dailyRate = $room->typeKamar ? $room->typeKamar->harga : 0;
                
                // Determine rate based on status_penghuni
                $penghuni = $tenancy->penghuni;
                if ($penghuni && $penghuni->status_penghuni === 'penghuni') {
                    $amount = $dailyRate * 30; // Monthly rate
                } else {
                    // Charge for the full month at daily rate for pra-penghuni
                    $daysInMonth = now()->daysInMonth;
                    $amount = $dailyRate * $daysInMonth;
                }
                
                // Business rule: Due date is the 10th of the current month
                $dueDate = now()->startOfMonth()->addDays(9)->toDateString();

                Invoice::create([
                    'tenancy_id' => $tenancy->id,
                    'amount' => $amount,
                    'due_date' => $dueDate,
                    'billing_period' => $billingPeriod,
                    'status' => 'belum_dibayar',
                ]);

                $this->info("Created invoice for Room {$room->room_number} (Tenancy #{$tenancy->id})");
                $count++;
            }
        }

        $this->info("Successfully generated {$count} invoices.");
    }
}
