<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
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

});
