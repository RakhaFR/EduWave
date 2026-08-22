<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LeaderboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends ApiController
{
    protected LeaderboardService $leaderboardService;

    public function __construct(LeaderboardService $leaderboardService)
    {
        $this->leaderboardService = $leaderboardService;
    }

    /**
     * Get global leaderboard (all-time rankings).
     *
     * Query params:
     *   - page: int (default 1)
     *   - per_page: int (default 50, max 100)
     */
    public function global(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('per_page', 50)));
        $offset = ($page - 1) * $perPage;

        $rankings = $this->leaderboardService->getTopN('global', $perPage, $offset);
        $enrichedRankings = $this->enrichWithUserData($rankings, 'global');

        return $this->success([
            'rankings' => $enrichedRankings,
        ], '', 200, [
            'scope' => 'global',
            'current_page' => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * Get weekly leaderboard (current week rankings).
     *
     * Query params:
     *   - page: int (default 1)
     *   - per_page: int (default 50, max 100)
     */
    public function weekly(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('per_page', 50)));
        $offset = ($page - 1) * $perPage;

        $rankings = $this->leaderboardService->getTopN('weekly', $perPage, $offset);
        $enrichedRankings = $this->enrichWithUserData($rankings, 'weekly');

        return $this->success([
            'rankings' => $enrichedRankings,
        ], '', 200, [
            'scope' => 'weekly',
            'week' => now()->format('o-\WW'),
            'current_page' => $page,
            'per_page' => $perPage,
        ]);
    }

    /**
     * Get authenticated user's rank and neighbors.
     *
     * Query params:
     *   - scope: 'global' | 'weekly' (default 'global')
     *   - neighbors: int (default 3, number of users above/below)
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $scope = $request->query('scope', 'global');
        $neighbors = min(10, max(1, (int) $request->query('neighbors', 3)));

        $data = $this->leaderboardService->getUserWithNeighbors($user, $scope, $neighbors, $neighbors);

        if ($data['user_rank'] === null) {
            return $this->success([
                'user_rank' => null,
                'neighbors' => [],
                'message' => 'Anda belum memiliki XP atau belum terdaftar di leaderboard.',
            ], '', 200, [
                'scope' => $scope,
            ]);
        }

        $enrichedNeighbors = $this->enrichWithUserData($data['neighbors'], $scope);

        return $this->success([
            'user_rank' => $data['user_rank'],
            'neighbors' => $enrichedNeighbors,
        ], '', 200, [
            'scope' => $scope,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Enrich leaderboard rankings with user data.
     *
     * @param  array  $rankings  [{user_id, score, rank}, ...]
     * @param  string  $scope  ('global' | 'weekly')
     * @return array [{rank, user_id, xp, rank_change, user: {...}}, ...]
     */
    private function enrichWithUserData(array $rankings, string $scope = 'global'): array
    {
        if (empty($rankings)) {
            return [];
        }

        $userIds = collect($rankings)->pluck('user_id')->all();
        $users = User::whereIn('id', $userIds)
            ->withCount(['enrollments as completed_courses_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->get()
            ->keyBy('id');

        $rankChanges = $this->leaderboardService->getRankChanges($scope, $rankings);

        return collect($rankings)->map(function ($entry) use ($users, $rankChanges) {
            $user = $users->get($entry['user_id']);

            if (! $user) {
                return null;
            }

            return [
                'rank' => $entry['rank'],
                'user_id' => $user->id,
                'xp' => (int) $entry['score'],
                'rank_change' => (int) ($rankChanges[$user->id] ?? 0),
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $user->full_name,
                    'avatar_url' => $user->avatar_url,
                    'level' => $user->level,
                    'streak_days' => $user->streak_days ?? 0,
                    'completed_courses_count' => (int) ($user->completed_courses_count ?? 0),
                ],
                'pearls' => $user->pearls,
            ];
        })->filter()->values()->all();
    }
}
