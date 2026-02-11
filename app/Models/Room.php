<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'kos_id',
        'room_number',
        'monthly_rate',
        'status',
        'description',
        'image',
    ];

    public function kos()
    {
        return $this->belongsTo(Kos::class, 'kos_id', 'id');
    }
}
