<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncMutasiPelaporanJob implements ShouldQueue
{
    use Queueable;

    protected $idPenghuni;
    protected $nama;
    protected $noWa;
    protected $agama;
    protected $fileKtpUrl;
    protected $fileKkUrl;
    protected $idKos;
    protected $jenisMutasi;
    protected $tanggalMutasi;

    /**
     * Create a new job instance.
     */
    public function __construct(
        $idPenghuni,
        $nama,
        $noWa,
        $agama,
        $fileKtpUrl,
        $fileKkUrl,
        $idKos,
        $jenisMutasi,
        $tanggalMutasi
    ) {
        $this->idPenghuni = $idPenghuni;
        $this->nama = $nama;
        $this->noWa = $noWa;
        $this->agama = $agama;
        $this->fileKtpUrl = $fileKtpUrl;
        $this->fileKkUrl = $fileKkUrl;
        $this->idKos = $idKos;
        $this->jenisMutasi = $jenisMutasi;
        $this->tanggalMutasi = $tanggalMutasi;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $response = Http::timeout(10)->withToken(env('API_PELAPORAN_TOKEN'))
                ->post(env('API_PELAPORAN_URL') . '/sync-mutasi', [
                    'id_penghuni'    => $this->idPenghuni,
                    'nama'           => $this->nama,
                    'no_wa'          => $this->noWa,
                    'agama'          => $this->agama,
                    'file_ktp'       => $this->fileKtpUrl,
                    'file_kk'        => $this->fileKkUrl,
                    'id_kos'         => $this->idKos,
                    'jenis_mutasi'   => $this->jenisMutasi,
                    'tanggal_mutasi' => $this->tanggalMutasi,
                ]);

            if ($response->successful() && $response->json('success') === true) {
                Log::info('Berhasil sync mutasi ' . strtoupper($this->jenisMutasi) . ' via Job ke pelaporan');
            } else {
                Log::error('Gagal sync mutasi ' . strtoupper($this->jenisMutasi) . ' via Job ke pelaporan: ' . $response->json('message'));
            }
        } catch (\Exception $e) {
            Log::error('Job API Sync Mutasi gagal: ' . $e->getMessage());
        }
    }
}
