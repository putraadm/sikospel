<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PelaporanService{
    private function syncMutasiKePelaporan($penghuni, $idKos, $jenisMutasi)
    {
        try {
            $request = Http::timeout(10)->withToken(env('API_PELAPORAN_TOKEN'));

            $data = [
                'id_penghuni' => $penghuni->id,
                'nik' => $penghuni->nik,
                'nama' => $penghuni->nama,
                'no_wa' => $penghuni->no_wa,
                'agama' => $penghuni->agama,
                'id_kos' => $idKos,
                'jenis_mutasi' => $jenisMutasi,
                'tanggal_mutasi' => now()->toDateString(),
            ];

            if ($penghuni->file_path_ktp && \Storage::disk('public')->exists($penghuni->file_path_ktp)) {
                $request->attach(
                    'file_ktp',
                    \Storage::disk('public')->get($penghuni->file_path_ktp),
                    basename($penghuni->file_path_ktp)
                );
            }

            if ($penghuni->file_path_kk && \Storage::disk('public')->exists($penghuni->file_path_kk)) {
                $request->attach(
                    'file_kk',
                    \Storage::disk('public')->get($penghuni->file_path_kk),
                    basename($penghuni->file_path_kk)
                );
            }

            $response = $request->post(env('API_PELAPORAN_URL') . '/sync-mutasi', $data);

            if (!$response->successful()) {
                Log::error('Sync mutasi gagal', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        
        } catch (\Exception $e) {
            Log::error('Error koneksi ke APP2', ['error' => $e->getMessage()]);
        }
    }
}