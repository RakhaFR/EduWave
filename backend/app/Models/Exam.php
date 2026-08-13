<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'course_id',
        'lesson_id',
        'title',
        'time_limit_sec',
        'passing_score',
        'max_attempts',
        'pearls_reward',
    ];

    protected $casts = [
        'id' => 'string',
        'course_id' => 'string',
        'lesson_id' => 'string',
        'time_limit_sec' => 'integer',
        'passing_score' => 'integer',
        'max_attempts' => 'integer',
        'pearls_reward' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }
}
