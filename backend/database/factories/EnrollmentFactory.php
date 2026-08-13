<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'progress_pct' => fake()->randomFloat(2, 0, 100),
            'status' => fake()->randomElement(['enrolled', 'completed', 'dropped']),
            'enrolled_at' => now()->subDays(fake()->numberBetween(1, 30)),
            'completed_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
