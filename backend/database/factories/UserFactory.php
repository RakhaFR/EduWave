<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password;

    public function definition(): array
    {
        $fullName = fake()->name();
        $username = fake()->unique()->userName();

        return [
            'id' => (string) Str::uuid(),
            'username' => $username,
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'full_name' => $fullName,
            'bio' => fake()->optional()->paragraph(),
            'avatar_url' => fake()->optional()->imageUrl(200, 200, 'people'),
            'role' => fake()->randomElement(['student', 'instructor', 'admin']),
            'pearls' => fake()->numberBetween(0, 5000),
            'xp' => fake()->numberBetween(0, 10000),
            'level' => fake()->numberBetween(1, 100),
            'streak_days' => fake()->numberBetween(0, 30),
            'last_active' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }
}
