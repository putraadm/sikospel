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
            // Remove monthly_rate column
            $table->dropColumn('monthly_rate');
            
            // Add type_room_id foreign key
            $table->foreignId('type_room_id')->nullable()->after('kos_id')->constrained('type_rooms')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Drop type_room_id foreign key and column
            $table->dropForeign(['type_room_id']);
            $table->dropColumn('type_room_id');
            
            // Re-add monthly_rate column
            $table->decimal('monthly_rate', 10, 2)->after('room_number');
        });
    }
};
