<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicDataController extends ApiController
{
    public function stats(): JsonResponse
    {
        return $this->success([
            'active_students' => User::where('role', 'student')->where('is_active', true)->count(),
            'published_courses' => Course::where('status', 'published')->count(),
            'total_enrollments' => Enrollment::count(),
        ]);
    }

    public function instructors(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'instructor')
            ->where('is_active', true);

        if ($category = $request->query('category')) {
            $query->whereHas('courses', fn ($courseQuery) => $courseQuery
                ->where('status', 'published')
                ->where('category', $category));
        }

        if ($search = $request->query('search')) {
            $query->where(fn ($userQuery) => $userQuery
                ->where('full_name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('bio', 'like', "%{$search}%"));
        }

        $instructors = $query->orderBy('full_name')->get()->map(function (User $instructor) {
            $courses = $instructor->courses()
                ->where('status', 'published')
                ->withCount('enrollments')
                ->get(['id', 'category']);

            return [
                'id' => $instructor->id,
                'full_name' => $instructor->full_name,
                'username' => $instructor->username,
                'bio' => $instructor->bio,
                'avatar_url' => $instructor->avatar_url,
                'courses_count' => $courses->count(),
                'enrolled_students_count' => $courses->sum('enrollments_count'),
                'categories' => $courses->pluck('category')->filter()->unique()->values(),
            ];
        });

        return $this->success($instructors);
    }
}
