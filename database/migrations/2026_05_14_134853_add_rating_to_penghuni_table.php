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
            $table->enum('rating', ['baik', 'buruk'])->nullable()->after('status_penghuni');
            $table->text('keterangan_rating')->nullable()->after('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penghuni', function (Blueprint $table) {
            $table->dropColumn(['rating', 'keterangan_rating']);
        });
    }
};
