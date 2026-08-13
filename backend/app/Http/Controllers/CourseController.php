<?php

namespace App\Http\Controllers;

use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends ApiController
{
    /**
     * List courses.
     * Public: returns only published courses.
     * Admin/Instructor: returns all statuses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with('instructor:id,full_name,avatar_url')
            ->withCount(['lessons', 'enrollments']);

        // Role-based visibility: non-admin/instructor only see published
        $user = $request->user();
        if (!$user || !in_array($user->role, ['admin', 'instructor'])) {
            $query->where('status', 'published');
        }

        // Filters
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'popular' => $query->orderByDesc('enrollments_count'),
            default   => $query->orderByDesc('created_at'),
        };

        $perPage = min((int) $request->query('per_page', 12), 50);
        $paginator = $query->paginate($perPage);

        return $this->paginated($paginator, fn ($course) => $this->formatCourse($course));
    }

    /**
     * Show a single course with lessons list.
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        // Non-admin/instructor can only see published courses
        $user = $request->user();
        if ((!$user || !in_array($user->role, ['admin', 'instructor'])) && $course->status !== 'published') {
            return $this->error('COURSE_NOT_FOUND', 'Kursus tidak ditemukan.', 404);
        }

        $course->load('instructor:id,full_name,avatar_url')
               ->loadCount(['lessons', 'enrollments']);

        $lessons = $course->lessons()->orderBy('order')->get()->map(fn ($lesson) => [
            'id'               => $lesson->id,
            'title'            => $lesson->title,
            'type'             => $lesson->type,
            'duration_minutes' => $lesson->duration_minutes,
            'order'            => $lesson->order,
            'xp_reward'        => $lesson->xp_reward,
            'is_preview'       => $lesson->is_preview,
        ]);

        return $this->success(array_merge($this->formatCourse($course), ['lessons' => $lessons]));
    }

    /**
     * Create a new course (instructor or admin).
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $this->authorize('create', Course::class);

        $validated = $request->validated();

        // Assign instructor: admin can specify, instructor defaults to self
        if ($request->user()->role === 'instructor') {
            $validated['instructor_id'] = $request->user()->id;
        }

        $course = Course::create($validated);
        $course->load('instructor:id,full_name,avatar_url');
        $course->loadCount(['lessons', 'enrollments']);

        return $this->success($this->formatCourse($course), '', 201);
    }

    /**
     * Update an existing course (admin or owning instructor).
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $this->authorize('update', $course);

        $course->update($request->validated());
        $course->load('instructor:id,full_name,avatar_url');
        $course->loadCount(['lessons', 'enrollments']);

        return $this->success($this->formatCourse($course));
    }

    /**
     * Soft-delete a course (admin or owning instructor).
     */
    public function destroy(Course $course): JsonResponse
    {
        $this->authorize('destroy', $course);

        $course->delete();

        return $this->success([], '', 200);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function formatCourse(Course $course): array
    {
        return [
            'id'               => $course->id,
            'title'            => $course->title,
            'description'      => $course->description,
            'instructor'       => $course->instructor ? [
                'id'         => $course->instructor->id,
                'full_name'  => $course->instructor->full_name,
                'avatar_url' => $course->instructor->avatar_url,
            ] : null,
            'category'         => $course->category,
            'difficulty'       => $course->difficulty,
            'thumbnail_url'    => $course->thumbnail_url,
            'trailer_url'      => $course->trailer_url,
            'duration_minutes' => $course->duration_minutes,
            'lesson_count'     => $course->lessons_count ?? 0,
            'enrolled_count'   => $course->enrollments_count ?? 0,
            'status'           => $course->status,
            'pearls_reward'    => $course->pearls_reward,
            'created_at'       => $course->created_at,
            'updated_at'       => $course->updated_at,
        ];
    }
}
