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

    public function currentPenyewaan()
    {
        return $this->hasOne(Penyewaan::class, 'penghuni_id', 'user_id')->where('status', 'aktif');
    }

    public function currentRoom()
    {
        // For convenience, but since one person can have only one active tenancy in this system logic
        return $this->hasOneThrough(
            Room::class,
            Penyewaan::class,
            'penghuni_id', // Foreign key on penyewaan table...
            'id',          // Foreign key on rooms table...
            'user_id',     // Local key on penghuni table...
            'room_id'      // Local key on penyewaan table...
        )->where('penyewaan.status', 'aktif');
    }

    public function pendaftaran()
    {
        return $this->hasMany(PendaftaranKos::class, 'calon_penghuni_id', 'user_id');
    }
}
