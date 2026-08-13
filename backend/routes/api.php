<?php

use App\Http\Controllers\AttemptController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ──────────────────────────────────────────────────────
    // Auth Routes (Public)
    // ──────────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // ──────────────────────────────────────────────────────
    // Auth Routes (Authenticated)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // ──────────────────────────────────────────────────────
    // User Routes (Self-service)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('users/me', [UserController::class, 'me']);
        Route::put('users/me', [UserController::class, 'updateProfile']);
        Route::put('users/me/password', [UserController::class, 'changePassword']);
        Route::get('users/me/stats', [UserController::class, 'stats']);
        Route::put('users/me/mascot', [UserController::class, 'updateMascot']);
        Route::get('users/me/achievements', [UserController::class, 'achievements']);
    });

    // ──────────────────────────────────────────────────────
    // Course Routes (Public — index + show)
    // ──────────────────────────────────────────────────────
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{course}', [CourseController::class, 'show']);

    // ──────────────────────────────────────────────────────
    // Course, Lesson, Enrollment, Exam & Attempt Routes (Authenticated)
    // ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        // Enrollment
        Route::post  ('courses/{course}/enroll',   [EnrollmentController::class, 'enroll']);
        Route::delete('courses/{course}/enroll',   [EnrollmentController::class, 'unenroll']);
        Route::get   ('courses/{course}/progress', [EnrollmentController::class, 'progress']);

        // Lesson listing for a course
        Route::get('courses/{course}/lessons', [LessonController::class, 'index']);

        // Lesson access + completion
        Route::get ('lessons/{lesson}',          [LessonController::class, 'show']);
        Route::post('lessons/{lesson}/complete', [LessonController::class, 'complete']);

        // Exam access & attempt management
        Route::get ('exams/{exam}',                           [ExamController::class, 'show']);
        Route::post('exams/{exam}/attempts',                  [AttemptController::class, 'start']);
        Route::post('exams/{exam}/attempts/{attempt}/submit', [AttemptController::class, 'submit']);
        Route::get ('exams/{exam}/attempts',                  [AttemptController::class, 'index']);
        Route::get ('exams/{exam}/attempts/{attempt}',        [AttemptController::class, 'show']);

        // Leaderboard
        Route::get('leaderboard',        [LeaderboardController::class, 'global']);
        Route::get('leaderboard/weekly', [LeaderboardController::class, 'weekly']);
        Route::get('leaderboard/me',     [LeaderboardController::class, 'me']);

        // Admin / Instructor only — course management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post  ('courses',          [CourseController::class, 'store']);
            Route::put   ('courses/{course}', [CourseController::class, 'update']);
            Route::delete('courses/{course}', [CourseController::class, 'destroy']);
        });

        // Admin / Instructor only — lesson management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post  ('lessons',          [LessonController::class, 'store']);
            Route::put   ('lessons/{lesson}', [LessonController::class, 'update']);
            Route::delete('lessons/{lesson}', [LessonController::class, 'destroy']);
        });

        // Admin / Instructor only — exam management
        Route::middleware('role:admin,instructor')->group(function () {
            Route::post  ('exams',        [ExamController::class, 'store']);
            Route::put   ('exams/{exam}', [ExamController::class, 'update']);
            Route::delete('exams/{exam}', [ExamController::class, 'destroy']);
        });
    });

});
