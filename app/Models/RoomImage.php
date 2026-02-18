<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomImage extends Model
{
    protected $table = 'room_images';

    protected $fillable = [
        'type_kamar_id',
        'gambar',
    ];

    public function typeKamar()
    {
        return $this->belongsTo(TypeKamar::class, 'type_kamar_id', 'id');
    }
}
