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
        Schema::table('kos', function (Blueprint $table) {
            $table->string('midtrans_server_key')->nullable()->after('gender_type');
            $table->string('midtrans_client_key')->nullable()->after('midtrans_server_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kos', function (Blueprint $table) {
            $table->dropColumn(['midtrans_server_key', 'midtrans_client_key']);
        });
    }
};
