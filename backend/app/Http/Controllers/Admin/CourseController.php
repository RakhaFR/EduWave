<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Admin\UpdateCourseStatusRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);

        $query = Course::with('instructor');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $query->orderBy('created_at', 'desc');

        $courses = $query->paginate($perPage);

        return $this->paginated($courses, function ($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'instructor' => [
                    'id' => $course->instructor->id,
                    'full_name' => $course->instructor->full_name,
                    'email' => $course->instructor->email,
                ],
                'category' => $course->category,
                'difficulty' => $course->difficulty,
                'status' => $course->status,
                'thumbnail_url' => $course->thumbnail_url,
                'duration_minutes' => $course->duration_minutes,
                'pearls_reward' => $course->pearls_reward,
                'enrollments_count' => $course->enrollments()->count(),
                'lessons_count' => $course->lessons()->count(),
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
            ];
        });
    }

    public function updateStatus(UpdateCourseStatusRequest $request, Course $course): JsonResponse
    {
        $validated = $request->validated();

        $course->update(['status' => $validated['status']]);

        return $this->success([
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'status' => $course->status,
                'updated_at' => $course->updated_at,
            ],
        ]);
    }
}
