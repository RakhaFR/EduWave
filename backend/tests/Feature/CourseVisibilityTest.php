<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lesson;
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

    public function test_only_owner_instructor_or_admin_can_view_draft_course_details(): void
    {
        $owner = User::factory()->create(['role' => 'instructor']);
        $otherInstructor = User::factory()->create(['role' => 'instructor']);
        $admin = User::factory()->create(['role' => 'admin']);
        $course = Course::factory()->create([
            'instructor_id' => $owner->id,
            'status' => 'draft',
        ]);

        $this->getJson("/api/v1/courses/{$course->id}")->assertNotFound();
        $this->actingAs($otherInstructor)->getJson("/api/v1/courses/{$course->id}")->assertNotFound();
        $this->actingAs($owner)->getJson("/api/v1/courses/{$course->id}")->assertOk();
        $this->actingAs($admin)->getJson("/api/v1/courses/{$course->id}")->assertOk();
    }

    public function test_instructor_cannot_transfer_course_ownership(): void
    {
        $owner = User::factory()->create(['role' => 'instructor']);
        $otherInstructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $owner->id]);

        $this->actingAs($owner)->putJson("/api/v1/courses/{$course->id}", [
            'title' => 'Updated title',
            'instructor_id' => $otherInstructor->id,
        ])->assertOk();

        $this->assertSame($owner->id, $course->fresh()->instructor_id);
    }

    public function test_instructor_cannot_move_lesson_to_another_instructors_course(): void
    {
        $owner = User::factory()->create(['role' => 'instructor']);
        $otherInstructor = User::factory()->create(['role' => 'instructor']);
        $sourceCourse = Course::factory()->create(['instructor_id' => $owner->id]);
        $targetCourse = Course::factory()->create(['instructor_id' => $otherInstructor->id]);
        $lesson = Lesson::factory()->create(['course_id' => $sourceCourse->id]);

        $this->actingAs($owner)->putJson("/api/v1/lessons/{$lesson->id}", [
            'course_id' => $targetCourse->id,
        ])->assertForbidden();

        $this->assertSame($sourceCourse->id, $lesson->fresh()->course_id);
    }
}
