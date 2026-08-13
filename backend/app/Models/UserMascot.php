<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMascot extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'mascot_id',
        'is_active',
        'accessories',
        'unlocked_at',
    ];

    protected $casts = [
        'user_id' => 'string',
        'mascot_id' => 'string',
        'is_active' => 'boolean',
        'accessories' => 'array',
        'unlocked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mascot(): BelongsTo
    {
        return $this->belongsTo(Mascot::class);
    }
}
