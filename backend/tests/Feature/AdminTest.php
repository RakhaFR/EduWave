<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    protected function student(): User
    {
        return User::factory()->create(['role' => 'student']);
    }

    protected function instructor(): User
    {
        return User::factory()->create(['role' => 'instructor']);
    }

    public function test_admin_can_list_all_users(): void
    {
        $admin = $this->admin();
        User::factory()->count(5)->create();

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'username', 'email', 'role', 'created_at'],
                ],
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ]);
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = $this->admin();
        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->count(2)->create(['role' => 'instructor']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users?role=student');

        $response->assertStatus(200);
        $this->assertEquals(3, count($response->json('data')));
    }

    public function test_admin_can_search_users(): void
    {
        $admin = $this->admin();
        User::factory()->create(['username' => 'john_doe', 'email' => 'john@example.com']);
        User::factory()->create(['username' => 'jane_smith', 'email' => 'jane@example.com']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users?search=john');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_admin_can_update_user_role(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/users/{$student->id}/role", [
            'role' => 'instructor',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.user.role', 'instructor');

        $this->assertEquals('instructor', $student->fresh()->role);
    }

    public function test_admin_can_delete_student_user(): void
    {
        $admin = $this->admin();
        $student = $this->student();

        $response = $this->actingAs($admin)->deleteJson("/api/v1/admin/users/{$student->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('users', ['id' => $student->id]);
    }

    public function test_admin_cannot_delete_another_admin(): void
    {
        $admin = $this->admin();
        $anotherAdmin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/admin/users/{$anotherAdmin->id}");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'CANNOT_DELETE_ADMIN');

        $this->assertDatabaseHas('users', ['id' => $anotherAdmin->id]);
    }

    public function test_student_cannot_access_admin_routes(): void
    {
        $student = $this->student();

        $response = $this->actingAs($student)->getJson('/api/v1/admin/users');

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    public function test_instructor_cannot_access_admin_routes(): void
    {
        $instructor = $this->instructor();

        $response = $this->actingAs($instructor)->getJson('/api/v1/admin/users');

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    public function test_admin_can_list_all_courses(): void
    {
        $admin = $this->admin();
        $instructor = $this->instructor();

        Course::factory()->count(3)->create(['instructor_id' => $instructor->id, 'status' => 'published']);
        Course::factory()->count(2)->create(['instructor_id' => $instructor->id, 'status' => 'draft']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/courses');

        $response->assertStatus(200);
        $this->assertEquals(5, count($response->json('data')));
    }

    public function test_admin_can_filter_courses_by_status(): void
    {
        $admin = $this->admin();
        $instructor = $this->instructor();

        Course::factory()->count(3)->create(['instructor_id' => $instructor->id, 'status' => 'published']);
        Course::factory()->count(2)->create(['instructor_id' => $instructor->id, 'status' => 'draft']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/courses?status=draft');

        $response->assertStatus(200);
        $this->assertEquals(2, count($response->json('data')));
    }

    public function test_admin_can_update_course_status(): void
    {
        $admin = $this->admin();
        $instructor = $this->instructor();
        $course = Course::factory()->create(['instructor_id' => $instructor->id, 'status' => 'draft']);

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/courses/{$course->id}/status", [
            'status' => 'published',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.course.status', 'published');

        $this->assertEquals('published', $course->fresh()->status);
    }

    public function test_admin_can_view_analytics_overview(): void
    {
        $admin = $this->admin();
        User::factory()->count(10)->create();
        Course::factory()->count(5)->create(['instructor_id' => $this->instructor()->id]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/analytics/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'users' => ['total', 'active', 'students', 'instructors'],
                    'courses' => ['total', 'published', 'draft'],
                    'enrollments' => ['total', 'active', 'completed'],
                    'exams' => ['total_attempts', 'passed_attempts', 'average_score'],
                    'recent_users',
                    'top_courses',
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_admin_routes(): void
    {
        $response = $this->getJson('/api/v1/admin/users');

        $response->assertStatus(401);
    }

    public function test_admin_user_list_includes_pagination(): void
    {
        $admin = $this->admin();
        User::factory()->count(25)->create();

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/users?per_page=10');

        $response->assertStatus(200)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.current_page', 1);

        $this->assertLessThanOrEqual(10, count($response->json('data')));
    }

    public function test_admin_course_list_includes_instructor_and_counts(): void
    {
        $admin = $this->admin();
        $instructor = $this->instructor();
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/courses');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'instructor' => ['id', 'full_name', 'email'],
                        'enrollments_count',
                        'lessons_count',
                    ],
                ],
            ]);
    }
}
