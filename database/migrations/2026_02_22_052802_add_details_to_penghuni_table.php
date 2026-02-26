<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('penghuni', function (Blueprint $table) {
            $table->date('tanggal_daftar')->nullable();
            $table->enum('status_penghuni', ['penghuni', 'pra penghuni'])->default('pra penghuni');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penghuni', function (Blueprint $table) {
            $table->dropColumn(['tanggal_daftar', 'status_penghuni']);
        });
    }
};
