<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 4.3 Feature Tests
 *
 * Covers:
 *  1. Enrollment double-booking → 409 on second enroll
 *  2. Idempotent lesson completion XP (reward only fires once)
 *  3. Idempotent course completion pearls (reward only fires once)
 *  4. Non-enrolled student cannot access a non-preview lesson
 */
class EnrollmentAndLessonTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    /** Create a published course owned by an instructor */
    private function publishedCourse(): Course
    {
        $instructor = User::factory()->create(['role' => 'instructor']);

        return Course::factory()->create([
            'instructor_id' => $instructor->id,
            'status'        => 'published',
            'pearls_reward' => 50,
        ]);
    }

    /** Create a student (role = student) */
    private function student(): User
    {
        return User::factory()->create(['role' => 'student', 'pearls' => 0, 'xp' => 0]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Enrollment double-booking
    // ──────────────────────────────────────────────────────────────────────────

    public function test_student_can_enroll_in_a_published_course(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();

        $response = $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->id}/enroll");

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.enrollment.course_id', $course->id)
            ->assertJsonPath('data.enrollment.status', 'enrolled');

        $this->assertDatabaseHas('enrollments', [
            'user_id'   => $student->id,
            'course_id' => $course->id,
            'status'    => 'enrolled',
        ]);
    }

    public function test_enrolling_twice_returns_409_conflict(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();

        // First enroll
        Enrollment::factory()->create([
            'user_id'   => $student->id,
            'course_id' => $course->id,
            'status'    => 'enrolled',
        ]);

        // Second enroll attempt
        $response = $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->id}/enroll");

        $response->assertStatus(409)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'ALREADY_ENROLLED');
    }

    public function test_cannot_enroll_in_a_draft_course(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course     = Course::factory()->create([
            'instructor_id' => $instructor->id,
            'status'        => 'draft',
        ]);
        $student = $this->student();

        $response = $this->actingAs($student)
            ->postJson("/api/v1/courses/{$course->id}/enroll");

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'COURSE_NOT_AVAILABLE');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Idempotent lesson completion XP
    // ──────────────────────────────────────────────────────────────────────────

    public function test_completing_a_lesson_awards_xp_once(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();
        $lesson  = Lesson::factory()->create([
            'course_id'  => $course->id,
            'xp_reward'  => 30,
            'is_preview' => false,
            'order'      => 1,
        ]);

        Enrollment::factory()->create([
            'user_id'   => $student->id,
            'course_id' => $course->id,
            'status'    => 'enrolled',
        ]);

        // First completion
        $r1 = $this->actingAs($student)
            ->postJson("/api/v1/lessons/{$lesson->id}/complete");

        $r1->assertStatus(200)
           ->assertJsonPath('data.is_first_completion', true)
           ->assertJsonPath('data.xp_awarded', 30);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'xp' => 30]);

        // Second completion — XP must NOT be awarded again
        $r2 = $this->actingAs($student)
            ->postJson("/api/v1/lessons/{$lesson->id}/complete");

        $r2->assertStatus(200)
           ->assertJsonPath('data.is_first_completion', false)
           ->assertJsonPath('data.xp_awarded', 0);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'xp' => 30]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Idempotent course completion pearls
    // ──────────────────────────────────────────────────────────────────────────

    public function test_completing_all_lessons_awards_course_pearls_once(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse(); // pearls_reward = 50

        // Single lesson course so one completion = 100%
        $lesson = Lesson::factory()->create([
            'course_id'  => $course->id,
            'xp_reward'  => 10,
            'is_preview' => false,
            'order'      => 1,
        ]);

        $enrollment = Enrollment::factory()->create([
            'user_id'     => $student->id,
            'course_id'   => $course->id,
            'status'      => 'enrolled',
            'progress_pct'=> 0,
        ]);

        // First completion triggers 100% → pearls awarded
        $r1 = $this->actingAs($student)
            ->postJson("/api/v1/lessons/{$lesson->id}/complete");

        $r1->assertStatus(200)
           ->assertJsonPath('data.enrollment.transitioned_to_completed', true)
           ->assertJsonPath('data.enrollment.pearls_awarded', 50)
           ->assertJsonPath('data.enrollment.status', 'completed');

        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 50]);

        // Second completion — pearls must NOT be awarded again
        $r2 = $this->actingAs($student)
            ->postJson("/api/v1/lessons/{$lesson->id}/complete");

        $r2->assertStatus(200)
           ->assertJsonPath('data.enrollment.transitioned_to_completed', false)
           ->assertJsonPath('data.enrollment.pearls_awarded', 0);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 50]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Non-enrolled student cannot access a non-preview lesson
    // ──────────────────────────────────────────────────────────────────────────

    public function test_non_enrolled_student_cannot_access_non_preview_lesson(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();
        $lesson  = Lesson::factory()->create([
            'course_id'  => $course->id,
            'is_preview' => false,
            'order'      => 1,
        ]);

        $response = $this->actingAs($student)
            ->getJson("/api/v1/lessons/{$lesson->id}");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'LESSON_ACCESS_DENIED');
    }

    public function test_non_enrolled_student_can_access_preview_lesson(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();
        $lesson  = Lesson::factory()->create([
            'course_id'  => $course->id,
            'is_preview' => true,
            'order'      => 1,
        ]);

        $response = $this->actingAs($student)
            ->getJson("/api/v1/lessons/{$lesson->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.lesson.id', $lesson->id);
    }

    public function test_enrolled_student_can_access_non_preview_lesson(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();
        $lesson  = Lesson::factory()->create([
            'course_id'  => $course->id,
            'is_preview' => false,
            'order'      => 1,
        ]);

        Enrollment::factory()->create([
            'user_id'   => $student->id,
            'course_id' => $course->id,
            'status'    => 'enrolled',
        ]);

        $response = $this->actingAs($student)
            ->getJson("/api/v1/lessons/{$lesson->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.lesson.id', $lesson->id);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Unenroll
    // ──────────────────────────────────────────────────────────────────────────

    public function test_student_can_unenroll_from_a_course(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();

        Enrollment::factory()->create([
            'user_id'   => $student->id,
            'course_id' => $course->id,
            'status'    => 'enrolled',
        ]);

        $response = $this->actingAs($student)
            ->deleteJson("/api/v1/courses/{$course->id}/enroll");

        $response->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('enrollments', [
            'user_id'   => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_unenrolling_when_not_enrolled_returns_404(): void
    {
        $student = $this->student();
        $course  = $this->publishedCourse();

        $response = $this->actingAs($student)
            ->deleteJson("/api/v1/courses/{$course->id}/enroll");

        $response->assertStatus(404)
            ->assertJsonPath('error.code', 'NOT_ENROLLED');
    }
}
