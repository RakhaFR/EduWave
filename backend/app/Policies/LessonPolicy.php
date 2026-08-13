<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    /**
     * Create a lesson - instructor or admin only.
     * Lessons are created under a course, so ownership is checked via the course's instructor_id.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['instructor', 'admin']);
    }

    /**
     * Update a lesson - admin or owning instructor of the parent course.
     */
    public function update(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin' || $lesson->course->instructor_id === $user->id;
    }

    /**
     * Destroy a lesson - admin or owning instructor of the parent course.
     */
    public function destroy(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin' || $lesson->course->instructor_id === $user->id;
    }
}
