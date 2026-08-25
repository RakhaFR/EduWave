<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 4.4 Feature Tests — ExamController, AttemptController, ExamService
 */
class ExamAndAttemptTest extends TestCase
{
    use RefreshDatabase;

    private function student(): User
    {
        return User::factory()->create(['role' => 'student', 'pearls' => 0, 'xp' => 0]);
    }

    private function instructor(): User
    {
        return User::factory()->create(['role' => 'instructor']);
    }

    private function createExam(array $attributes = []): Exam
    {
        $instructor = $this->instructor();
        $course = Course::factory()->create([
            'instructor_id' => $instructor->id,
            'status' => 'published',
        ]);

        return Exam::factory()->create(array_merge([
            'course_id' => $course->id,
            'title' => 'Ujian Laravel',
            'time_limit_sec' => 3600,
            'passing_score' => 70,
            'max_attempts' => 2,
            'pearls_reward' => 30,
        ], $attributes));
    }

    private function enroll(User $student, Exam $exam): void
    {
        Enrollment::factory()->create([
            'user_id' => $student->id,
            'course_id' => $exam->course_id,
            'status' => 'enrolled',
            'progress_pct' => 0,
            'completed_at' => null,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. SECURITY REQUIREMENT: No Answer Key Leakage for In-Progress Attempts
    // ──────────────────────────────────────────────────────────────────────────

    public function test_in_progress_exam_start_does_not_leak_correct_answer_or_explanation(): void
    {
        $student = $this->student();
        $exam = $this->createExam();
        $this->enroll($student, $exam);

        ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'question_text' => 'Apa kepanjangan MVC?',
            'type' => 'multiple_choice',
            'options' => [
                ['key' => 'A', 'value' => 'Model View Controller'],
                ['key' => 'B', 'value' => 'Main View Core'],
            ],
            'correct_answer' => 'A',
            'explanation' => 'MVC singkatan dari Model View Controller.',
            'points' => 10,
            'order' => 1,
        ]);

        $response = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $jsonString = $response->getContent();

        // Strict assertion: correct_answer and explanation must not be present in raw response
        $this->assertStringNotContainsString('correct_answer', $jsonString);
        $this->assertStringNotContainsString('explanation', $jsonString);
        $this->assertStringContainsString('Model View Controller', $jsonString); // Option value SHOULD be visible
    }

    public function test_exam_show_does_not_leak_correct_answer_or_explanation(): void
    {
        $student = $this->student();
        $exam = $this->createExam();
        $this->enroll($student, $exam);

        ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'question_text' => 'Soal Ujian',
            'correct_answer' => 'B',
            'explanation' => 'Penjelasan rahasia',
        ]);

        $response = $this->actingAs($student)
            ->getJson("/api/v1/exams/{$exam->id}");

        $response->assertStatus(200);

        $jsonString = $response->getContent();
        $this->assertStringNotContainsString('correct_answer', $jsonString);
        $this->assertStringNotContainsString('explanation', $jsonString);
    }

    public function test_exam_mode_and_fullscreen_configuration_are_exposed(): void
    {
        $student = $this->student();
        $exam = $this->createExam([
            'mode' => 'quiz',
            'requires_fullscreen' => false,
        ]);
        $this->enroll($student, $exam);

        $this->actingAs($student)
            ->getJson("/api/v1/exams/{$exam->id}")
            ->assertOk()
            ->assertJsonPath('data.mode', 'quiz')
            ->assertJsonPath('data.requires_fullscreen', false);
    }

    public function test_started_attempt_includes_exam_mode_configuration(): void
    {
        $student = $this->student();
        $exam = $this->createExam([
            'mode' => 'quiz',
            'requires_fullscreen' => false,
        ]);
        $this->enroll($student, $exam);
        ExamQuestion::factory()->create(['exam_id' => $exam->id]);

        $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts")
            ->assertCreated()
            ->assertJsonPath('data.exam.mode', 'quiz')
            ->assertJsonPath('data.exam.requires_fullscreen', false);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Start Exam Attempt & Resume (Idempotency)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_starting_an_exam_twice_returns_the_same_in_progress_attempt(): void
    {
        $student = $this->student();
        $exam = $this->createExam(['max_attempts' => 2]);
        $this->enroll($student, $exam);

        // First start
        $r1 = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");
        $r1->assertStatus(201);
        $attemptId1 = $r1->json('data.attempt_id');

        // Second start while first is still in_progress
        $r2 = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");
        $r2->assertStatus(201);
        $attemptId2 = $r2->json('data.attempt_id');

        $this->assertEquals($attemptId1, $attemptId2);
        $this->assertDatabaseCount('exam_attempts', 1);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Max Attempts Limit (Policy Enforcement)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_starting_new_attempt_when_at_max_attempts_is_blocked_by_policy(): void
    {
        $student = $this->student();
        $exam = $this->createExam(['max_attempts' => 2]);
        $this->enroll($student, $exam);

        // Create 2 submitted attempts
        ExamAttempt::factory()->create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'submitted_at' => now()->subHours(2),
        ]);
        ExamAttempt::factory()->create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'submitted_at' => now()->subHour(),
        ]);

        // Attempt 3 -> should fail policy limit check
        $response = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");

        $response->assertStatus(403);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Grading Logic & Score Calculation
    // ──────────────────────────────────────────────────────────────────────────

    public function test_submitting_attempt_grades_correctly(): void
    {
        $student = $this->student();
        $exam = $this->createExam(['passing_score' => 70, 'pearls_reward' => 50]);
        $this->enroll($student, $exam);

        $q1 = ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'correct_answer' => 'A',
            'points' => 10,
            'order' => 1,
        ]);
        $q2 = ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'correct_answer' => 'B',
            'points' => 10,
            'order' => 2,
        ]);

        $startRes = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");
        $attemptId = $startRes->json('data.attempt_id');

        // Submit: 1 correct (A), 1 incorrect (C) -> 50%
        $submitRes = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId}/submit", [
                'answers' => [
                    ['question_id' => $q1->id, 'selected_key' => 'A'],
                    ['question_id' => $q2->id, 'selected_key' => 'C'],
                ],
            ]);

        $submitRes->assertStatus(200)
            ->assertJsonPath('data.score', 50)
            ->assertJsonPath('data.passed', false)
            ->assertJsonPath('data.pearls_earned', 0)
            ->assertJsonPath('data.correct_count', 1);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 0]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Reward Idempotency (Pearls awarded once on pass)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_passing_exam_awards_pearls_once(): void
    {
        $student = $this->student();
        $exam = $this->createExam(['passing_score' => 70, 'pearls_reward' => 50, 'max_attempts' => 3]);
        $this->enroll($student, $exam);

        $q1 = ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'correct_answer' => 'A',
            'points' => 10,
            'order' => 1,
        ]);

        // Attempt 1 -> 100% pass -> gets 50 pearls
        $start1 = $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts");
        $attemptId1 = $start1->json('data.attempt_id');

        $sub1 = $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId1}/submit", [
            'answers' => [
                ['question_id' => $q1->id, 'selected_key' => 'A'],
            ],
        ]);
        $sub1->assertStatus(200)
            ->assertJsonPath('data.passed', true)
            ->assertJsonPath('data.pearls_earned', 50);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 50]);

        // Repeat submit on same attempt -> idempotently returns existing result without double awarding
        $repeatSub = $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId1}/submit", [
            'answers' => [
                ['question_id' => $q1->id, 'selected_key' => 'A'],
            ],
        ]);
        $repeatSub->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 50]);

        // Attempt 2 -> passes again -> pearls MUST NOT be awarded a second time
        $start2 = $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts");
        $attemptId2 = $start2->json('data.attempt_id');

        $sub2 = $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId2}/submit", [
            'answers' => [
                ['question_id' => $q1->id, 'selected_key' => 'A'],
            ],
        ]);
        $sub2->assertStatus(200)
            ->assertJsonPath('data.passed', true)
            ->assertJsonPath('data.pearls_earned', 0);

        $this->assertDatabaseHas('users', ['id' => $student->id, 'pearls' => 50]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. XP Award Regression Test (Phase 4.5 Bug Fix)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_exam_submission_actually_increments_user_xp_in_database(): void
    {
        $student = $this->student();
        $initialXp = $student->xp;
        $this->assertEquals(0, $initialXp, 'Student should start with 0 XP');

        $exam = $this->createExam(['passing_score' => 70]);
        $this->enroll($student, $exam);

        $q1 = ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'correct_answer' => 'A',
            'points' => 50,
            'order' => 1,
        ]);
        $q2 = ExamQuestion::factory()->create([
            'exam_id' => $exam->id,
            'correct_answer' => 'B',
            'points' => 50,
            'order' => 2,
        ]);

        $startRes = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts");
        $attemptId = $startRes->json('data.attempt_id');

        // Submit with 100% correct answers -> score 100 -> xp_earned = 100 * 2 = 200
        $submitRes = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId}/submit", [
                'answers' => [
                    ['question_id' => $q1->id, 'selected_key' => 'A'],
                    ['question_id' => $q2->id, 'selected_key' => 'B'],
                ],
            ]);

        $submitRes->assertStatus(200)
            ->assertJsonPath('data.score', 100)
            ->assertJsonPath('data.xp_earned', 200);

        // REGRESSION TEST: Verify the user's XP actually increased in the database
        // This assertion catches the Phase 4.4 bug where xp_earned was returned in response
        // but $user->increment('xp', $xpEarned) was never called
        $this->assertEquals(200, $student->fresh()->xp, 'User XP must actually increment in database after exam submission');
        $this->assertDatabaseHas('users', ['id' => $student->id, 'xp' => 200]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 7. Admin / Instructor Exam Management (CRUD)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_instructor_can_create_and_update_exam(): void
    {
        $instructor = $this->instructor();
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);

        // Create exam
        $res = $this->actingAs($instructor)->postJson('/api/v1/exams', [
            'course_id' => $course->id,
            'title' => 'Ujian Tengah Semester',
            'time_limit_sec' => 1800,
            'passing_score' => 80,
            'max_attempts' => 3,
            'pearls_reward' => 40,
        ]);

        $res->assertStatus(201)
            ->assertJsonPath('data.title', 'Ujian Tengah Semester');

        $examId = $res->json('data.id');

        // Update exam
        $upRes = $this->actingAs($instructor)->putJson("/api/v1/exams/{$examId}", [
            'title' => 'Ujian Akhir Semester Updated',
        ]);

        $upRes->assertStatus(200)
            ->assertJsonPath('data.title', 'Ujian Akhir Semester Updated');
    }

    public function test_student_must_be_enrolled_in_published_course_to_access_exam(): void
    {
        $student = $this->student();
        $exam = $this->createExam();

        $this->actingAs($student)->getJson("/api/v1/exams/{$exam->id}")->assertForbidden();
        $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts")->assertForbidden();

        $this->enroll($student, $exam);

        $this->actingAs($student)->getJson("/api/v1/exams/{$exam->id}")->assertOk();
        $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts")->assertCreated();
    }

    public function test_attempt_history_is_returned_as_a_data_array(): void
    {
        $student = $this->student();
        $exam = $this->createExam();
        $this->enroll($student, $exam);
        $attempt = ExamAttempt::factory()->create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'submitted_at' => now(),
        ]);

        $this->actingAs($student)->getJson("/api/v1/exams/{$exam->id}/attempts")
            ->assertOk()
            ->assertJsonPath('data.0.id', $attempt->id)
            ->assertJsonStructure(['data' => [['id', 'score', 'passed', 'started_at', 'submitted_at', 'expires_at']]]);
    }

    public function test_empty_exam_cannot_award_rewards(): void
    {
        $student = $this->student();
        $exam = $this->createExam(['pearls_reward' => 100]);
        $this->enroll($student, $exam);
        $attemptId = $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts")
            ->json('data.attempt_id');

        $this->actingAs($student)
            ->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId}/submit", [
                'answers' => [[
                    'question_id' => fake()->uuid(),
                    'selected_key' => 'A',
                ]],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('exam');

        $student->refresh();
        $this->assertSame(0, $student->xp);
        $this->assertSame(0, $student->pearls);
    }

    public function test_expired_attempt_cannot_be_submitted(): void
    {
        $student = $this->student();
        $exam = $this->createExam();
        $this->enroll($student, $exam);
        $question = ExamQuestion::factory()->create(['exam_id' => $exam->id]);
        $attempt = ExamAttempt::factory()->create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'expires_at' => now()->subSecond(),
            'submitted_at' => null,
        ]);

        $this->actingAs($student)->postJson("/api/v1/exams/{$exam->id}/attempts/{$attempt->id}/submit", [
            'answers' => [['question_id' => $question->id, 'selected_key' => 'A']],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('attempt');
    }

    public function test_student_cannot_submit_another_students_attempt(): void
    {
        $owner = $this->student();
        $other = $this->student();
        $exam = $this->createExam();
        $this->enroll($owner, $exam);
        $this->enroll($other, $exam);
        $question = ExamQuestion::factory()->create(['exam_id' => $exam->id]);
        $attempt = ExamAttempt::factory()->create([
            'user_id' => $owner->id,
            'exam_id' => $exam->id,
            'expires_at' => now()->addHour(),
            'submitted_at' => null,
        ]);

        $this->actingAs($other)->postJson("/api/v1/exams/{$exam->id}/attempts/{$attempt->id}/submit", [
            'answers' => [['question_id' => $question->id, 'selected_key' => 'A']],
        ])->assertForbidden();
    }

    public function test_instructor_cannot_move_exam_to_another_instructors_course(): void
    {
        $owner = $this->instructor();
        $other = $this->instructor();
        $sourceCourse = Course::factory()->create(['instructor_id' => $owner->id]);
        $targetCourse = Course::factory()->create(['instructor_id' => $other->id]);
        $exam = Exam::factory()->create(['course_id' => $sourceCourse->id]);

        $this->actingAs($owner)->putJson("/api/v1/exams/{$exam->id}", [
            'course_id' => $targetCourse->id,
        ])->assertForbidden();

        $this->assertSame($sourceCourse->id, $exam->fresh()->course_id);
    }
}
