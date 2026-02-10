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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices');
            $table->timestamp('payment_date')->useCurrent();
            $table->decimal('amount_paid', 10, 2);
            $table->string('method', 50)->nullable();
            $table->string('sumber', 50)->nullable();
            $table->string('transaction_id')->unique()->nullable();
            $table->enum('status', ['sukses','gagal','pending']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
