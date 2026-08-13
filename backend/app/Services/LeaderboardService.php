<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Redis;

class LeaderboardService
{
    private const GLOBAL_KEY = 'leaderboard:global';
    private const WEEKLY_KEY_PREFIX = 'leaderboard:weekly:';

    /**
     * Update user's score in both global and weekly leaderboards.
     */
    public function updateScore(User $user): void
    {
        // Reload user to ensure we have the latest XP value
        $user->refresh();
        
        $score = (float) $user->xp;
        $userId = $user->id;

        // Update global leaderboard
        Redis::zadd(self::GLOBAL_KEY, $score, $userId);

        // Update weekly leaderboard (key format: leaderboard:weekly:2026-W33)
        $weeklyKey = self::WEEKLY_KEY_PREFIX . now()->format('o-\WW');
        Redis::zadd($weeklyKey, $score, $userId);
        
        // Set expiry on weekly key (8 days to cover week transition overlap)
        Redis::expire($weeklyKey, 60 * 60 * 24 * 8);
    }

    /**
     * Get user's rank in the specified scope.
     *
     * @param  User  $user
     * @param  string  $scope  ('global' or 'weekly')
     * @return int|null  Rank (0-indexed) or null if not found
     */
    public function getRank(User $user, string $scope = 'global'): ?int
    {
        $key = $this->getKeyForScope($scope);
        $rank = Redis::zrevrank($key, $user->id);

        return $rank !== null ? (int) $rank : null;
    }

    /**
     * Get top N users from leaderboard.
     *
     * @param  string  $scope
     * @param  int  $limit
     * @param  int  $offset
     * @return array  [{user_id, score, rank}, ...]
     */
    public function getTopN(string $scope = 'global', int $limit = 50, int $offset = 0): array
    {
        $key = $this->getKeyForScope($scope);
        $end = $offset + $limit - 1;

        // ZREVRANGE returns highest to lowest score
        $results = Redis::zrevrange($key, $offset, $end, 'WITHSCORES');

        return $this->formatLeaderboardResults($results, $offset);
    }

    /**
     * Get user's rank and neighboring users (context leaderboard).
     *
     * @param  User  $user
     * @param  string  $scope
     * @param  int  $neighborsAbove
     * @param  int  $neighborsBelow
     * @return array  ['user_rank' => int, 'neighbors' => [...]]
     */
    public function getUserWithNeighbors(
        User $user,
        string $scope = 'global',
        int $neighborsAbove = 3,
        int $neighborsBelow = 3
    ): array {
        $key = $this->getKeyForScope($scope);
        $rank = Redis::zrevrank($key, $user->id);

        if ($rank === null) {
            return [
                'user_rank' => null,
                'neighbors' => [],
            ];
        }

        $rank = (int) $rank;
        $start = max(0, $rank - $neighborsAbove);
        $end = $rank + $neighborsBelow;

        $results = Redis::zrevrange($key, $start, $end, 'WITHSCORES');

        return [
            'user_rank' => $rank + 1, // Convert to 1-indexed for display
            'neighbors' => $this->formatLeaderboardResults($results, $start),
        ];
    }

    /**
     * Get leaderboard key for the specified scope.
     */
    private function getKeyForScope(string $scope): string
    {
        return match ($scope) {
            'global' => self::GLOBAL_KEY,
            'weekly' => self::WEEKLY_KEY_PREFIX . now()->format('o-\WW'),
            default => self::GLOBAL_KEY,
        };
    }

    /**
     * Format Redis ZREVRANGE results into structured array.
     */
    private function formatLeaderboardResults(array $results, int $startRank = 0): array
    {
        $formatted = [];
        $rank = $startRank;

        // Redis returns [userId => score, userId => score, ...]
        foreach ($results as $userId => $score) {
            $formatted[] = [
                'user_id' => $userId,
                'score' => (float) $score,
                'rank' => $rank + 1, // 1-indexed for display
            ];
            $rank++;
        }

        return $formatted;
    }
}
