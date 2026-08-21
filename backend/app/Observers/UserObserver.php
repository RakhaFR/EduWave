<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Recalculate level whenever xp changes on an existing user.
     *
     * This fires for any Eloquent save — including direct DB updates
     * routed through Eloquent — so level stays in sync with xp
     * without having to go through GamificationService.
     *
     * Formula (mirrors GamificationService::calculateLevel):
     *   level = floor(sqrt(xp / 100)) + 1
     */
    public function updating(User $user): void
    {
        if ($user->isDirty('xp')) {
            $newLevel = (int) floor(sqrt($user->xp / 100)) + 1;

            // Only overwrite level if it actually changed, to avoid
            // triggering a second `updating` cycle unnecessarily.
            if ($newLevel !== $user->level) {
                $user->level = $newLevel;
            }
        }
    }
}
