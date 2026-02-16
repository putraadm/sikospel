<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeKamar extends Model
{
    protected $table = 'type_kamars';

    protected $fillable = [
        'nama',
        'deskripsi',
        'harga',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class, 'type_kamar_id', 'id');
    }
}
