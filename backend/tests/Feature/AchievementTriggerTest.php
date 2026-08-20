<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AchievementTriggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_check_and_auto_award_achievements(): void
    {
        $user = User::factory()->create(['xp' => 500, 'pearls' => 50]);

        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 100,
            'pearls_reward' => 200,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/achievements/check');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 1)
            ->assertJsonPath('data.pearls_earned', 200)
            ->assertJsonPath('data.current_pearls', 250);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_id' => $achievement->id,
        ]);
    }

    public function test_user_can_manually_claim_unlocked_achievement(): void
    {
        $user = User::factory()->create(['xp' => 300, 'pearls' => 100]);

        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 200,
            'pearls_reward' => 150,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/achievements/{$achievement->id}/claim");

        $response->assertStatus(200)
            ->assertJsonPath('data.pearls_earned', 150)
            ->assertJsonPath('data.current_pearls', 250);

        $this->assertDatabaseHas('user_achievements', [
            'user_id' => $user->id,
            'achievement_id' => $achievement->id,
        ]);
    }

    public function test_user_cannot_claim_unlocked_achievement_twice(): void
    {
        $user = User::factory()->create(['xp' => 300, 'pearls' => 100]);

        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 200,
            'pearls_reward' => 150,
        ]);

        // First claim
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/achievements/{$achievement->id}/claim");

        // Second claim
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/achievements/{$achievement->id}/claim");

        $response->assertStatus(400)
            ->assertJsonPath('error.code', 'ACHIEVEMENT_ALREADY_CLAIMED');
    }

    public function test_user_cannot_claim_locked_achievement(): void
    {
        $user = User::factory()->create(['xp' => 50, 'pearls' => 100]);

        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 500,
            'pearls_reward' => 300,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/achievements/{$achievement->id}/claim");

        $response->assertStatus(400)
            ->assertJsonPath('error.code', 'ACHIEVEMENT_NOT_UNLOCKED');
    }
}
