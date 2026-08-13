<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    /**
     * Create an exam - instructor or admin only.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['instructor', 'admin']);
    }

    /**
     * Update an exam - admin or owning instructor of the parent course.
     */
    public function update(User $user, Exam $exam): bool
    {
        return $user->role === 'admin' || $exam->course->instructor_id === $user->id;
    }

    /**
     * Destroy an exam - admin or owning instructor of the parent course.
     */
    public function destroy(User $user, Exam $exam): bool
    {
        return $user->role === 'admin' || $exam->course->instructor_id === $user->id;
    }
}
