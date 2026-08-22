<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class RecalcUserLevels extends Command
{
    protected $signature = 'users:recalc-levels
                            {--dry-run : Show what would change without saving}';

    protected $description = 'Recalculate and sync the level column for all users based on their current XP.
                             Useful after direct DB injections or bulk XP changes.';

    /**
     * Formula (mirrors GamificationService::calculateLevel):
     *   level = floor(sqrt(xp / 100)) + 1
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $updated = 0;
        $total = 0;

        $this->info($isDryRun ? '[DRY RUN] Scanning users...' : 'Recalculating user levels...');

        // Chunk to avoid loading all users into memory at once
        User::withTrashed()->orderBy('created_at')->chunk(200, function ($users) use ($isDryRun, &$updated, &$total) {
            foreach ($users as $user) {
                $total++;
                $correctLevel = (int) floor(sqrt($user->xp / 100)) + 1;

                if ($user->level !== $correctLevel) {
                    if (! $isDryRun) {
                        // Update without triggering the observer (avoids infinite loop)
                        // and without firing timestamps churn on unrelated records.
                        User::withoutEvents(fn () => User::withTrashed()
                            ->where('id', $user->id)
                            ->update(['level' => $correctLevel])
                        );
                    }

                    $this->line(sprintf(
                        '  %s  xp=%-6d  level: %d → %d%s',
                        $user->username ?? $user->id,
                        $user->xp,
                        $user->level,
                        $correctLevel,
                        $isDryRun ? ' (skipped)' : ' ✓'
                    ));

                    $updated++;
                }
            }
        });

        $this->newLine();
        $this->info(sprintf(
            '%s %d / %d user(s) %s.',
            $isDryRun ? '[DRY RUN]' : 'Done.',
            $updated,
            $total,
            $isDryRun ? 'would be updated' : 'updated'
        ));

        return self::SUCCESS;
    }
}
