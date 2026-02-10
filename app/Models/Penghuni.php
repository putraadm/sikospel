<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penghuni extends Model
{
    protected $table = 'penghuni';
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'name',
        'no_wa',
        'address',
        'religion',
        'file_path_kk',
        'file_path_ktp',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


}
