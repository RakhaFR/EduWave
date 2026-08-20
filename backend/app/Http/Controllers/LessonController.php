<?php

namespace App\Http\Controllers;

use App\Http\Requests\Lesson\StoreLessonRequest;
use App\Http\Requests\Lesson\UpdateLessonRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends ApiController
{
    /**
     * List lessons for a course.
     * Enrolled students see all; others only see preview lessons.
     */
    public function index(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();
        $isStaff = $user && in_array($user->role, ['admin', 'instructor']);

        $enrolled = $user && Enrollment::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['enrolled', 'completed'])
            ->exists();

        $query = $course->lessons()->orderBy('order');

        if (! $isStaff && ! $enrolled) {
            $query->where('is_preview', true);
        }

        $lessons = $query->get()->map(fn ($lesson) => $this->formatLesson($lesson));

        return $this->success(['lessons' => $lessons]);
    }

    /**
     * Show a single lesson.
     * Requires enrollment unless lesson is_preview or user is admin/instructor.
     * Also checks sequential prerequisite order for enrolled students.
     */
    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();
        $isStaff = $user && in_array($user->role, ['admin', 'instructor']);

        if (! $isStaff && ! $lesson->is_preview) {
            $enrolled = $user && Enrollment::where('user_id', $user->id)
                ->where('course_id', $lesson->course_id)
                ->whereIn('status', ['enrolled', 'completed'])
                ->exists();

            if (! $enrolled) {
                return $this->error(
                    'LESSON_ACCESS_DENIED',
                    'Anda harus mendaftar ke kursus ini untuk mengakses pelajaran ini.',
                    403
                );
            }

            // Sequential lock check: ensure all prior lessons in the course are completed
            $uncompletedPriorCount = Lesson::where('course_id', $lesson->course_id)
                ->where('order', '<', $lesson->order)
                ->whereDoesntHave('lessonProgress', function ($query) use ($user) {
                    $query->where('user_id', $user->id)->whereNotNull('completed_at');
                })
                ->count();

            if ($uncompletedPriorCount > 0) {
                return $this->error(
                    'LESSON_LOCKED',
                    'Selesaikan lesson sebelumnya terlebih dahulu sebelum mengakses lesson ini.',
                    403
                );
            }
        }

        $lesson->load('course:id,title,instructor_id');

        return $this->success(['lesson' => $this->formatLesson($lesson, full: true)]);
    }

    /**
     * Mark a lesson as complete for the authenticated user.
     * Awards XP only on first completion (idempotent via Lesson::markComplete).
     * Then recalculates enrollment progress and awards course pearls if 100%.
     */
    public function complete(Request $request, Lesson $lesson): JsonResponse
    {
        $user = $request->user();

        // Must be enrolled (or admin/instructor)
        $isStaff = in_array($user->role, ['admin', 'instructor']);
        $enrollment = Enrollment::where('user_id', $user->id)
            ->where('course_id', $lesson->course_id)
            ->whereIn('status', ['enrolled', 'completed'])
            ->first();

        if (! $isStaff && ! $enrollment) {
            return $this->error(
                'NOT_ENROLLED',
                'Anda harus mendaftar ke kursus ini untuk menyelesaikan pelajaran.',
                403
            );
        }

        // Sequential check on complete endpoint as well
        if (! $isStaff) {
            $uncompletedPriorCount = Lesson::where('course_id', $lesson->course_id)
                ->where('order', '<', $lesson->order)
                ->whereDoesntHave('lessonProgress', function ($query) use ($user) {
                    $query->where('user_id', $user->id)->whereNotNull('completed_at');
                })
                ->count();

            if ($uncompletedPriorCount > 0) {
                return $this->error(
                    'LESSON_LOCKED',
                    'Selesaikan lesson sebelumnya terlebih dahulu sebelum mengakses lesson ini.',
                    403
                );
            }
        }

        $request->validate([
            'watch_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
        ]);

        $watchSeconds = (int) $request->input('watch_seconds', 0);

        // Award XP idempotently (only on first completion)
        $lessonResult = $lesson->markComplete($user, $watchSeconds);

        // Recalculate course progress and award pearls if newly completed
        $progressResult = [];
        if ($enrollment) {
            $enrollment->load('course', 'user');
            $progressResult = $enrollment->recalculateProgress();
        }

        return $this->success([
            'lesson_id' => $lesson->id,
            'is_first_completion' => $lessonResult['is_first_completion'],
            'xp_awarded' => $lessonResult['xp_awarded'],
            'progress' => [
                'watch_seconds' => $lessonResult['progress']->watch_seconds,
                'completed_at' => $lessonResult['progress']->completed_at,
            ],
            'enrollment' => $enrollment ? [
                'progress_pct' => $progressResult['progress_pct'],
                'status' => $progressResult['status'],
                'transitioned_to_completed' => $progressResult['transitioned_to_completed'],
                'pearls_awarded' => $progressResult['pearls_awarded'],
            ] : null,
        ]);
    }

    /**
     * Create a new lesson (instructor or admin).
     */
    public function store(StoreLessonRequest $request): JsonResponse
    {
        $this->authorize('create', Lesson::class);

        $course = Course::findOrFail($request->validated()['course_id']);

        // Ownership check: instructor must own the parent course
        if ($request->user()->role === 'instructor'
            && $course->instructor_id !== $request->user()->id) {
            return $this->error(
                'LESSON_FORBIDDEN',
                'Anda tidak memiliki izin untuk menambah pelajaran ke kursus ini.',
                403
            );
        }

        $lesson = Lesson::create($request->validated());

        return $this->success(['lesson' => $this->formatLesson($lesson)], '', 201);
    }

    /**
     * Update a lesson (admin or owning instructor).
     */
    public function update(UpdateLessonRequest $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('update', $lesson);

        $validated = $request->validated();

        if (isset($validated['course_id']) && $request->user()->role === 'instructor') {
            $targetCourse = Course::findOrFail($validated['course_id']);

            if ($targetCourse->instructor_id !== $request->user()->id) {
                return $this->error('LESSON_FORBIDDEN', 'Anda tidak memiliki izin untuk memindahkan pelajaran ke kursus ini.', 403);
            }
        }

        $lesson->update($validated);

        return $this->success(['lesson' => $this->formatLesson($lesson)]);
    }

    /**
     * Delete a lesson (admin or owning instructor).
     */
    public function destroy(Lesson $lesson): JsonResponse
    {
        $this->authorize('destroy', $lesson);

        $lesson->delete();

        return $this->success([], '', 200);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function formatLesson(Lesson $lesson, bool $full = false): array
    {
        $data = [
            'id' => $lesson->id,
            'course_id' => $lesson->course_id,
            'title' => $lesson->title,
            'type' => $lesson->type,
            'duration_minutes' => $lesson->duration_minutes,
            'order' => $lesson->order,
            'xp_reward' => $lesson->xp_reward,
            'is_preview' => $lesson->is_preview,
            'created_at' => $lesson->created_at,
            'updated_at' => $lesson->updated_at,
        ];

        if ($full) {
            $data['content'] = $lesson->content;
            $data['video_url'] = $lesson->video_url;
        }

        return $data;
    }
}
