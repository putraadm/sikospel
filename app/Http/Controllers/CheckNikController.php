<?php

namespace App\Http\Controllers;

use App\Models\Penghuni;
use Illuminate\Http\Request;

class CheckNikController extends Controller
{
    /**
     * Look up a resident by their NIK.
     *
     * @param string $nik
     * @return \Illuminate\Http\JsonResponse
     */
    public function __invoke($nik)
    {
        $penghuni = Penghuni::where('nik', $nik)->first();

        if ($penghuni) {
            return response()->json([
                'success' => true,
                'data' => [
                    'username' => $penghuni->user->username ?? '',
                    'name' => $penghuni->name,
                    'no_wa' => $penghuni->no_wa,
                    'address' => $penghuni->address,
                    'religion' => $penghuni->religion,
                    'file_path_kk' => $penghuni->file_path_kk ? asset('storage/' . $penghuni->file_path_kk) : null,
                    'file_path_ktp' => $penghuni->file_path_ktp ? asset('storage/' . $penghuni->file_path_ktp) : null,
                    'is_existing' => true,
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'NIK tidak ditemukan.'
        ]);
    }
}
