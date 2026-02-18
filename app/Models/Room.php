<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'kos_id',
        'room_number',
        'type_kamar_id',
        'status',
        'billing_date',
        'description',
    ];

    public function kos()
    {
        return $this->belongsTo(Kos::class, 'kos_id', 'id');
    }

    public function typeKamar()
    {
        return $this->belongsTo(TypeKamar::class, 'type_kamar_id', 'id');
    }

    // Accessor to get images from typeKamar
    public function getImagesAttribute()
    {
        return $this->typeKamar ? $this->typeKamar->images : collect([]);
    }

    public function currentPenyewaan()
    {
        return $this->hasOne(Penyewaan::class, 'room_id')->where('status', 'aktif');
    }

    public function currentPenghuni()
    {
        return $this->hasOneThrough(
            Penghuni::class,
            Penyewaan::class,
            'room_id',     // Foreign key on penyewaan table...
            'user_id',     // Foreign key on penghuni table...
            'id',          // Local key on rooms table...
            'penghuni_id'  // Local key on penyewaan table...
        )->where('penyewaan.status', 'aktif');
    }
}
