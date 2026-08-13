<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyRoom extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'topic',
        'host_user_id',
        'max_capacity',
        'is_public',
        'status',
    ];

    protected $casts = [
        'id' => 'string',
        'host_user_id' => 'string',
        'max_capacity' => 'integer',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(RoomMessage::class, 'room_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'study_room_participants', 'room_id', 'user_id');
    }
}
