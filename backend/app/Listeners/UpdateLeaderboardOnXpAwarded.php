<?php

namespace App\Listeners;

use App\Events\XpAwarded;
use App\Services\LeaderboardService;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateLeaderboardOnXpAwarded implements ShouldQueue
{
    protected LeaderboardService $leaderboardService;

    /**
     * Create the event listener.
     */
    public function __construct(LeaderboardService $leaderboardService)
    {
        $this->leaderboardService = $leaderboardService;
    }

    /**
     * Handle the event.
     */
    public function handle(XpAwarded $event): void
    {
        $this->leaderboardService->updateScore($event->user, $event->xpAmount);
    }
}
