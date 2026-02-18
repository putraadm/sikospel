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
        // Update room_images to relate to type_kamars instead of rooms
        Schema::table('room_images', function (Blueprint $table) {
            
            if (Schema::hasColumn('room_images', 'room_id')) {
                // Drop foreign key if it exists
                try {
                    $table->dropForeign(['room_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist or has a different name
                }
                $table->dropColumn('room_id');
            }

            if (!Schema::hasColumn('room_images', 'type_kamar_id')) {
                 $table->foreignId('type_kamar_id')->constrained('type_kamars')->onDelete('cascade');
            }
        });

        // Remove image column from rooms as it will display images based on type
        Schema::table('rooms', function (Blueprint $table) {
            if (Schema::hasColumn('rooms', 'image')) {
                $table->dropColumn('image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('room_images', function (Blueprint $table) {
            $table->dropForeign(['type_kamar_id']);
            $table->dropColumn('type_kamar_id');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
        });

        Schema::table('rooms', function (Blueprint $table) {
            $table->string('image')->nullable();
        });
    }
};
