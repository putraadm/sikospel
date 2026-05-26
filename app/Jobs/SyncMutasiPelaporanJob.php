<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SyncMutasiPelaporanJob implements ShouldQueue
{
    use Queueable;

    protected $idPenghuni;
    protected $nik;
    protected $nama;
    protected $noWa;
    protected $agama;
    protected $fileKtpPath;
    protected $fileKkPath;
    protected $idKos;
    protected $jenisMutasi;
    protected $tanggalMutasi;
    protected $rating;
    protected $keteranganRating;

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
        $fileKkPath,
        $idKos,
        $jenisMutasi,
        $tanggalMutasi,
        $rating = null,
        $keteranganRating = null
    ) {
        $this->idPenghuni = $idPenghuni;
        $this->nik = $nik;
        $this->nama = $nama;
        $this->noWa = $noWa;
        $this->agama = $agama;
        $this->fileKtpPath = $fileKtpPath;
        $this->fileKkPath = $fileKkPath;
        $this->idKos = $idKos;
        $this->jenisMutasi = $jenisMutasi;
        $this->tanggalMutasi = $tanggalMutasi;
        $this->rating = $rating;
        $this->keteranganRating = $keteranganRating;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $url = config('services.pelaporan.url') . '/sync/mutasi';
        $token = config('services.pelaporan.token');

        try {
            $request = Http::timeout(20)->withToken($token)->asMultipart();

            // Normalize tanggal_mutasi to MySQL-safe datetime format
            $tanggalMutasi = $this->tanggalMutasi;
            if ($tanggalMutasi instanceof \Carbon\Carbon) {
                $tanggalMutasi = $tanggalMutasi->format('Y-m-d H:i:s');
            } elseif (is_string($tanggalMutasi) && (str_contains($tanggalMutasi, 'T') || str_contains($tanggalMutasi, 'Z'))) {
                try {
                    $tanggalMutasi = \Carbon\Carbon::parse($tanggalMutasi)->format('Y-m-d H:i:s');
                } catch (\Exception $e) {
                    // Fallback to original if parsing fails
                }
            }

            $data = [
                'id_penghuni'    => $this->idPenghuni,
                'nik'            => $this->nik,
                'nama'           => $this->nama,
                'no_wa'          => $this->noWa,
                'agama'          => $this->agama,
                'id_kos'         => $this->idKos,
                'jenis_mutasi'   => $this->jenisMutasi,
                'tanggal_mutasi' => $tanggalMutasi,
                'rating'         => $this->rating,
                'keterangan_rating' => $this->keteranganRating,
            ];

            if ($this->fileKtpPath && Storage::disk('public')->exists($this->fileKtpPath)) {
                $request->attach(
                    'file_ktp', 
                    Storage::disk('public')->get($this->fileKtpPath), 
                    basename($this->fileKtpPath)
                );
            }

            if ($this->fileKkPath && Storage::disk('public')->exists($this->fileKkPath)) {
                $request->attach(
                    'file_kk', 
                    Storage::disk('public')->get($this->fileKkPath), 
                    basename($this->fileKkPath)
                );
            }

            $response = $request->post($url, $data);

            if ($response->successful() && $response->json('success') === true) {
                Log::info('Berhasil sync mutasi ' . strtoupper($this->jenisMutasi) . ' via Job ke pelaporan');
            } else {
                Log::error('Gagal sync mutasi ' . strtoupper($this->jenisMutasi) . ' via Job ke pelaporan. ' . 
                    'Status: ' . $response->status() . ' - Response: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Job API Sync Mutasi gagal: ' . $e->getMessage());
        }
    }
}
