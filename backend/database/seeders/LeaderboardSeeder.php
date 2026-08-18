<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\LeaderboardService;
use Illuminate\Database\Seeder;

class LeaderboardSeeder extends Seeder
{
    public function run(): void
    {
        $service = app(LeaderboardService::class);
        $users = User::where('xp', '>', 0)->get();

        foreach ($users as $user) {
            try {
                $service->updateUserScore($user->id, (int) $user->xp);
            } catch (\Throwable $e) {
                // Redis offline fallback — swallow exception during seeding
            }
        }
    }
}