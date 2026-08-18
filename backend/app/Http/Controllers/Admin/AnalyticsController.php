<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends ApiController
{
    public function overview(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalStudents = User::where('role', 'student')->count();
        $totalInstructors = User::where('role', 'instructor')->count();

        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', 'published')->count();
        $draftCourses = Course::where('status', 'draft')->count();

        $totalEnrollments = Enrollment::count();
        $activeEnrollments = Enrollment::where('status', 'enrolled')->count();
        $completedEnrollments = Enrollment::where('status', 'completed')->count();

        $totalExamAttempts = ExamAttempt::whereNotNull('submitted_at')->count();
        $passedAttempts = ExamAttempt::where('passed', true)->count();
        $avgExamScore = ExamAttempt::whereNotNull('submitted_at')->avg('score');

        $recentUsers = User::orderBy('created_at', 'desc')->take(5)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ];
        });

        $topCourses = Course::withCount('enrollments')
            ->where('status', 'published')
            ->orderBy('enrollments_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'category' => $course->category,
                    'enrollments_count' => $course->enrollments_count,
                ];
            });

        return $this->success([
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'students' => $totalStudents,
                'instructors' => $totalInstructors,
            ],
            'courses' => [
                'total' => $totalCourses,
                'published' => $publishedCourses,
                'draft' => $draftCourses,
            ],
            'enrollments' => [
                'total' => $totalEnrollments,
                'active' => $activeEnrollments,
                'completed' => $completedEnrollments,
            ],
            'exams' => [
                'total_attempts' => $totalExamAttempts,
                'passed_attempts' => $passedAttempts,
                'average_score' => $avgExamScore ? round($avgExamScore, 2) : 0,
            ],
            'recent_users' => $recentUsers,
            'top_courses' => $topCourses,
        ]);
    }
}
