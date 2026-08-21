<?php

namespace Tests\Feature;

use App\Models\Mascot;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    public function test_register_creates_new_user_and_returns_token()
    {
        $defaultMascot = Mascot::factory()->create(['id' => Mascot::DEFAULT_ID]);

        $response = $this->postJson('/api/v1/auth/register', [
            'username' => 'penjelajah_baru',
            'email' => 'test.user@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Budi Santoso',
        ]);

        $response->assertStatus(201);
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
                    'pearls',
                    'xp',
                    'level',
                    'created_at',
                ],
                'token',
                'token_type',
            ],
            'error',
            'meta',
        ]);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'username' => 'penjelajah_baru',
                    'email' => 'test.user@gmail.com',
                    'full_name' => 'Budi Santoso',
                    'role' => 'student',
                    'pearls' => 0,
                    'xp' => 0,
                    'level' => 1,
                ],
                'token_type' => 'Bearer',
            ],
        ]);

        $this->assertDatabaseHas('users', ['email' => 'test.user@gmail.com']);
        $this->assertDatabaseHas('user_mascots', [
            'user_id' => $response->json('data.user.id'),
            'mascot_id' => $defaultMascot->id,
            'is_active' => true,
        ]);
    }

    public function test_register_can_create_an_instructor_account(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'username' => 'instructor_baru',
            'email' => 'instructor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Siti Pengajar',
            'role' => 'instructor',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'instructor');

        $this->assertDatabaseHas('users', [
            'email' => 'instructor@example.com',
            'role' => 'instructor',
        ]);
    }

    public function test_register_rejects_admin_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'username' => 'admin_baru',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Admin Baru',
            'role' => 'admin',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('role');
    }

    public function test_register_rejects_duplicate_email()
    {
        User::factory()->create(['email' => 'duplicate@gmail.com']);

        $response = $this->postJson('/api/v1/auth/register', [
            'username' => 'another_user',
            'email' => 'duplicate@gmail.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'full_name' => 'Another User',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_with_correct_credentials()
    {
        $user = User::factory()->create([
            'email' => 'login@gmail.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@gmail.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user' => ['id', 'username', 'email', 'full_name', 'role'],
                'token',
                'token_type',
            ],
        ]);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'email' => 'login@gmail.com',
                ],
            ],
        ]);
    }

    public function test_login_with_username(): void
    {
        $user = User::factory()->create([
            'username' => 'ocean_student',
            'password' => bcrypt('password123'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'username' => 'ocean_student',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.user.id', $user->id);
    }

    public function test_login_rejects_incorrect_password()
    {
        User::factory()->create([
            'email' => 'wrong@gmail.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong@gmail.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'error' => [
                'code' => 'AUTH_INVALID_CREDENTIALS',
            ],
        ]);
    }

    public function test_login_rejects_nonexistent_user()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@gmail.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'error' => [
                'code' => 'AUTH_INVALID_CREDENTIALS',
            ],
        ]);
    }

    public function test_login_rejects_inactive_user()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'error' => [
                'code' => 'AUTH_ACCOUNT_INACTIVE',
            ],
        ]);
    }

    public function test_logout_revokes_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test');

        $response = $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Token should be revoked
        $this->withHeader('Authorization', 'Bearer '.$token->plainTextToken)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_me_returns_current_user()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'test@example.com',
            'full_name' => 'Test User',
            'pearls' => 100,
            'xp' => 500,
            'level' => 5,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => 'testuser',
                    'email' => 'test@example.com',
                    'full_name' => 'Test User',
                    'pearls' => 100,
                    'xp' => 500,
                    'level' => 5,
                ],
            ],
        ]);
    }

    public function test_me_rejects_unauthenticated_request()
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
