<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\UpdateMascotRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends ApiController
{
    /**
     * Get current user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->bio,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'streak_days' => $user->streak_days,
                'last_active' => $user->last_active,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $user->update($validated);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'bio' => $user->bio,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Verify current password
        if (! Hash::check($validated['current_password'], $user->password)) {
            return $this->error('AUTH_INVALID_CREDENTIALS', 'Password saat ini salah.', 401);
        }

        // Update password
        $user->update(['password' => Hash::make($validated['password'])]);

        // Revoke all existing tokens
        $user->tokens()->delete();
        auth()->forgetGuards();

        return $this->success(null, 'Password berhasil diubah. Silakan login kembali.');
    }

    /**
     * Get user statistics (pearls, xp, level, streak).
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'stats' => [
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'streak_days' => $user->streak_days,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    public function courses(Request $request): JsonResponse
    {
        $enrollments = $request->user()->enrollments()
            ->whereIn('status', ['enrolled', 'completed'])
            ->with(['course.instructor:id,full_name,avatar_url'])
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(fn ($enrollment) => [
                'id' => $enrollment->id,
                'progress_pct' => (float) $enrollment->progress_pct,
                'status' => $enrollment->status,
                'enrolled_at' => $enrollment->enrolled_at,
                'completed_at' => $enrollment->completed_at,
                'course' => $enrollment->course ? [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'description' => $enrollment->course->description,
                    'category' => $enrollment->course->category,
                    'difficulty' => $enrollment->course->difficulty,
                    'thumbnail_url' => $enrollment->course->thumbnail_url,
                    'duration_minutes' => $enrollment->course->duration_minutes,
                    'pearls_reward' => $enrollment->course->pearls_reward,
                    'instructor' => $enrollment->course->instructor ? [
                        'id' => $enrollment->course->instructor->id,
                        'full_name' => $enrollment->course->instructor->full_name,
                        'avatar_url' => $enrollment->course->instructor->avatar_url,
                    ] : null,
                ] : null,
            ]);

        return $this->success(['courses' => $enrollments]);
    }

    /**
     * Update user's equipped mascot and accessories.
     */
    public function updateMascot(UpdateMascotRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Check if user owns this mascot
        $mascotOwnership = $user->mascots()
            ->where('mascot_id', $validated['mascot_id'])
            ->first();

        if (! $mascotOwnership) {
            return $this->error('MASCOT_NOT_OWNED', 'Anda tidak memiliki maskot ini.', 403);
        }

        // Update accessories
        $user->mascots()->updateExistingPivot($validated['mascot_id'], [
            'is_active' => true,
            'accessories' => json_encode($validated['accessories']),
        ]);

        // Set other mascots to inactive
        $user->userMascots()
            ->where('mascot_id', '!=', $validated['mascot_id'])
            ->update(['is_active' => false]);

        $mascot = $mascotOwnership->makeHidden(['pivot']);

        return $this->success([
            'mascot_id' => $validated['mascot_id'],
            'accessories' => $validated['accessories'],
            'is_active' => true,
        ]);
    }

    /**
     * Get user's earned achievements.
     */
    public function achievements(Request $request): JsonResponse
    {
        $user = $request->user();

        $achievements = $user->achievements()->get()->map(fn ($achievement) => [
            'id' => $achievement->id,
            'name' => $achievement->name,
            'description' => $achievement->description,
            'icon_url' => $achievement->icon_url,
            'condition_type' => $achievement->condition_type,
            'condition_value' => $achievement->condition_value,
            'pearls_reward' => $achievement->pearls_reward,
            'earned_at' => $achievement->pivot->earned_at,
        ]);

        return $this->success([
            'achievements' => $achievements,
            'count' => $achievements->count(),
        ]);
    }
}
