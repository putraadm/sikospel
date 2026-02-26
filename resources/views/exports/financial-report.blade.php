<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan SIKOSPEL</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #664229; margin-bottom: 5px; }
        .stats { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
        th { background-color: #664229; color: white; }
        .footer { margin-top: 30px; text-align: right; font-weight: bold; font-size: 16px; color: #664229; }
        .meta { font-size: 10px; color: #777; margin-top: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Keuangan SIKOSPEL</h1>
        <p>Rekapitulasi Pemasukan Pembayaran Tagihan Kos</p>
        <p>Periode: {{ $bulan_name }} {{ $tahun }}</p>
    </div>

    <div class="stats">
        <strong>Ringkasan:</strong><br>
        Total Item: {{ count($payments) }}<br>
        Total Pemasukan: Rp {{ number_format($total, 0, ',', '.') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal Bayar</th>
                <th>Penghuni</th>
                <th>Kos</th>
                <th>Kamar</th>
                <th>Periode Tagihan</th>
                <th>Nominal</th>
                <th>Metode</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y H:i') }}</td>
                    <td>{{ $payment->invoice->tenancy->penghuni->name ?? 'N/A' }}</td>
                    <td>{{ $payment->invoice->tenancy->room->kos->name }}</td>
                    <td>Kamar {{ $payment->invoice->tenancy->room->room_number }}</td>
                    <td>{{ $payment->invoice->billing_period ? \Carbon\Carbon::parse($payment->invoice->billing_period)->format('M Y') : '-' }}</td>
                    <td>Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}</td>
                    <td>{{ $payment->method ?? 'Default' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Total Keseluruhan: Rp {{ number_format($total, 0, ',', '.') }}
    </div>

    <div class="meta">
        Dicetak pada: {{ now()->format('d/m/Y H:i:s') }} oleh {{ auth()->user()->name }}
    </div>
</body>
</html>
