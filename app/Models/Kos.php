<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kos extends Model
{
    use SoftDeletes;
    
    protected $table = 'kos';

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'address',
        'image',
        'description',
        'gender_type',
    ];

    public function owner()
    {
        return $this->belongsTo(Pemilik::class, 'owner_id', 'user_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
