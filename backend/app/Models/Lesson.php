<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory, HasUuids;

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

    /**
     * Mark lesson as complete for user and award XP only on first completion.
     */
    public function markComplete(User $user, int $watchSeconds = 0): array
    {
        $progress = LessonProgress::firstOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $this->id],
            ['watch_seconds' => 0]
        );

        $isFirstCompletion = false;
        $xpAwarded = 0;

        if ($watchSeconds > $progress->watch_seconds) {
            $progress->watch_seconds = $watchSeconds;
        }

        if (is_null($progress->completed_at)) {
            $progress->completed_at = now();
            $isFirstCompletion = true;

            if ($this->xp_reward > 0) {
                $user->increment('xp', $this->xp_reward);
                $xpAwarded = $this->xp_reward;
            }
        }

        $progress->save();

        return [
            'progress' => $progress,
            'is_first_completion' => $isFirstCompletion,
            'xp_awarded' => $xpAwarded,
        ];
    }
}
