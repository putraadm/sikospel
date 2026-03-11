<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncPendapatanPelaporanJob implements ShouldQueue
{
    use Queueable;

    protected $idKos;
    protected $idPemilik;
    protected $namaKos;
    protected $namaPenghuni;
    protected $nomorKamar;
    protected $tipeKamar;
    protected $periodeTagihan;
    protected $metodePembayaran;
    protected $nominal;
    protected $tanggalPembayaran;

    /**
     * Create a new job instance.
     */
    public function __construct(
        $idKos,
        $idPemilik,
        $namaKos,
        $namaPenghuni,
        $nomorKamar,
        $tipeKamar,
        $periodeTagihan,
        $metodePembayaran,
        $nominal,
        $tanggalPembayaran
    ) {
        $this->idKos = $idKos;
        $this->idPemilik = $idPemilik;
        $this->namaKos = $namaKos;
        $this->namaPenghuni = $namaPenghuni;
        $this->nomorKamar = $nomorKamar;
        $this->tipeKamar = $tipeKamar;
        $this->periodeTagihan = $periodeTagihan;
        $this->metodePembayaran = $metodePembayaran;
        $this->nominal = $nominal;
        $this->tanggalPembayaran = $tanggalPembayaran;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $periodeTagihan = $this->periodeTagihan;
        if ($periodeTagihan instanceof \Carbon\Carbon) {
            $periodeTagihan = $periodeTagihan->format('Y-m-d');
        } elseif (is_string($periodeTagihan) && str_contains($periodeTagihan, 'T')) {
            try {
                $periodeTagihan = \Carbon\Carbon::parse($periodeTagihan)->format('Y-m-d');
            } catch (\Exception $e) {
                // fall back to original if parsing fails
            }
        }

        $response = Http::timeout(30)->withToken(env('API_PELAPORAN_TOKEN'))
            ->post(env('API_PELAPORAN_URL') . '/sync-pendapatan', [
                'id_kos'             => $this->idKos,
                'id_pemilik'         => $this->idPemilik,
                'nama_kos'           => $this->namaKos,
                'nama_penghuni'      => $this->namaPenghuni,
                'nomor_kamar'        => $this->nomorKamar,
                'tipe_kamar'         => $this->tipeKamar,
                'periode_tagihan'    => $periodeTagihan,
                'metode_pembayaran'  => $this->metodePembayaran,
                'nominal'            => $this->nominal,
                'tanggal_pembayaran' => $this->tanggalPembayaran,
            ]);

        if ($response->successful() && $response->json('success') === true) {
            Log::info('Berhasil sync pendapatan ke pelaporan untuk ' . $this->namaPenghuni);
        } else {
            // Melemparkan exception agar Laravel tahu job ini gagal
            $errorMessage = $response->json('message') ?? 'Unknown API Error';
            Log::error('Gagal sync pendapatan ke pelaporan: ' . $errorMessage);
            throw new \Exception('API Sync Failed: ' . $errorMessage);
        }
    }
}
