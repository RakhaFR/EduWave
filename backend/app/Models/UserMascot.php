<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserMascot extends Pivot
{
    use HasFactory;

    protected $table = 'user_mascots';

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
