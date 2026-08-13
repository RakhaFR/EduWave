<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'course_id',
        'progress_pct',
        'status',
        'enrolled_at',
        'completed_at',
    ];

    protected $casts = [
        'id' => 'string',
        'user_id' => 'string',
        'course_id' => 'string',
        'progress_pct' => 'decimal:2',
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Recalculate progress percentage based on completed lessons.
     * Transitions enrollment to 'completed' and awards course pearls_reward ONCE when progress hits 100%.
     */
    public function recalculateProgress(): array
    {
        $totalLessons = $this->course->lessons()->count();

        if ($totalLessons === 0) {
            $this->progress_pct = 100.00;
        } else {
            $lessonIds = $this->course->lessons()->pluck('id');
            $completedLessonsCount = LessonProgress::where('user_id', $this->user_id)
                ->whereIn('lesson_id', $lessonIds)
                ->whereNotNull('completed_at')
                ->count();

            $this->progress_pct = round(($completedLessonsCount / $totalLessons) * 100, 2);
        }

        $transitionedToCompleted = false;
        $pearlsAwarded = 0;

        if ($this->progress_pct >= 100.00 && $this->status !== 'completed') {
            $this->status = 'completed';
            $this->completed_at = now();
            $transitionedToCompleted = true;

            if ($this->course->pearls_reward > 0) {
                $this->user->increment('pearls', $this->course->pearls_reward);
                $pearlsAwarded = $this->course->pearls_reward;
            }
        }

        $this->save();

        return [
            'progress_pct' => (float) $this->progress_pct,
            'status' => $this->status,
            'transitioned_to_completed' => $transitionedToCompleted,
            'pearls_awarded' => $pearlsAwarded,
        ];
    }
}
