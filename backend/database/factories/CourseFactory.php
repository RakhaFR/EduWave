<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'instructor_id' => User::factory(),
            'category' => fake()->randomElement(['technology', 'design', 'marine', 'language', 'science', 'business']),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'thumbnail_url' => fake()->imageUrl(800, 450, 'technology'),
            'trailer_url' => fake()->optional()->url(),
            'status' => fake()->randomElement(['draft', 'published', 'archived']),
            'pearls_reward' => fake()->numberBetween(10, 200),
            'duration_minutes' => fake()->numberBetween(30, 300),
        ];
    }
}
