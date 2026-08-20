<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\LeaderboardService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Redis;

class LeaderboardSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(LeaderboardService::class);

        $weeklyKey = 'leaderboard:weekly:'.now()->format('o-\WW');

        Redis::del('leaderboard:global', $weeklyKey);

        $users = User::where('xp', '>', 0)->cursor();

        foreach ($users as $user) {
            $service->updateScore($user);
        }
    }
}
