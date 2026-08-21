<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\Enrollment;
use App\Models\ExamAttempt;
use App\Models\LessonProgress;
use App\Models\Mascot;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserMascot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class UserController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderBy('created_at', 'desc');

        $users = $query->paginate($perPage);

        return $this->paginated($users, function ($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
            ];
        });
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        // Prevent demoting the last admin
        if (
            isset($validated['role']) &&
            $validated['role'] !== 'admin' &&
            $user->role === 'admin' &&
            User::where('role', 'admin')->count() <= 1
        ) {
            return $this->error(
                'LAST_ADMIN',
                'Tidak dapat mengubah role admin terakhir.',
                422
            );
        }

        $user->update($validated);

        if (isset($validated['is_active']) && ! $validated['is_active']) {
            $user->tokens()->delete();
        }

        return $this->success([
            'user' => [
                'id'        => $user->id,
                'username'  => $user->username,
                'email'     => $user->email,
                'full_name' => $user->full_name,
                'role'      => $user->role,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        // 1. Reject if admin is trying to change their own role
        if ($request->user()->id === $user->id) {
            return $this->error(
                'CANNOT_CHANGE_OWN_ROLE',
                'Admin tidak dapat mengubah role akunnya sendiri.',
                422
            );
        }

        $validated = $request->validated();
        $oldRole = $user->role;
        $newRole = $validated['role'];

        // 2. Reject if demoting the last admin
        if (
            $oldRole === 'admin' &&
            $newRole !== 'admin' &&
            User::where('role', 'admin')->count() <= 1
        ) {
            return $this->error(
                'LAST_ADMIN',
                'Tidak dapat mengubah role admin terakhir.',
                422
            );
        }

        try {
            $action = 'none';
            $gamificationPayload = null;

            DB::transaction(function () use ($user, $oldRole, $newRole, &$action, &$gamificationPayload) {
                if ($oldRole === 'student' && $newRole !== 'student') {
                    $action = 'destroyed';
                    $this->cleanupGamificationData($user);
                    $gamificationPayload = null;
                } elseif ($oldRole !== 'student' && $newRole === 'student') {
                    $action = 'initialized';
                    $this->cleanupGamificationData($user);
                    $this->initializeDefaultMascot($user);
                    $gamificationPayload = [
                        'xp' => 0,
                        'pearls' => 0,
                        'level' => 1,
                        'streak_days' => 0,
                    ];
                } elseif ($oldRole === 'student' && $newRole === 'student') {
                    $action = 'none';
                    $gamificationPayload = [
                        'xp' => $user->xp,
                        'pearls' => $user->pearls,
                        'level' => $user->level,
                        'streak_days' => $user->streak_days,
                    ];
                } else {
                    $action = 'none';
                    $gamificationPayload = null;
                }

                $user->role = $newRole;
                $user->save();
            });

            return $this->success([
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'role' => $user->role,
                ],
                'previous_role' => $oldRole,
                'new_role' => $newRole,
                'gamification_action' => $action,
                'gamification' => $gamificationPayload,
            ]);
        } catch (Throwable $e) {
            logger()->error('Gamification sync failed on role update', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return $this->error(
                'GAMIFICATION_SYNC_FAILED',
                'Perubahan role dibatalkan karena data gamifikasi gagal disinkronkan.',
                500
            );
        }
    }

    /**
     * Get user's gamification statistics summary for admin.
     */
    public function getGamification(User $user): JsonResponse
    {
        $completedCoursesCount = Enrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $completedLessonsCount = LessonProgress::where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->count();

        $achievementCount = UserAchievement::where('user_id', $user->id)->count();

        $mascotCount = UserMascot::where('user_id', $user->id)->count();

        return $this->success([
            'user_id' => $user->id,
            'role' => $user->role,
            'xp' => $user->xp,
            'pearls' => $user->pearls,
            'level' => $user->level,
            'streak_days' => $user->streak_days ?? 0,
            'completed_courses_count' => $completedCoursesCount,
            'completed_lessons_count' => $completedLessonsCount,
            'achievement_count' => $achievementCount,
            'mascot_count' => $mascotCount,
        ]);
    }

    /**
     * Remove all student gamification records and reset stats.
     */
    private function cleanupGamificationData(User $user): void
    {
        // Reset user gamification columns
        $user->update([
            'xp' => 0,
            'pearls' => 0,
            'level' => 1,
            'streak_days' => 0,
        ]);

        // Remove student progress and relational records
        Enrollment::where('user_id', $user->id)->delete();
        LessonProgress::where('user_id', $user->id)->delete();
        ExamAttempt::where('user_id', $user->id)->delete();
        UserAchievement::where('user_id', $user->id)->delete();
        UserMascot::where('user_id', $user->id)->delete();

        // Remove user from Redis leaderboard
        try {
            Redis::zrem('leaderboard:global', $user->id);
            $weeklyKey = 'leaderboard:weekly:'.now()->format('o-\WW');
            Redis::zrem($weeklyKey, $user->id);
        } catch (Throwable $e) {
            // Redis unavailable - fail silently
        }
    }

    /**
     * Attach default mascot to student if available.
     */
    private function initializeDefaultMascot(User $user): void
    {
        if (Mascot::whereKey(Mascot::DEFAULT_ID)->exists()) {
            $user->mascots()->attach(Mascot::DEFAULT_ID, [
                'is_active' => true,
                'accessories' => null,
                'unlocked_at' => now(),
            ]);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return $this->error(
                'CANNOT_DELETE_ADMIN',
                'Akun admin tidak dapat dihapus.',
                403
            );
        }

        $user->delete();

        return $this->success(null);
    }
}
