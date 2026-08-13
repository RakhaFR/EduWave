<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends ApiController
{
    /**
     * Enroll the authenticated user in a course.
     * Prevents double-booking via the unique(user_id, course_id) DB constraint
     * and an explicit pre-check to return a clean error.
     */
    public function enroll(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        // Course must be published
        if ($course->status !== 'published') {
            return $this->error(
                'COURSE_NOT_AVAILABLE',
                'Kursus ini tidak tersedia untuk pendaftaran.',
                422
            );
        }

        // Prevent double-booking
        $existing = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return $this->error(
                'ALREADY_ENROLLED',
                'Anda sudah terdaftar di kursus ini.',
                409
            );
        }

        $enrollment = Enrollment::create([
            'user_id'     => $user->id,
            'course_id'   => $course->id,
            'progress_pct'=> 0,
            'status'      => 'enrolled',
            'enrolled_at' => now(),
        ]);

        return $this->success([
            'enrollment' => $this->formatEnrollment($enrollment, $course),
        ], '', 201);
    }

    /**
     * Unenroll (drop) the authenticated user from a course.
     */
    public function unenroll(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return $this->error(
                'NOT_ENROLLED',
                'Anda tidak terdaftar di kursus ini.',
                404
            );
        }

        $enrollment->update(['status' => 'dropped']);
        $enrollment->delete();

        return $this->success([], '', 200);
    }

    /**
     * Get enrollment progress for the authenticated user in a course.
     */
    public function progress(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['enrolled', 'completed'])
            ->first();

        if (!$enrollment) {
            return $this->error(
                'NOT_ENROLLED',
                'Anda tidak terdaftar di kursus ini.',
                404
            );
        }

        // Per-lesson progress
        $lessonIds = $course->lessons()->pluck('id');

        $completedLessons = LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $lessonIds)
            ->whereNotNull('completed_at')
            ->pluck('lesson_id')
            ->all();

        $lessons = $course->lessons()->orderBy('order')->get()->map(fn ($lesson) => [
            'id'           => $lesson->id,
            'title'        => $lesson->title,
            'order'        => $lesson->order,
            'is_completed' => in_array($lesson->id, $completedLessons),
        ]);

        return $this->success([
            'enrollment'       => $this->formatEnrollment($enrollment, $course),
            'lessons_progress' => $lessons,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function formatEnrollment(Enrollment $enrollment, Course $course): array
    {
        return [
            'id'           => $enrollment->id,
            'course_id'    => $enrollment->course_id,
            'course_title' => $course->title,
            'user_id'      => $enrollment->user_id,
            'progress_pct' => (float) $enrollment->progress_pct,
            'status'       => $enrollment->status,
            'enrolled_at'  => $enrollment->enrolled_at,
            'completed_at' => $enrollment->completed_at,
        ];
    }
}
