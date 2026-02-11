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

    public function penyewaan()
    {
        return $this->hasMany(Penyewaan::class, 'penghuni_id', 'user_id');
    }

    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranKos::class, 'calon_penghuni_id', 'user_id');
    }
}
