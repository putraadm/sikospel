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
        Schema::table('pendaftaran_kos', function (Blueprint $table) {
            $table->foreignId('type_kamar_id')->nullable()->after('assigned_room_id')->constrained('type_kamars')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_kos', function (Blueprint $table) {
            $table->dropForeign(['type_kamar_id']);
            $table->dropColumn('type_kamar_id');
        });
    }
};
