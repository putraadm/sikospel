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
            \DB::statement("ALTER TABLE penghuni MODIFY COLUMN status_penghuni ENUM('penghuni', 'pra penghuni', 'keluar') DEFAULT 'pra penghuni'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penghuni', function (Blueprint $table) {
            \DB::statement("ALTER TABLE penghuni MODIFY COLUMN status_penghuni ENUM('penghuni', 'pra penghuni') DEFAULT 'pra penghuni'");
        });
    }
};
