<?php

namespace Tests\Feature;

use App\Models\Achievement;
use App\Models\Mascot;
use App\Models\User;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    public function test_student_can_list_active_invite_candidates_without_sensitive_data(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $candidate = User::factory()->create([
            'role' => 'student',
            'username' => 'candidate_user',
            'full_name' => 'Candidate User',
            'is_active' => true,
        ]);
        User::factory()->create(['role' => 'student', 'is_active' => false]);

        $response = $this->actingAs($student)
            ->getJson('/api/v1/users/invite-candidates?search=candidate');

        $response->assertOk()
            ->assertJsonPath('data.users.0.id', $candidate->id)
            ->assertJsonPath('data.users.0.username', 'candidate_user')
            ->assertJsonMissingPath('data.users.0.email')
            ->assertJsonMissingPath('data.users.0.password');
        $this->assertCount(1, $response->json('data.users'));
    }

    public function test_invite_candidate_list_excludes_current_user_and_non_students_are_forbidden(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        User::factory()->create(['role' => 'instructor', 'is_active' => true]);

        $this->actingAs($student)
            ->getJson('/api/v1/users/invite-candidates')
            ->assertOk()
            ->assertJsonMissing(['id' => $student->id]);

        $this->actingAs(User::factory()->create(['role' => 'instructor']))
            ->getJson('/api/v1/users/invite-candidates')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

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

    public function test_update_profile_bio_and_avatar_without_password()
    {
        $user = User::factory()->create([
            'username' => 'sameusername',
            'full_name' => 'Old Name',
            'bio' => 'Old bio',
            'email' => 'test@example.com',
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'username' => 'sameusername',
            'email' => 'test@example.com',
            'full_name' => 'New Name',
            'bio' => 'New bio',
            'avatar_url' => 'https://example.com/avatar.jpg',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user' => [
                    'id',
                    'username',
                    'email',
                    'full_name',
                    'role',
                    'avatar_url',
                    'bio',
                    'pearls',
                    'xp',
                    'level',
                    'updated_at',
                ],
            ],
            'error',
            'meta',
        ]);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'full_name' => 'New Name',
                    'bio' => 'New bio',
                    'avatar_url' => 'https://example.com/avatar.jpg',
                    'email' => 'test@example.com',
                ],
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => 'New Name',
            'bio' => 'New bio',
        ]);

        $user->refresh();
        $this->assertNotEquals('current_password', $user->password);
    }

    public function test_update_profile_email_without_password_fails()
    {
        $user = User::factory()->create([
            'email' => 'old@example.com',
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_update_profile_username_without_password_fails()
    {
        $user = User::factory()->create([
            'username' => 'oldusername',
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'username' => 'newusername',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);
    }

    public function test_update_profile_email_with_correct_password_succeeds()
    {
        $user = User::factory()->create([
            'email' => 'old@example.com',
            'password' => bcrypt('correctpassword'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'email' => 'new@example.com',
            'current_password' => 'correctpassword',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'email' => 'new@example.com',
                ],
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'new@example.com',
        ]);
    }

    public function test_update_profile_email_with_wrong_password_fails()
    {
        $user = User::factory()->create([
            'email' => 'old@example.com',
            'password' => bcrypt('correctpassword'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/users/me', [
            'email' => 'new@example.com',
            'current_password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['current_password']);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'old@example.com',
        ]);
    }

    public function test_change_password()
    {
        $user = User::factory()->create();
        $oldPassword = 'oldpassword123';
        $newPassword = 'newpassword123';

        $user->update(['password' => bcrypt($oldPassword)]);
        $token = $user->createToken('test-token');

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->putJson('/api/v1/users/me/password', [
                'current_password' => $oldPassword,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Old token should be revoked
        $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
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
