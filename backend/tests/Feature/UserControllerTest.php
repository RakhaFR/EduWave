<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Mascot;
use App\Models\User;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_me_returns_current_user_profile()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'testuser@gmail.com',
            'full_name' => 'Test User',
            'pearls' => 100,
            'xp' => 500,
            'level' => 5,
            'streak_days' => 3,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/users/me');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => 'testuser',
                    'email' => 'testuser@gmail.com',
                    'full_name' => 'Test User',
                    'pearls' => 100,
                    'xp' => 500,
                    'level' => 5,
                    'streak_days' => 3,
                ],
            ],
        ]);
    }

    public function test_update_profile()
    {
        $user = User::factory()->create([
            'full_name' => 'Old Name',
            'bio' => 'Old bio',
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'full_name' => 'New Name',
            'username' => $user->username,
            'email' => $user->email,
            'bio' => 'New bio',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'full_name' => 'New Name',
                    'bio' => 'New bio',
                ],
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => 'New Name',
            'bio' => 'New bio',
        ]);
    }

    public function test_change_password()
    {
        $user = User::factory()->create();
        $oldPassword = 'oldpassword123';
        $newPassword = 'newpassword123';

        $user->update(['password' => bcrypt($oldPassword)]);
        $token = $user->createToken('test-token');

        $response = $this->withHeader('Authorization', 'Bearer ' . $token->plainTextToken)
            ->putJson('/api/v1/users/me/password', [
                'current_password' => $oldPassword,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Old token should be revoked
        $this->withHeader('Authorization', 'Bearer ' . $token->plainTextToken)
            ->getJson('/api/v1/users/me')
            ->assertStatus(401);

        // But new login should work
        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $newPassword,
        ])->assertStatus(200);
    }

    public function test_change_password_rejects_wrong_current()
    {
        $user = User::factory()->create();
        $user->update(['password' => bcrypt('correctpassword')]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me/password', [
            'current_password' => 'wrongpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'error' => [
                'code' => 'AUTH_INVALID_CREDENTIALS',
            ],
        ]);
    }

    public function test_stats_returns_user_statistics()
    {
        $user = User::factory()->create([
            'pearls' => 150,
            'xp' => 750,
            'level' => 7,
            'streak_days' => 5,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/users/me/stats');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'stats' => [
                    'pearls' => 150,
                    'xp' => 750,
                    'level' => 7,
                    'streak_days' => 5,
                ],
            ],
        ]);
    }

    public function test_update_mascot_for_owned_mascot()
    {
        $user = User::factory()->create();
        $mascot = Mascot::factory()->create();

        // User owns this mascot
        $user->mascots()->attach($mascot->id, ['is_active' => false, 'accessories' => '{}']);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me/mascot', [
            'mascot_id' => $mascot->id,
            'accessories' => [
                'hat' => 'hat-01',
                'glasses' => 'glasses-02',
                'outfit' => 'outfit-03',
                'background' => 'bg-04',
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'mascot_id' => $mascot->id,
                'is_active' => true,
            ],
        ]);

        $updated = $user->mascots()->find($mascot->id);
        $this->assertTrue($updated->pivot->is_active);
        $this->assertEquals([
            'hat' => 'hat-01',
            'glasses' => 'glasses-02',
            'outfit' => 'outfit-03',
            'background' => 'bg-04',
        ], json_decode($updated->pivot->accessories, true));
    }

    public function test_update_mascot_rejects_not_owned()
    {
        $user = User::factory()->create();
        $mascot = Mascot::factory()->create();

        // User does NOT own this mascot

        $response = $this->actingAs($user)->putJson('/api/v1/users/me/mascot', [
            'mascot_id' => $mascot->id,
            'accessories' => [
                'hat' => 'hat-01',
                'glasses' => null,
                'outfit' => null,
                'background' => null,
            ],
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'error' => [
                'code' => 'MASCOT_NOT_OWNED',
            ],
        ]);
    }

    public function test_achievements_returns_earned_achievements()
    {
        $user = User::factory()->create();
        $achievement1 = Achievement::factory()->create(['name' => 'First Course']);
        $achievement2 = Achievement::factory()->create(['name' => 'Level 10']);

        $user->achievements()->attach($achievement1->id);
        $user->achievements()->attach($achievement2->id);

        $response = $this->actingAs($user)->getJson('/api/v1/users/me/achievements');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'count' => 2,
            ],
        ]);

        $achievements = $response->json('data.achievements');
        $this->assertCount(2, $achievements);
        $names = array_column($achievements, 'name');
        $this->assertContains('First Course', $names);
        $this->assertContains('Level 10', $names);
    }

    public function test_achievements_returns_empty_for_no_achievements()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/users/me/achievements');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'achievements' => [],
                'count' => 0,
            ],
        ]);
    }
}

