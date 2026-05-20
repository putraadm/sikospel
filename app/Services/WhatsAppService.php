<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a WhatsApp message.
     *
     * @param string $target
     * @param string $message
     * @return bool
     */
    public static function sendMessage($target, $message)
    {
        if (empty($target)) {
            Log::warning('WhatsApp target is empty, message not sent: ' . $message);
            return false;
        }

        // Standardize formatting for Indonesian numbers (e.g. replacing '08' with '628')
        // Fonnte works best with international format, let's keep it robust but keep original if already standardized
        $cleanTarget = preg_replace('/[^0-9]/', '', $target);
        if (str_starts_with($cleanTarget, '08')) {
            $cleanTarget = '628' . substr($cleanTarget, 2);
        }

        $token = config('services.wa.token');

        if (empty($token)) {
            Log::info("WhatsApp simulated to {$cleanTarget} (No token configured):\n{$message}");
            return true;
        }

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->post('https://api.fonnte.com/send', [
                    'target' => $cleanTarget,
                    'message' => $message,
                ]);

            if ($response->successful()) {
                Log::info("WhatsApp successfully sent to {$cleanTarget}");
                return true;
            }

            Log::error("Fonnte WA API failed to {$cleanTarget}. Status: " . $response->status() . " Response: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("Error sending WA to {$cleanTarget}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send new account credentials to the tenant.
     *
     * @param \App\Models\Penghuni $penghuni
     * @param string $plainPassword
     * @return bool
     */
    public static function sendNewAccountNotification($penghuni, $plainPassword)
    {
        if (empty($penghuni->no_wa)) {
            Log::warning("Cannot send new account notification to {$penghuni->name}: no_wa is empty.");
            return false;
        }

        $user = $penghuni->user;
        $username = $user->username ?? '-';
        $email = $user->email ?? '-';

        $message = "Halo *{$penghuni->name}*,\n\n"
                 . "Selamat! Akun Anda untuk aplikasi *SIKOSPEL* telah berhasil dibuat oleh pemilik kos.\n\n"
                 . "Berikut adalah rincian login Anda:\n"
                 . "- *Username:* {$username}\n"
                 . "- *Email:* {$email}\n"
                 . "- *Password:* {$plainPassword}\n\n"
                 . "*PENTING:* Demi keamanan, mohon segera ganti password Anda setelah masuk pertama kali ke dalam aplikasi melalui menu Pengaturan.\n\n"
                 . "Terima kasih.";

        return self::sendMessage($penghuni->no_wa, $message);
    }
}
