<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeKamar extends Model
{
    protected $table = 'type_kamars';

    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'harga',
        'facilities',
    ];

    protected $casts = [
        'facilities' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'type_kamar_id', 'id');
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class, 'type_kamar_id', 'id');
    }
}
