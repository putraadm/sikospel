<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemilik extends Model
{
    protected $table = 'pemilik';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'user_id',
        'name',
        'no_wa',
        'address',
    ];

    public function kos()
    {
        return $this->hasMany(Kos::class, 'owner_id', 'user_id');
    }
}
