class PelaporanService{
    private function syncMutasiKePelaporan($penghuni, $idKos, $jenisMutasi)
    {
        try {
            $payload = [
                'id_penghuni' => $penghuni->id,
                'nama' => $penghuni->nama,
                'no_wa' => $penghuni->no_wa,
                'agama' => $penghuni->agama,
                'file_ktp' => $penghuni->file_path_ktp
                    ? asset('storage/' . $penghuni->file_path_ktp)
                    : null,
                'file_kk' => $penghuni->file_path_kk
                    ? asset('storage/' . $penghuni->file_path_kk)
                    : null,
                'id_kos' => $idKos,
                'jenis_mutasi' => $jenisMutasi,
                'tanggal_mutasi' => now()->toDateString(),
            ];
        
            $response = Http::timeout(5)
                ->withToken(env('API_PELAPORAN_TOKEN'))
                ->post(env('API_PELAPORAN_URL') . '/sync-mutasi', $payload);
        
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