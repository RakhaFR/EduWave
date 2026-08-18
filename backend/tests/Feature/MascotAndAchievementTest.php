<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Mascot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 4.7 Feature Tests — MascotController, AchievementController
 */
class MascotAndAchievementTest extends TestCase
{
    use RefreshDatabase;

    private function student(): User
    {
        return User::factory()->create(['role' => 'student', 'pearls' => 500]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Mascot Catalog
    // ──────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_mascot_catalog(): void
    {
        $user = $this->student();
        Mascot::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/v1/mascots');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $mascots = $response->json('data.mascots');
        $this->assertCount(3, $mascots);
        $this->assertArrayHasKey('is_owned', $mascots[0]);
        $this->assertFalse($mascots[0]['is_owned']);
    }

    public function test_mascot_catalog_shows_owned_status(): void
    {
        $user = $this->student();
        $owned = Mascot::factory()->create();
        $notOwned = Mascot::factory()->create();

        $user->mascots()->attach($owned->id, [
            'is_active' => false,
            'accessories' => json_encode([]),
            'unlocked_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/mascots');

        $mascots = collect($response->json('data.mascots'));
        $ownedEntry = $mascots->firstWhere('id', $owned->id);
        $notOwnedEntry = $mascots->firstWhere('id', $notOwned->id);

        $this->assertTrue($ownedEntry['is_owned']);
        $this->assertFalse($notOwnedEntry['is_owned']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Mascot Purchase
    // ──────────────────────────────────────────────────────────────────────────

    public function test_user_can_purchase_mascot_with_enough_pearls(): void
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 300]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 200]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(201)
            ->assertJsonPath('data.pearls_spent', 200)
            ->assertJsonPath('data.pearls_remaining', 100);

        $this->assertDatabaseHas('user_mascots', [
            'user_id' => $user->id,
            'mascot_id' => $mascot->id,
        ]);

        $this->assertEquals(100, $user->fresh()->pearls);
    }

    public function test_cannot_purchase_mascot_already_owned(): void
    {
        $user = $this->student();
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);
        $user->mascots()->attach($mascot->id, ['unlocked_at' => now()]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'MASCOT_ALREADY_OWNED');
    }

    public function test_cannot_purchase_mascot_with_insufficient_pearls(): void
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 50]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 200]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'INSUFFICIENT_PEARLS');

        $this->assertDatabaseMissing('user_mascots', [
            'user_id' => $user->id,
            'mascot_id' => $mascot->id,
        ]);
    }

    public function test_purchasing_mascot_does_not_activate_it(): void
    {
        $user = $this->student();
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);

        $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $this->assertDatabaseHas('user_mascots', [
            'user_id' => $user->id,
            'mascot_id' => $mascot->id,
            'is_active' => false,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Mascot Inventory
    // ──────────────────────────────────────────────────────────────────────────

    public function test_user_can_view_owned_mascots(): void
    {
        $user = $this->student();
        $owned = Mascot::factory()->count(2)->create();
        $notOwned = Mascot::factory()->create();

        $owned->each(fn ($m) => $user->mascots()->attach($m->id, ['unlocked_at' => now()]));

        $response = $this->actingAs($user)->getJson('/api/v1/mascots/inventory');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 2);

        $mascots = $response->json('data.mascots');
        $this->assertCount(2, $mascots);
    }

    public function test_inventory_includes_accessories_and_active_status(): void
    {
        $user = $this->student();
        $mascot = Mascot::factory()->create();

        $user->mascots()->attach($mascot->id, [
            'is_active' => true,
            'accessories' => json_encode(['hat' => 'cap1']),
            'unlocked_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/mascots/inventory');

        $mascots = $response->json('data.mascots');
        $this->assertTrue($mascots[0]['is_active']);
        $this->assertNotEmpty($mascots[0]['accessories']);
    }

    public function test_user_with_no_mascots_has_empty_inventory(): void
    {
        $user = $this->student();

        $response = $this->actingAs($user)->getJson('/api/v1/mascots/inventory');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 0)
            ->assertJsonPath('data.mascots', []);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Equip Mascot (via UserController::updateMascot - already exists)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_user_can_equip_owned_mascot(): void
    {
        $user = $this->student();
        $mascot = Mascot::factory()->create();
        $user->mascots()->attach($mascot->id, ['unlocked_at' => now()]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me/mascot', [
            'mascot_id' => $mascot->id,
            'accessories' => [
                'hat' => null,
                'glasses' => null,
                'outfit' => null,
                'background' => null,
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('user_mascots', [
            'user_id' => $user->id,
            'mascot_id' => $mascot->id,
            'is_active' => true,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Achievement Catalog
    // ──────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_achievement_catalog(): void
    {
        $user = $this->student();
        Achievement::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/v1/achievements');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $achievements = $response->json('data.achievements');
        $this->assertCount(3, $achievements);
        $this->assertArrayHasKey('is_earned', $achievements[0]);
        $this->assertFalse($achievements[0]['is_earned']);
    }

    public function test_achievement_catalog_shows_earned_status(): void
    {
        $user = $this->student();
        $earned = Achievement::factory()->create();
        $notEarned = Achievement::factory()->create();

        $user->achievements()->attach($earned->id, ['earned_at' => now()]);

        $response = $this->actingAs($user)->getJson('/api/v1/achievements');

        $achievements = collect($response->json('data.achievements'));
        $earnedEntry = $achievements->firstWhere('id', $earned->id);
        $notEarnedEntry = $achievements->firstWhere('id', $notEarned->id);

        $this->assertTrue($earnedEntry['is_earned']);
        $this->assertFalse($notEarnedEntry['is_earned']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. User Achievements (via UserController - already exists)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_user_can_view_their_earned_achievements(): void
    {
        $user = $this->student();
        $achievement = Achievement::factory()->create();
        $user->achievements()->attach($achievement->id, ['earned_at' => now()]);

        $response = $this->actingAs($user)->getJson('/api/v1/users/me/achievements');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 1);

        $achievements = $response->json('data.achievements');
        $this->assertEquals($achievement->id, $achievements[0]['id']);
    }

    public function test_user_with_no_achievements_gets_empty_list(): void
    {
        $user = $this->student();

        $response = $this->actingAs($user)->getJson('/api/v1/users/me/achievements');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 0)
            ->assertJsonPath('data.achievements', []);
    }
}
