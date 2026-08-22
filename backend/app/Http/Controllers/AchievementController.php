<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends ApiController
{
    public function __construct(
        protected GamificationService $gamificationService
    ) {}

    /**
     * GET /api/v1/achievements
     *
     * List all available achievements.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Achievement::query();

        // Filter by condition type
        if ($request->has('type')) {
            $query->where('condition_type', $request->type);
        }

        // Sort by pearls reward or creation date
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'asc');

        if (in_array($sortBy, ['pearls_reward', 'created_at', 'condition_value'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $user = $request->user() ?? auth('sanctum')->user();

        $achievements = $query->get()->map(function ($achievement) use ($user) {
            $data = [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon_url' => $achievement->icon_url,
                'condition_type' => $achievement->condition_type,
                'condition_value' => $achievement->condition_value,
                'pearls_reward' => $achievement->pearls_reward,
            ];

            // If authenticated, include earned status
            if ($user) {
                $earned = $user->achievements()->where('achievement_id', $achievement->id)->first();
                $data['is_earned'] = $earned !== null;
                $data['earned_at'] = $earned ? $earned->pivot->earned_at : null;
            }

            return $data;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'achievements' => $achievements,
                'count' => $achievements->count(),
            ],
            'error' => null,
            'meta' => null,
        ]);
    }

    /**
     * GET /api/v1/achievements/me
     *
     * Get authenticated user's earned achievements.
     */
    public function myAchievements(Request $request): JsonResponse
    {
        $user = $request->user();

        $achievements = $user->achievements()->get()->map(function ($achievement) {
            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon_url' => $achievement->icon_url,
                'condition_type' => $achievement->condition_type,
                'condition_value' => $achievement->condition_value,
                'pearls_reward' => $achievement->pearls_reward,
                'earned_at' => $achievement->pivot->earned_at,
            ];
        });

        // Calculate total pearls earned from achievements
        $totalPearlsFromAchievements = $achievements->sum('pearls_reward');

        return response()->json([
            'success' => true,
            'data' => [
                'achievements' => $achievements,
                'count' => $achievements->count(),
                'total_pearls_earned' => $totalPearlsFromAchievements,
            ],
            'error' => null,
            'meta' => null,
        ]);
    }

    /**
     * GET /api/v1/achievements/{achievement}
     *
     * Get details of a specific achievement.
     */
    public function show(Request $request, Achievement $achievement): JsonResponse
    {
        $data = [
            'id' => $achievement->id,
            'name' => $achievement->name,
            'description' => $achievement->description,
            'icon_url' => $achievement->icon_url,
            'condition_type' => $achievement->condition_type,
            'condition_value' => $achievement->condition_value,
            'pearls_reward' => $achievement->pearls_reward,
        ];

        // If authenticated, include earned status and progress
        $user = $request->user() ?? auth('sanctum')->user();
        if ($user) {
            $earned = $user->achievements()->where('achievement_id', $achievement->id)->first();
            $data['is_earned'] = $earned !== null;
            $data['earned_at'] = $earned ? $earned->pivot->earned_at : null;

            // Calculate current progress based on condition type
            $data['progress'] = $this->calculateProgress($user, $achievement);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'error' => null,
            'meta' => null,
        ]);
    }

    /**
     * Calculate user's progress towards an achievement.
     */
    protected function calculateProgress($user, Achievement $achievement): array
    {
        $current = 0;

        switch ($achievement->condition_type) {
            case 'course_completion':
                $current = $user->enrollments()->where('status', 'completed')->count();
                break;
            case 'lesson_completion':
                $current = $user->lessonProgress()->whereNotNull('completed_at')->count();
                break;
            case 'exam_pass':
                $current = $user->attempts()->where('passed', true)->distinct('exam_id')->count('exam_id');
                break;
            case 'xp_milestone':
                $current = $user->xp;
                break;
            case 'streak_days':
                $current = $user->streak_days ?? 0;
                break;
        }

        $target = $achievement->condition_value;
        $percentage = $target > 0 ? min(100, round(($current / $target) * 100, 2)) : 0;

        return [
            'current' => $current,
            'target' => $target,
            'percentage' => $percentage,
        ];
    }

    /**
     * POST /api/v1/achievements/check
     *
     * Evaluate user progress and automatically award any newly completed achievements & pearls.
     */
    public function check(Request $request): JsonResponse
    {
        $user = $request->user();

        $courseAchievements = $this->gamificationService->checkCourseCompletionAchievements($user);
        $lessonAchievements = $this->gamificationService->checkLessonCompletionAchievements($user);
        $examAchievements = $this->gamificationService->checkExamPassAchievements($user);
        $xpAchievements = $this->gamificationService->checkXpAchievements($user);
        $streakAchievements = $this->gamificationService->checkStreakAchievements($user);

        $newlyAwarded = array_merge(
            $courseAchievements,
            $lessonAchievements,
            $examAchievements,
            $xpAchievements,
            $streakAchievements
        );

        $totalPearlsEarned = array_sum(array_column($newlyAwarded, 'pearls_reward'));

        return $this->success([
            'newly_awarded' => $newlyAwarded,
            'count' => count($newlyAwarded),
            'pearls_earned' => $totalPearlsEarned,
            'current_pearls' => $user->fresh()->pearls,
        ]);
    }

    /**
     * POST /api/v1/achievements/{achievement}/claim
     *
     * Manually claim an achievement if the condition is met and grant its pearls reward.
     */
    public function claim(Request $request, Achievement $achievement): JsonResponse
    {
        $user = $request->user();

        // 1. Check if already earned
        if ($user->achievements()->where('achievement_id', $achievement->id)->exists()) {
            return $this->error('ACHIEVEMENT_ALREADY_CLAIMED', 'Achievement ini sudah pernah diklaim.', 400);
        }

        // 2. Evaluate requirement
        $progress = $this->calculateProgress($user, $achievement);

        if ($progress['current'] < $progress['target']) {
            return $this->error('ACHIEVEMENT_NOT_UNLOCKED', 'Persyaratan achievement belum terpenuhi.', 400, [
                'current' => $progress['current'],
                'target' => $progress['target'],
                'percentage' => $progress['percentage'],
            ]);
        }

        // 3. Attach achievement and award pearls
        $user->achievements()->attach($achievement->id, [
            'earned_at' => now(),
        ]);

        $pearlsEarned = 0;
        if ($achievement->pearls_reward > 0) {
            $pearlsEarned = $achievement->pearls_reward;
            $this->gamificationService->awardPearls($user, $pearlsEarned, "Claimed Achievement: {$achievement->name}");
        }

        return $this->success([
            'achievement' => [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon_url' => $achievement->icon_url,
                'pearls_reward' => $achievement->pearls_reward,
                'earned_at' => now()->toIso8601String(),
            ],
            'pearls_earned' => $pearlsEarned,
            'current_pearls' => $user->fresh()->pearls,
        ], 'Achievement berhasil diklaim.');
    }
}
