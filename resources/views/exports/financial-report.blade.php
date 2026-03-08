<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Keuangan SIKOSPEL</title>
    <style>
        @page {
            margin: 1.5cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.4;
            font-size: 11px;
        }
        .kop-surat {
            text-align: center;
            border-bottom: 3px double #664229;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .kop-surat h1 {
            margin: 0;
            color: #664229;
            font-size: 24px;
            text-transform: uppercase;
        }
        .kop-surat p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #555;
        }
        .report-title {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 20px;
            text-decoration: underline;
        }
        .meta-container {
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-table {
            width: 100%;
            border: none;
        }
        .meta-table td {
            border: none;
            padding: 2px 0;
        }
        .meta-label {
            width: 120px;
            font-weight: bold;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .data-table th, .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .data-table th {
            background-color: #f8f8f8;
            font-weight: bold;
            color: #664229;
            text-transform: uppercase;
            font-size: 10px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .summary-box {
            background-color: #fff9f5;
            border: 1px solid #664229;
            padding: 15px;
            margin-bottom: 30px;
            width: 300px;
            float: right;
        }
        .summary-box table {
            width: 100%;
        }
        .summary-box td {
            padding: 2px 0;
        }
        .clear { clear: both; }
        .signature-container {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 200px;
            text-align: center;
        }
        .signature-space {
            height: 80px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 9px;
            color: #777;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="kop-surat">
        <h1>SIKOSPEL</h1>
        <p>Sistem Informasi Pengelolaan Kos & Properti Elektronik</p>
        <p>Email: admin@sikospel.com | Website: www.sikospel.com</p>
    </div>

    <div class="report-title">LAPORAN REKAPITULASI PENDAPATAN</div>

    <div class="meta-container">
        <table class="meta-table">
            <tr>
                <td class="meta-label">ID Laporan</td>
                <td>: RPT-{{ now()->format('Ym') }}-{{ strtoupper(substr(md5(now()), 0, 6)) }}</td>
                <td class="meta-label text-right">Tanggal Cetak</td>
                <td class="text-right">: {{ now()->translatedFormat('d F Y H:i') }}</td>
            </tr>
            <tr>
                <td class="meta-label">Periode</td>
                <td>: {{ $bulan_name }} {{ $tahun }}</td>
                <td class="meta-label text-right">Dicetak Oleh</td>
                <td class="text-right">: {{ $user->role->name === 'superadmin' ? 'Superadmin' : ($user->role->name === 'pemilik' ? 'Pemilik Kos' : ucfirst($user->role->name)) }}</td>
            </tr>
            <tr>
                <td class="meta-label">Filter Kos</td>
                <td>: {{ $filtered_kos }}</td>
                <td></td>
                <td></td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th width="15%" class="text-center">Tanggal</th>
                <th width="20%">Nama Penghuni</th>
                <th width="15%">Kos</th>
                <th width="15%">Unit / Tipe</th>
                <th width="15%">Periode Tagihan</th>
                <th width="20%" class="text-right">Nominal (IDR)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $payment)
                <tr>
                    <td class="text-center">{{ \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') }}</td>
                    <td>{{ $payment->penghuni_name ?? 'N/A' }}</td>
                    <td>{{ $payment->kos_name }}</td>
                    <td>Kamar {{ $payment->room_number }} ({{ $payment->type_kamar_nama ?? '-' }})</td>
                    <td>{{ $payment->billing_period ? \Carbon\Carbon::parse($payment->billing_period)->translatedFormat('F Y') : '-' }}</td>
                    <td class="text-right">{{ number_format($payment->amount_paid, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center">Tidak ada data transaksi ditemukan untuk periode ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="font-bold">
                <td colspan="5" class="text-right">TOTAL PENDAPATAN :</td>
                <td class="text-right">Rp {{ number_format($total, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    <div class="clear"></div>

    <div class="signature-container">
        <div class="signature-box">
            <p>Dicetak pada: {{ now()->translatedFormat('d F Y') }}</p>
            <p>Penanggung Jawab,</p>
            <div class="signature-space"></div>
            <p class="font-bold">( {{ $user->name }} )</p>
            <p>{{ $user->role->name === 'superadmin' ? 'Superadmin' : ($user->role->name === 'pemilik' ? 'Pemilik Kos' : ucfirst($user->role->name)) }}</p>
        </div>
    </div>

    <div class="footer">
        Laporan ini dihasilkan secara otomatis oleh Sistem SIKOSPEL. Segala bentuk perbedaan data harus diverifikasi melalui sistem utama.
    </div>
</body>
</html>
