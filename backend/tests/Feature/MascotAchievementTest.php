<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Mascot;
use App\Models\User;
use App\Services\GamificationService;
use Tests\TestCase;

class MascotAchievementTest extends TestCase
{
    protected $gamificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gamificationService = app(GamificationService::class);
    }

    // ──────────────────────────────────────────────────────
    // Mascot Tests
    // ──────────────────────────────────────────────────────

    public function test_can_list_all_mascots_in_catalog()
    {
        $user = User::factory()->create(['role' => 'student']);

        Mascot::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/v1/mascots');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'mascots' => [
                        '*' => ['id', 'name', 'avatar_url', 'description', 'unlock_cost', 'rarity', 'category', 'is_owned'],
                    ],
                    'count',
                ],
                'error',
                'meta',
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 3,
                ],
            ]);
    }

    public function test_can_filter_mascots_by_rarity()
    {
        $user = User::factory()->create(['role' => 'student']);

        Mascot::factory()->create(['rarity' => 'common']);
        Mascot::factory()->create(['rarity' => 'rare']);
        Mascot::factory()->create(['rarity' => 'legendary']);

        $response = $this->actingAs($user)->getJson('/api/v1/mascots?rarity=rare');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 1,
                ],
            ]);
    }

    public function test_can_view_user_mascot_inventory()
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 500]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);

        // User owns this mascot
        $user->mascots()->attach($mascot->id, [
            'is_active' => true,
            'accessories' => json_encode(['hat' => 'captain-hat']),
            'unlocked_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/mascots/inventory');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'mascots' => [
                        '*' => ['id', 'name', 'avatar_url', 'description', 'rarity', 'category', 'is_active', 'accessories', 'unlocked_at'],
                    ],
                    'count',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 1,
                    'mascots' => [
                        [
                            'id' => $mascot->id,
                            'is_active' => true,
                            'accessories' => ['hat' => 'captain-hat'],
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_purchase_a_mascot_with_sufficient_pearls()
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 500]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'mascot' => [
                        'id' => $mascot->id,
                        'name' => $mascot->name,
                    ],
                    'pearls_spent' => 100,
                    'pearls_remaining' => 400,
                ],
            ]);

        // Verify database
        $user->refresh();
        $this->assertEquals(400, $user->pearls);
        $this->assertTrue($user->mascots()->where('mascot_id', $mascot->id)->exists());
    }

    public function test_cannot_purchase_mascot_with_insufficient_pearls()
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 50]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => [
                    'code' => 'INSUFFICIENT_PEARLS',
                ],
            ]);

        // Verify no changes
        $user->refresh();
        $this->assertEquals(50, $user->pearls);
        $this->assertFalse($user->mascots()->where('mascot_id', $mascot->id)->exists());
    }

    public function test_cannot_purchase_already_owned_mascot()
    {
        $user = User::factory()->create(['role' => 'student', 'pearls' => 500]);
        $mascot = Mascot::factory()->create(['unlock_cost' => 100]);

        // Already owns this mascot
        $user->mascots()->attach($mascot->id, [
            'is_active' => false,
            'accessories' => null,
            'unlocked_at' => now(),
        ]);

        $response = $this->actingAs($user)->postJson("/api/v1/mascots/{$mascot->id}/purchase");

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'error' => [
                    'code' => 'MASCOT_ALREADY_OWNED',
                ],
            ]);
    }

    public function test_can_equip_owned_mascot_with_accessories()
    {
        $user = User::factory()->create(['role' => 'student']);
        $mascot1 = Mascot::factory()->create();
        $mascot2 = Mascot::factory()->create();

        // User owns both mascots
        $user->mascots()->attach($mascot1->id, ['is_active' => true, 'accessories' => null, 'unlocked_at' => now()]);
        $user->mascots()->attach($mascot2->id, ['is_active' => false, 'accessories' => null, 'unlocked_at' => now()]);

        $accessories = [
            'hat' => 'captain-hat',
            'glasses' => 'sunglasses',
        ];

        $response = $this->actingAs($user)->putJson('/api/v1/mascots/equip', [
            'mascot_id' => $mascot2->id,
            'accessories' => $accessories,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'mascot_id' => $mascot2->id,
                    'accessories' => $accessories,
                    'is_active' => true,
                ],
            ]);

        // Verify that mascot2 is now active and mascot1 is deactivated
        $this->assertEquals(1, $user->mascots()->where('mascot_id', $mascot2->id)->first()->pivot->is_active);
        $this->assertEquals(0, $user->mascots()->where('mascot_id', $mascot1->id)->first()->pivot->is_active);
    }

    public function test_cannot_equip_mascot_not_owned()
    {
        $user = User::factory()->create(['role' => 'student']);
        $mascot = Mascot::factory()->create();

        $response = $this->actingAs($user)->putJson('/api/v1/mascots/equip', [
            'mascot_id' => $mascot->id,
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'error' => [
                    'code' => 'MASCOT_NOT_OWNED',
                ],
            ]);
    }

    // ──────────────────────────────────────────────────────
    // Achievement Tests
    // ──────────────────────────────────────────────────────

    public function test_can_list_all_achievements()
    {
        $user = User::factory()->create(['role' => 'student']);

        Achievement::factory()->count(5)->create();

        $response = $this->actingAs($user)->getJson('/api/v1/achievements');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'achievements' => [
                        '*' => ['id', 'name', 'description', 'icon_url', 'condition_type', 'condition_value', 'pearls_reward', 'is_earned', 'earned_at'],
                    ],
                    'count',
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 5,
                ],
            ]);
    }

    public function test_can_filter_achievements_by_condition_type()
    {
        $user = User::factory()->create(['role' => 'student']);

        Achievement::factory()->create(['condition_type' => 'course_completion', 'condition_value' => 1]);
        Achievement::factory()->create(['condition_type' => 'course_completion', 'condition_value' => 5]);
        Achievement::factory()->create(['condition_type' => 'xp_milestone', 'condition_value' => 1000]);

        $response = $this->actingAs($user)->getJson('/api/v1/achievements?type=course_completion');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 2,
                ],
            ]);
    }

    public function test_can_view_user_earned_achievements()
    {
        $user = User::factory()->create(['role' => 'student']);
        $achievement1 = Achievement::factory()->create(['pearls_reward' => 50]);
        $achievement2 = Achievement::factory()->create(['pearls_reward' => 100]);

        // User has earned these achievements
        $user->achievements()->attach($achievement1->id, ['earned_at' => now()]);
        $user->achievements()->attach($achievement2->id, ['earned_at' => now()]);

        $response = $this->actingAs($user)->getJson('/api/v1/achievements/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'count' => 2,
                    'total_pearls_earned' => 150,
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'achievements' => [
                        '*' => ['id', 'name', 'description', 'icon_url', 'condition_type', 'condition_value', 'pearls_reward', 'earned_at'],
                    ],
                ],
            ]);
    }

    public function test_can_view_specific_achievement_with_progress()
    {
        $user = User::factory()->create(['role' => 'student', 'xp' => 500]);
        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 1000,
            'pearls_reward' => 100,
        ]);

        $response = $this->actingAs($user)->getJson("/api/v1/achievements/{$achievement->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $achievement->id,
                    'is_earned' => false,
                    'progress' => [
                        'current' => 500,
                        'target' => 1000,
                        'percentage' => 50.0,
                    ],
                ],
            ]);
    }

    // ──────────────────────────────────────────────────────
    // GamificationService Tests
    // ──────────────────────────────────────────────────────

    public function test_gamification_service_can_award_pearls()
    {
        $user = User::factory()->create(['pearls' => 100]);

        $newBalance = $this->gamificationService->awardPearls($user, 50);

        $this->assertEquals(150, $newBalance);
        $user->refresh();
        $this->assertEquals(150, $user->pearls);
    }

    public function test_gamification_service_can_spend_pearls()
    {
        $user = User::factory()->create(['pearls' => 100]);

        $newBalance = $this->gamificationService->spendPearls($user, 30);

        $this->assertEquals(70, $newBalance);
        $user->refresh();
        $this->assertEquals(70, $user->pearls);
    }

    public function test_gamification_service_throws_exception_when_spending_more_pearls_than_available()
    {
        $user = User::factory()->create(['pearls' => 50]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Insufficient pearls');

        $this->gamificationService->spendPearls($user, 100);
    }

    public function test_gamification_service_can_award_xp_and_calculate_level()
    {
        $user = User::factory()->create(['xp' => 0, 'level' => 1]);

        $result = $this->gamificationService->awardXp($user, 500);

        $this->assertEquals(500, $result['xp_awarded']);
        $this->assertEquals(500, $result['total_xp']);
        $this->assertEquals(3, $result['new_level']); // sqrt(500/100) + 1 = floor(2.23) + 1 = 3
        $this->assertTrue($result['leveled_up']);

        $user->refresh();
        $this->assertEquals(500, $user->xp);
        $this->assertEquals(3, $user->level);
    }

    public function test_gamification_service_calculates_correct_level_from_xp()
    {
        $this->assertEquals(1, $this->gamificationService->calculateLevel(0));
        $this->assertEquals(2, $this->gamificationService->calculateLevel(100));
        $this->assertEquals(3, $this->gamificationService->calculateLevel(400));
        $this->assertEquals(4, $this->gamificationService->calculateLevel(900));
        $this->assertEquals(11, $this->gamificationService->calculateLevel(10000));
    }

    public function test_gamification_service_can_check_and_award_achievements()
    {
        $user = User::factory()->create(['pearls' => 0]);
        $achievement = Achievement::factory()->create([
            'condition_type' => 'course_completion',
            'condition_value' => 5,
            'pearls_reward' => 100,
        ]);

        // User hasn't earned it yet
        $this->assertEquals(0, $user->achievements()->count());

        // Check achievements with current value = 5 (meets condition)
        $awarded = $this->gamificationService->checkAchievements($user, 'course_completion', 5);

        $this->assertCount(1, $awarded);
        $this->assertEquals($achievement->id, $awarded[0]['id']);

        // Verify achievement was attached
        $user->refresh();
        $this->assertEquals(1, $user->achievements()->count());
        $this->assertEquals(100, $user->pearls); // Reward was awarded
    }

    public function test_gamification_service_does_not_award_same_achievement_twice()
    {
        $user = User::factory()->create(['pearls' => 0]);
        $achievement = Achievement::factory()->create([
            'condition_type' => 'xp_milestone',
            'condition_value' => 100,
            'pearls_reward' => 50,
        ]);

        // Award first time
        $awarded1 = $this->gamificationService->checkAchievements($user, 'xp_milestone', 150);
        $this->assertCount(1, $awarded1);

        $user->refresh();
        $this->assertEquals(50, $user->pearls);

        // Try to award again with even higher XP
        $awarded2 = $this->gamificationService->checkAchievements($user, 'xp_milestone', 200);
        $this->assertCount(0, $awarded2); // Should not award again

        $user->refresh();
        $this->assertEquals(50, $user->pearls); // No additional pearls
    }
}
