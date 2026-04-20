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
            isset($payment['tanggal_pembayaran']) ? \Carbon\Carbon::parse($payment['tanggal_pembayaran'])->format('d/m/Y H:i') : '-',
            $payment['nama_penghuni'] ?? 'N/A',
            $payment['nama_kos'] ?? 'N/A',
            'Kamar ' . ($payment['nomor_kamar'] ?? '-'),
            $payment['tipe_kamar'] ?? '-',
            isset($payment['periode_tagihan']) ? \Carbon\Carbon::parse($payment['periode_tagihan'])->format('F Y') : '-',
            $payment['nominal'] ?? 0,
            $payment['metode_pembayaran'] ?? 'Default',
        ];
    }
}
