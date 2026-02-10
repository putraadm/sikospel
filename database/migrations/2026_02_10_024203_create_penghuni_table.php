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
        Schema::create('penghuni', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->string('name');
            $table->string('no_wa', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('religion', 50)->nullable();
            $table->string('file_path_kk')->nullable();
            $table->string('file_path_ktp')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penghuni');
    }
};
