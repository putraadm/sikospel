<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'tenancy_id',
        'amount',
        'due_date',
        'billing_period',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
        'billing_period' => 'date',
        'amount' => 'decimal:2',
    ];

    public function tenancy()
    {
        return $this->belongsTo(Penyewaan::class, 'tenancy_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
