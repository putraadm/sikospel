<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendaftaranKos extends Model
{
    protected $fillable = [
        'kos_id',
        'calon_penghuni_id',
        'preferred_room_id',
        'status',
        'notes',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function kos()
    {
        return $this->belongsTo(Kos::class);
    }

    public function calonPenghuni()
    {
        return $this->belongsTo(Penghuni::class, 'calon_penghuni_id', 'user_id');
    }

    public function preferredRoom()
    {
        return $this->belongsTo(Room::class, 'preferred_room_id');
    }
}
