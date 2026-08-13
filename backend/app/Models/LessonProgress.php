<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'lesson_progress';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'watch_seconds',
        'completed_at',
    ];

    protected $casts = [
        'id' => 'string',
        'user_id' => 'string',
        'lesson_id' => 'string',
        'watch_seconds' => 'integer',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
