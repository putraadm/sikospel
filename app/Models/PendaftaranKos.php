<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendaftaranKos extends Model
{
    protected $fillable = [
        'kos_id',
        'calon_penghuni_id',
        'nama',
        'no_wa',
        'alamat',
        'agama',
        'file_path_ktp',
        'file_path_kk',
        'start_date',
        'assigned_room_id',
        'status',
        'generated_password_plain',
        'notes',
        'verified_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'start_date' => 'date',
    ];

    public function kos()
    {
        return $this->belongsTo(Kos::class);
    }

    public function calonPenghuni()
    {
        return $this->belongsTo(Penghuni::class, 'calon_penghuni_id', 'user_id');
    }

    public function assignedRoom()
    {
        return $this->belongsTo(Room::class, 'assigned_room_id');
    }
}
