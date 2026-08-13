<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'content',
        'video_url',
        'duration_minutes',
        'order',
        'xp_reward',
        'is_preview',
    ];

    protected $casts = [
        'id' => 'string',
        'course_id' => 'string',
        'duration_minutes' => 'integer',
        'order' => 'integer',
        'xp_reward' => 'integer',
        'is_preview' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }
}
