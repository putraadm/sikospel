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
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropForeign(['type_room_id']);
        });

        Schema::rename('type_rooms', 'type_kamars');

        Schema::table('type_kamars', function (Blueprint $table) {
            $table->renameColumn('cost', 'harga');
            $table->text('deskripsi')->nullable()->after('nama');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->renameColumn('type_room_id', 'type_kamar_id');
            $table->foreign('type_kamar_id')->references('id')->on('type_kamars')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropForeign(['type_kamar_id']);
            $table->renameColumn('type_kamar_id', 'type_room_id');
            $table->text('description')->nullable()->after('status');
        });

        Schema::table('type_kamars', function (Blueprint $table) {
            $table->renameColumn('harga', 'cost');
            $table->dropColumn('deskripsi');
        });

        Schema::rename('type_kamars', 'type_rooms');

        Schema::table('rooms', function (Blueprint $table) {
             $table->foreign('type_room_id')->references('id')->on('type_rooms')->onDelete('cascade');
        });
    }
};
