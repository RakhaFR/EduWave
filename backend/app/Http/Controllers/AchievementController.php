<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Services\GamificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AchievementController extends Controller
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

        $achievements = $query->get()->map(function ($achievement) use ($request) {
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
            if ($user = $request->user()) {
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
        if ($user = $request->user()) {
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
}
