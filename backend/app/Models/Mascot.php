<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Mascot extends Model
{
    use HasFactory, HasUuids;

    public const DEFAULT_ID = '10000002-0000-4000-8000-000000000001';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'avatar_url',
        'description',
        'unlock_cost',
        'rarity',
        'category',
    ];

    protected $casts = [
        'id' => 'string',
        'unlock_cost' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_mascots')
            ->withPivot(['is_active', 'accessories', 'unlocked_at']);
    }
}
