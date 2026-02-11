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
        Schema::create('pendaftaran_kos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kos_id')->constrained('kos')->onDelete('cascade');
            $table->unsignedBigInteger('calon_penghuni_id')->nullable();

            // Data pribadi calon penghuni (diisi saat mendaftar)
            $table->string('nama');
            $table->string('no_wa', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->string('agama', 50)->nullable();
            $table->string('file_path_ktp')->nullable();
            $table->string('file_path_kk')->nullable();

            // Data pendaftaran
            $table->date('start_date')->nullable();
            $table->foreignId('assigned_room_id')->nullable()->constrained('rooms')->onDelete('set null');
            $table->enum('status', ['menunggu', 'diterima', 'ditolak', 'dibatalkan'])->default('menunggu');
            $table->string('generated_password_plain')->nullable(); // plain text password sementara
            $table->text('notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            // FK ke penghuni (diisi setelah approval, saat user + penghuni dibuat)
            $table->foreign('calon_penghuni_id')->references('user_id')->on('penghuni')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_kos');
    }
};
