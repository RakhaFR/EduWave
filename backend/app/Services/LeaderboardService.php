<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Throwable;

class LeaderboardService
{
    private const GLOBAL_KEY = 'leaderboard:global';

    private const WEEKLY_KEY_PREFIX = 'leaderboard:weekly:';

    private const PREV_RANKS_GLOBAL_KEY = 'leaderboard:global:prev_ranks';

    private const PREV_RANKS_WEEKLY_PREFIX = 'leaderboard:weekly:prev_ranks:';

    /**
     * Update user's score in both global and weekly leaderboards.
     */
    public function updateScore(User $user): void
    {
        try {
            // Reload user to ensure we have the latest XP value
            $user->refresh();

            $score = (float) $user->xp;
            $userId = $user->id;

            // Track old rank before updating score if not tracked yet
            $oldGlobalRank = Redis::zrevrank(self::GLOBAL_KEY, $userId);
            if ($oldGlobalRank !== null) {
                Redis::hsetnx(self::PREV_RANKS_GLOBAL_KEY, $userId, (int) $oldGlobalRank + 1);
            }

            $currentWeek = now()->format('o-\WW');
            $weeklyKey = self::WEEKLY_KEY_PREFIX.$currentWeek;
            $prevWeeklyRanksKey = self::PREV_RANKS_WEEKLY_PREFIX.$currentWeek;

            $oldWeeklyRank = Redis::zrevrank($weeklyKey, $userId);
            if ($oldWeeklyRank !== null) {
                Redis::hsetnx($prevWeeklyRanksKey, $userId, (int) $oldWeeklyRank + 1);
            }

            // Update global leaderboard
            Redis::zadd(self::GLOBAL_KEY, $score, $userId);

            // Update weekly leaderboard
            Redis::zadd($weeklyKey, $score, $userId);

            // Set expiry on weekly keys (8 days to cover week transition overlap)
            Redis::expire($weeklyKey, 60 * 60 * 24 * 8);
            Redis::expire($prevWeeklyRanksKey, 60 * 60 * 24 * 8);
        } catch (Throwable $e) {
            // Redis unavailable (e.g. in test environment) — fail silently
            // The leaderboard will be eventually consistent when Redis recovers
            logger()->warning('LeaderboardService: Redis unavailable, skipping score update.', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get user's rank in the specified scope.
     *
     * @param  string  $scope  ('global' or 'weekly')
     * @return int|null Rank (0-indexed) or null if not found
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
     * @return array [{user_id, score, rank}, ...]
     */
    public function getTopN(string $scope = 'global', int $limit = 50, int $offset = 0): array
    {
        $key = $this->getKeyForScope($scope);
        $end = $offset + $limit - 1;

        // ZREVRANGE returns highest to lowest score
        $results = Redis::zrevrange($key, $offset, $end, ['WITHSCORES' => true]);

        return $this->formatLeaderboardResults($results, $offset);
    }

    /**
     * Get user's rank and neighboring users (context leaderboard).
     *
     * @return array ['user_rank' => int, 'neighbors' => [...]]
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

        $results = Redis::zrevrange($key, $start, $end, ['WITHSCORES' => true]);

        // Some Redis clients return an empty range for a single-member sorted set.
        // The ranked user must still appear in their own context leaderboard.
        if (empty($results)) {
            $score = Redis::zscore($key, $user->id);

            if ($score !== null) {
                $results = [$user->id => $score];
            }
        }

        return [
            'user_rank' => $rank + 1, // Convert to 1-indexed for display
            'neighbors' => $this->formatLeaderboardResults($results, $start),
        ];
    }

    /**
     * Get rank changes for given rankings array [{user_id, rank}, ...].
     * Returns an associative array of user_id => rank_change (int).
     */
    public function getRankChanges(string $scope, array $rankings): array
    {
        if (empty($rankings)) {
            return [];
        }

        try {
            $prevKey = match ($scope) {
                'global' => self::PREV_RANKS_GLOBAL_KEY,
                'weekly' => self::PREV_RANKS_WEEKLY_PREFIX.now()->format('o-\WW'),
                default => self::PREV_RANKS_GLOBAL_KEY,
            };

            $userIds = collect($rankings)->pluck('user_id')->all();
            $prevRanks = Redis::hmget($prevKey, $userIds);

            $changes = [];
            foreach ($rankings as $item) {
                $userId = $item['user_id'];
                $currentRank = (int) $item['rank'];
                $prevRank = isset($prevRanks[$userId]) && $prevRanks[$userId] !== false ? (int) $prevRanks[$userId] : null;

                // rank_change = prev_rank - current_rank
                // (e.g. prev 5, current 3 => 5 - 3 = +2, meaning moved up 2 ranks)
                $changes[$userId] = $prevRank !== null ? ($prevRank - $currentRank) : 0;
            }

            return $changes;
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * Get leaderboard key for the specified scope.
     */
    private function getKeyForScope(string $scope): string
    {
        return match ($scope) {
            'global' => self::GLOBAL_KEY,
            'weekly' => self::WEEKLY_KEY_PREFIX.now()->format('o-\WW'),
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
