<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    /**
     * Create a course - instructor or admin only.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['instructor', 'admin']);
    }

    /**
     * Update a course - admin or owning instructor only.
     * Traced to Permission Matrix: "PUT /courses/:id" → ✅ Instructor (own), ✅ Admin.
     */
    public function update(User $user, Course $course): bool
    {
        return $user->role === 'admin' || $course->instructor_id === $user->id;
    }

    /**
     * Destroy a course - admin or owning instructor only.
     */
    public function destroy(User $user, Course $course): bool
    {
        return $user->role === 'admin' || $course->instructor_id === $user->id;
    }
}
