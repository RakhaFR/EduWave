<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomMessage extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'room_id',
        'user_id',
        'content',
        'type',
        'sent_at',
    ];

    protected $casts = [
        'id' => 'string',
        'room_id' => 'string',
        'user_id' => 'string',
        'sent_at' => 'datetime',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(StudyRoom::class, 'room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
