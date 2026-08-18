<?php

namespace App\Services;

use App\Events\XpAwarded;
use App\Models\Achievement;
use App\Models\User;

class GamificationService
{
    /**
     * Award pearls to a user.
     */
    public function awardPearls(User $user, int $amount, ?string $reason = null): int
    {
        $user->increment('pearls', $amount);
        $user->refresh();

        // Optional: Log the transaction for audit trail
        // TransactionLog::create(['user_id' => $user->id, 'amount' => $amount, 'reason' => $reason]);

        return $user->pearls;
    }

    /**
     * Spend pearls from a user.
     *
     * @throws \Exception if user has insufficient pearls
     */
    public function spendPearls(User $user, int $amount, ?string $reason = null): int
    {
        if ($user->pearls < $amount) {
            throw new \Exception('Insufficient pearls');
        }

        $user->decrement('pearls', $amount);
        $user->refresh();

        // Optional: Log the transaction
        // TransactionLog::create(['user_id' => $user->id, 'amount' => -$amount, 'reason' => $reason]);

        return $user->pearls;
    }

    /**
     * Award XP to a user and update their level.
     * Dispatches XpAwarded event for leaderboard updates.
     */
    public function awardXp(User $user, int $amount): array
    {
        $oldXp = $user->xp;
        $oldLevel = $user->level;

        $user->increment('xp', $amount);
        $user->refresh();

        $newLevel = $this->calculateLevel($user->xp);
        $leveledUp = false;

        if ($newLevel > $oldLevel) {
            $user->update(['level' => $newLevel]);
            $leveledUp = true;
        }

        // Dispatch event for leaderboard update
        event(new XpAwarded($user, $amount, 'gamification_service'));

        return [
            'xp_awarded' => $amount,
            'total_xp' => $user->xp,
            'old_level' => $oldLevel,
            'new_level' => $newLevel,
            'leveled_up' => $leveledUp,
        ];
    }

    /**
     * Calculate user level based on total XP.
     * Formula: level = floor(sqrt(xp / 100)) + 1
     */
    public function calculateLevel(int $xp): int
    {
        return (int) floor(sqrt($xp / 100)) + 1;
    }

    /**
     * Check and award achievements for a user based on condition type.
     */
    public function checkAchievements(User $user, string $conditionType, int $currentValue): array
    {
        $awarded = [];

        // Find achievements matching the condition type
        $achievements = Achievement::where('condition_type', $conditionType)
            ->where('condition_value', '<=', $currentValue)
            ->get();

        foreach ($achievements as $achievement) {
            // Check if user already has this achievement
            if ($user->achievements()->where('achievement_id', $achievement->id)->exists()) {
                continue;
            }

            // Award the achievement
            $user->achievements()->attach($achievement->id, [
                'earned_at' => now(),
            ]);

            // Award pearls reward
            if ($achievement->pearls_reward > 0) {
                $this->awardPearls($user, $achievement->pearls_reward, "Achievement: {$achievement->name}");
            }

            $awarded[] = [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon_url' => $achievement->icon_url,
                'pearls_reward' => $achievement->pearls_reward,
            ];
        }

        return $awarded;
    }

    /**
     * Check course completion achievements.
     */
    public function checkCourseCompletionAchievements(User $user): array
    {
        $completedCount = $user->enrollments()->where('status', 'completed')->count();

        return $this->checkAchievements($user, 'course_completion', $completedCount);
    }

    /**
     * Check lesson completion achievements.
     */
    public function checkLessonCompletionAchievements(User $user): array
    {
        $completedCount = $user->completedLessons()->count();

        return $this->checkAchievements($user, 'lesson_completion', $completedCount);
    }

    /**
     * Check exam pass achievements.
     */
    public function checkExamPassAchievements(User $user): array
    {
        $passedCount = $user->examAttempts()->where('passed', true)->distinct('exam_id')->count('exam_id');

        return $this->checkAchievements($user, 'exam_pass', $passedCount);
    }

    /**
     * Check XP milestone achievements.
     */
    public function checkXpAchievements(User $user): array
    {
        return $this->checkAchievements($user, 'xp_milestone', $user->xp);
    }

    /**
     * Check streak achievements.
     */
    public function checkStreakAchievements(User $user): array
    {
        return $this->checkAchievements($user, 'streak_days', $user->streak_days ?? 0);
    }
}
