<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;

class ExamAttemptPolicy
{
    /**
     * Create an exam attempt - check attempt limit.
     * Traced to Permission Matrix: "POST /exams/:id/attempts" → ✅ Student (enrolled), ✅ Instructor, ✅ Admin.
     * This policy enforces that the user hasn't exceeded max_attempts.
     */
    public function create(User $user, Exam $exam): bool
    {
        $attemptCount = ExamAttempt::where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->count();

        return $attemptCount < $exam->max_attempts;
    }

    /**
     * View an exam attempt - own attempt or admin only.
     */
    public function view(User $user, ExamAttempt $attempt): bool
    {
        return $user->role === 'admin' || $attempt->user_id === $user->id;
    }
}
