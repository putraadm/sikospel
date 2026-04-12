<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncKosPelaporanJob implements ShouldQueue
{
    use Queueable;

    protected $idKos;
    protected $idPemilik;
    protected $namaPemilik;
    protected $noWaPemilik;
    protected $namaKos;
    protected $alamat;

    /**
     * Create a new job instance.
     */
    public function __construct(
        $idKos,
        $idPemilik,
        $namaPemilik,
        $noWaPemilik,
        $namaKos,
        $alamat
    ) {
        $this->idKos = $idKos;
        $this->idPemilik = $idPemilik;
        $this->namaPemilik = $namaPemilik;
        $this->noWaPemilik = $noWaPemilik;
        $this->namaKos = $namaKos;
        $this->alamat = $alamat;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $url = config('services.pelaporan.url') . '/sync/kos';
        $token = config('services.pelaporan.token');

        try {
            $response = Http::timeout(20)
                ->withToken($token)
                ->acceptJson()
                ->post($url, [
                    'id_kos'        => $this->idKos,
                    'id_pemilik'    => $this->idPemilik,
                    'nama_pemilik'  => $this->namaPemilik,
                    'no_wa_pemilik' => $this->noWaPemilik,
                    'nama_kos'      => $this->namaKos,
                    'alamat'        => $this->alamat,
                ]);

            if ($response->successful() && $response->json('success') === true) {
                Log::info('Berhasil sync data KOS via Job ke pelaporan: ' . $this->namaKos);
            } else {
                Log::error('Gagal sync data KOS via Job ke pelaporan. ' . 
                    'Status: ' . $response->status() . ' - Response: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Job API Sync Kos gagal: ' . $e->getMessage());
        }
    }
}
