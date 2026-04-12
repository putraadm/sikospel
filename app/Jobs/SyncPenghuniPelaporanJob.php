<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncPenghuniPelaporanJob implements ShouldQueue
{
    use Queueable;

    protected $idPenghuni;
    protected $nik;
    protected $nama;
    protected $noWa;
    protected $agama;
    protected $fileKtpPath;
    protected $fileKkPath;

    /**
     * Create a new job instance.
     */
    public function __construct(
        $idPenghuni,
        $nik,
        $nama,
        $noWa,
        $agama,
        $fileKtpPath,
        $fileKkPath
    ) {
        $this->idPenghuni = $idPenghuni;
        $this->nik = $nik;
        $this->nama = $nama;
        $this->noWa = $noWa;
        $this->agama = $agama;
        $this->fileKtpPath = $fileKtpPath;
        $this->fileKkPath = $fileKkPath;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $request = Http::timeout(15)->withToken(env('API_PELAPORAN_TOKEN'));

            $data = [
                'id_penghuni'    => $this->idPenghuni,
                'nik'            => $this->nik,
                'nama'           => $this->nama,
                'no_wa'          => $this->noWa,
                'agama'          => $this->agama,
            ];

            if ($this->fileKtpPath && \Storage::disk('public')->exists($this->fileKtpPath)) {
                $request->attach(
                    'file_ktp', 
                    \Storage::disk('public')->get($this->fileKtpPath), 
                    basename($this->fileKtpPath)
                );
            }

            if ($this->fileKkPath && \Storage::disk('public')->exists($this->fileKkPath)) {
                $request->attach(
                    'file_kk', 
                    \Storage::disk('public')->get($this->fileKkPath), 
                    basename($this->fileKkPath)
                );
            }

            $url = config('services.pelaporan.url') . '/sync/penghuni';
            $token = config('services.pelaporan.token');

            $response = $request->withToken($token)->acceptJson()->post($url, $data);

            if ($response->successful() && $response->json('success') === true) {
                Log::info('Berhasil sync profil PENGHUNI murni via Job ke pelaporan');
            } else {
                Log::error('Gagal sync profil PENGHUNI murni via Job ke pelaporan: ' . $response->json('message'));
            }
        } catch (\Exception $e) {
            Log::error('Job API Sync Penghuni gagal: ' . $e->getMessage());
        }
    }
}
