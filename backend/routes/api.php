<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AttemptController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\MascotController;
use App\Http\Controllers\RoomMessageController;
use App\Http\Controllers\StudyRoomController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {

    // ──────────────────────────────────────────────────────
    // Auth Routes (Public)
    // ──────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
    });

    // ──────────────────────────────────────────────────────
    // Auth Routes (Authenticated)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('me', [AuthController::class, 'me'])->name('auth.me');
    });

    // ──────────────────────────────────────────────────────
    // User Routes (Self-service)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('users/me', [UserController::class, 'me'])->name('users.me.show');
        Route::put('users/me', [UserController::class, 'updateProfile'])->name('users.me.update');
        Route::put('users/me/password', [UserController::class, 'changePassword'])->name('users.me.password.update');
        Route::get('users/me/stats', [UserController::class, 'stats'])->name('users.me.stats');
        Route::put('users/me/mascot', [UserController::class, 'updateMascot'])->name('users.me.mascot.update');
        Route::get('users/me/achievements', [UserController::class, 'achievements'])->name('users.me.achievements');
        Route::get('users/me/courses', [UserController::class, 'courses'])->name('users.me.courses');
        Route::get('users/me/course-progress', [EnrollmentController::class, 'allProgress'])->name('users.me.course-progress.index');
    });

    // ──────────────────────────────────────────────────────
    // Course Routes (Public — index + show)
    // ──────────────────────────────────────────────────────
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');

    // Public leaderboard rankings
    Route::get('leaderboard', [LeaderboardController::class, 'global'])->name('leaderboard.global');
    Route::get('leaderboard/weekly', [LeaderboardController::class, 'weekly'])->name('leaderboard.weekly');

    // ──────────────────────────────────────────────────────
    // Course, Lesson, Enrollment, Exam & Attempt Routes (Authenticated)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        // Enrollment
        Route::post('courses/{course}/enroll', [EnrollmentController::class, 'enroll'])->name('courses.enrollments.store');
        Route::delete('courses/{course}/enroll', [EnrollmentController::class, 'unenroll'])->name('courses.enrollments.destroy');
        Route::get('courses/{course}/progress', [EnrollmentController::class, 'progress'])->name('courses.progress.show');

        // Lesson listing for a course
        Route::get('courses/{course}/lessons', [LessonController::class, 'index'])->name('courses.lessons.index');

        // Lesson access + completion
        Route::get('lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        Route::post('lessons/{lesson}/complete', [LessonController::class, 'complete'])->name('lessons.complete');

        // Exam access & attempt management
        Route::get('exams/{exam}', [ExamController::class, 'show'])->name('exams.show');
        Route::post('exams/{exam}/attempts', [AttemptController::class, 'start'])->name('exams.attempts.store');
        Route::post('exams/{exam}/attempts/{attempt}/submit', [AttemptController::class, 'submit'])->name('exams.attempts.submit');
        Route::get('exams/{exam}/attempts', [AttemptController::class, 'index'])->name('exams.attempts.index');
        Route::get('exams/{exam}/attempts/{attempt}', [AttemptController::class, 'show'])->name('exams.attempts.show');

        // Authenticated user's leaderboard position
        Route::get('leaderboard/me', [LeaderboardController::class, 'me'])->name('leaderboard.me');

        // Mascots
        Route::get('mascots', [MascotController::class, 'index'])->name('mascots.index');
        Route::get('mascots/inventory', [MascotController::class, 'inventory'])->name('mascots.inventory');
        Route::post('mascots/{mascot}/purchase', [MascotController::class, 'purchase'])->name('mascots.purchase');
        Route::put('mascots/equip', [MascotController::class, 'equip'])->name('mascots.equip');

        // Achievements
        Route::get('achievements', [AchievementController::class, 'index'])->name('achievements.index');
        Route::get('achievements/me', [AchievementController::class, 'myAchievements'])->name('achievements.me');
        Route::get('achievements/{achievement}', [AchievementController::class, 'show'])->name('achievements.show');

        // Study Rooms
        Route::get('study-rooms', [StudyRoomController::class, 'index'])->name('study-rooms.index');
        Route::post('study-rooms', [StudyRoomController::class, 'store'])->name('study-rooms.store');
        Route::get('study-rooms/{room}', [StudyRoomController::class, 'show'])->name('study-rooms.show');
        Route::post('study-rooms/{room}/join', [StudyRoomController::class, 'join'])->name('study-rooms.join');
        Route::delete('study-rooms/{room}/leave', [StudyRoomController::class, 'leave'])->name('study-rooms.leave');
        Route::delete('study-rooms/{room}', [StudyRoomController::class, 'destroy'])->name('study-rooms.destroy');
        Route::get('study-rooms/{room}/messages', [RoomMessageController::class, 'index'])->name('study-rooms.messages.index');
        Route::post('study-rooms/{room}/messages', [RoomMessageController::class, 'store'])->name('study-rooms.messages.store');

        // Admin / Instructor only — course management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
            Route::put('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
            Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
        });

        // Admin / Instructor only — lesson management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post('lessons', [LessonController::class, 'store'])->name('lessons.store');
            Route::put('lessons/{lesson}', [LessonController::class, 'update'])->name('lessons.update');
            Route::delete('lessons/{lesson}', [LessonController::class, 'destroy'])->name('lessons.destroy');
        });

        // Admin / Instructor only — exam management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post('exams', [ExamController::class, 'store'])->name('exams.store');
            Route::put('exams/{exam}', [ExamController::class, 'update'])->name('exams.update');
            Route::delete('exams/{exam}', [ExamController::class, 'destroy'])->name('exams.destroy');
        });

        // Admin only — user management, course moderation, analytics
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('users', [AdminUserController::class, 'index'])->name('admin.users.index');
            Route::put('users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.role.update');
            Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');

            Route::get('courses', [AdminCourseController::class, 'index'])->name('admin.courses.index');
            Route::put('courses/{course}/status', [AdminCourseController::class, 'updateStatus'])->name('admin.courses.status.update');

            Route::get('analytics/overview', [AnalyticsController::class, 'overview'])->name('admin.analytics.overview');
        });
    });

});
