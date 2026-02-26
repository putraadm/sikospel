<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class FinancialReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $payments;

    public function __construct($payments)
    {
        $this->payments = $payments;
    }

    public function collection()
    {
        return $this->payments;
    }

    public function headings(): array
    {
        return [
            'Tanggal Bayar',
            'Penghuni',
            'Kos',
            'Kamar',
            'Type Kamar',
            'Periode Tagihan',
            'Nominal',
            'Metode',
        ];
    }

    public function map($payment): array
    {
        return [
            \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y H:i'),
            $payment->invoice->tenancy->penghuni->name ?? 'N/A',
            $payment->invoice->tenancy->room->kos->name,
            'Kamar ' . $payment->invoice->tenancy->room->room_number,
            $payment->invoice->tenancy->room->typeKamar->nama ?? 'Unknown',
            $payment->invoice->billing_period ? \Carbon\Carbon::parse($payment->invoice->billing_period)->format('F Y') : '-',
            $payment->amount_paid,
            $payment->method ?? 'Default',
        ];
    }
}
