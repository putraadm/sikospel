<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Pembayaran - {{ $payment->transaction_id }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
        }
        .receipt {
            background-color: white;
            width: 380px;
            margin: 0 auto;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-top: 5px solid #664229;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #e5e7eb;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            color: #664229;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
        }
        .label {
            color: #6b7280;
        }
        .value {
            font-weight: bold;
            text-align: right;
        }
        .divider {
            border-bottom: 1px dashed #e5e7eb;
            margin: 15px 0;
        }
        .total {
            background-color: #f9fafb;
            padding: 10px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 11px;
            color: #9ca3af;
        }
        .btn-print {
            display: block;
            width: 95%;
            padding: 10px;
            background-color: #664229;
            color: white;
            text-align: center;
            text-decoration: none;
            margin-top: 20px;
            border-radius: 5px;
            font-weight: bold;
        }
        @media print {
            @page {
                size: 80mm auto;
                margin: 5mm;
            }
            .btn-print { display: none; }
            body {
                background-color: white;
                padding: 0;
                margin: 0;
            }
            .receipt {
                box-shadow: none;
                width: 100%;
                border-top: 3px solid #664229;
                padding: 10px;
            }
            .header h1 { font-size: 16px; }
            .item { font-size: 11px; }
            .total { font-size: 13px; }
            .footer { font-size: 9px; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>SIKOSPEL</h1>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">Bukti Pembayaran Elektronik</p>
        </div>

        <div class="item">
            <span class="label">No. Transaksi</span>
            <span class="value">{{ $payment->transaction_id }}</span>
        </div>
        <div class="item">
            <span class="label">Tanggal</span>
            <span class="value">{{ $payment->payment_date->format('d/m/Y H:i') }}</span>
        </div>

        <div class="divider"></div>

        <div class="item">
            <span class="label">Nama Penghuni</span>
            <span class="value">{{ $payment->invoice->tenancy->penghuni->name }}</span>
        </div>
        <div class="item">
            <span class="label">Nama Kos</span>
            <span class="value">{{ $payment->invoice->tenancy->room->kos->name }}</span>
        </div>
        <div class="item">
            <span class="label">Unit Kamar</span>
            <span class="value">No. {{ $payment->invoice->tenancy->room->room_number }}</span>
        </div>
        <div class="item">
            <span class="label">Periode</span>
            <span class="value">{{ $payment->invoice->billing_period->format('F Y') }}</span>
        </div>

        <div class="divider"></div>

        <div class="item">
            <span class="label">Metode Bayar</span>
            <span class="value" style="text-transform: uppercase;">{{ $payment->method }}</span>
        </div>
        <div class="item">
            <span class="label">Status</span>
            <span class="value" style="color: #059669;">BERHASIL</span>
        </div>

        <div class="total">
            <span>TOTAL BAYAR</span>
            <span>Rp {{ number_format($payment->amount_paid, 0, ',', '.') }}</span>
        </div>

        <div class="footer">
            <p>Terima kasih telah melakukan pembayaran.</p>
            <p>Simpan bukti pembayaran ini sebagai tanda terima yang sah.</p>
        </div>

        <a href="#" onclick="window.print(); return false;" class="btn-print">CETAK STRUK</a>
    </div>

    <script>
        // Auto print or dialog after load
        // window.print();
    </script>
</body>
</html>
