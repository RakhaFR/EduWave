<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Tests\TestCase;

class CourseVisibilityTest extends TestCase
{
    public function test_guest_sees_only_published_courses()
    {
        Course::factory()->create(['status' => 'published', 'title' => 'Published Course']);
        Course::factory()->create(['status' => 'draft', 'title' => 'Draft Course']);
        Course::factory()->create(['status' => 'archived', 'title' => 'Archived Course']);

        $response = $this->getJson('/api/v1/courses');

        $response->assertStatus(200);
        $titles = array_column($response->json('data'), 'title');
        $this->assertContains('Published Course', $titles);
        $this->assertNotContains('Draft Course', $titles);
        $this->assertNotContains('Archived Course', $titles);
    }

    public function test_instructor_sees_own_draft_courses()
    {
        $instructorA = User::factory()->create(['role' => 'instructor']);
        $instructorB = User::factory()->create(['role' => 'instructor']);

        $publishedCourse = Course::factory()->create(['status' => 'published', 'title' => 'Published']);
        $instructorADraft = Course::factory()->create([
            'status' => 'draft',
            'title' => 'Instructor A Draft',
            'instructor_id' => $instructorA->id,
        ]);
        $instructorBDraft = Course::factory()->create([
            'status' => 'draft',
            'title' => 'Instructor B Draft',
            'instructor_id' => $instructorB->id,
        ]);

        $response = $this->actingAs($instructorA)->getJson('/api/v1/courses');

        $response->assertStatus(200);
        $titles = array_column($response->json('data'), 'title');
        $this->assertContains('Published', $titles);
        $this->assertContains('Instructor A Draft', $titles);
        $this->assertNotContains('Instructor B Draft', $titles);
    }

    public function test_admin_sees_all_courses_regardless_of_status()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        Course::factory()->create(['status' => 'published', 'title' => 'Published']);
        Course::factory()->create(['status' => 'draft', 'title' => 'Draft']);
        Course::factory()->create(['status' => 'archived', 'title' => 'Archived']);

        $response = $this->actingAs($admin)->getJson('/api/v1/courses');

        $response->assertStatus(200);
        $titles = array_column($response->json('data'), 'title');
        $this->assertContains('Published', $titles);
        $this->assertContains('Draft', $titles);
        $this->assertContains('Archived', $titles);
    }
}
