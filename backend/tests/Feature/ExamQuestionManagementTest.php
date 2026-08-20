<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamQuestionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_can_create_exam_with_nested_questions(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);

        $response = $this->actingAs($instructor, 'sanctum')->postJson('/api/v1/exams', [
            'course_id' => $course->id,
            'title' => 'Nested Questions Exam',
            'questions' => [
                [
                    'question_text' => 'Apa itu Laravel?',
                    'correct_answer' => 'Framework PHP',
                    'options' => ['Framework PHP', 'Library JS'],
                ],
            ],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('exam_questions', [
            'question_text' => 'Apa itu Laravel?',
            'correct_answer' => 'Framework PHP',
        ]);
    }

    public function test_instructor_can_crud_individual_question_via_nested_routes(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $exam = Exam::factory()->create(['course_id' => $course->id]);

        // 1. Create question
        $createRes = $this->actingAs($instructor, 'sanctum')->postJson("/api/v1/exams/{$exam->id}/questions", [
            'question_text' => 'Pertanyaan 1',
            'correct_answer' => 'Jawaban 1',
            'options' => ['Jawaban 1', 'Jawaban 2'],
        ]);
        $createRes->assertStatus(201);
        $questionId = $createRes->json('data.id');

        // 2. List questions
        $listRes = $this->actingAs($instructor, 'sanctum')->getJson("/api/v1/exams/{$exam->id}/questions");
        $listRes->assertStatus(200)->assertJsonCount(1, 'data');

        // 3. Show question
        $showRes = $this->actingAs($instructor, 'sanctum')->getJson("/api/v1/exams/{$exam->id}/questions/{$questionId}");
        $showRes->assertStatus(200)->assertJsonPath('data.correct_answer', 'Jawaban 1');

        // 4. Update question
        $updateRes = $this->actingAs($instructor, 'sanctum')->putJson("/api/v1/exams/{$exam->id}/questions/{$questionId}", [
            'question_text' => 'Pertanyaan Terupdate',
        ]);
        $updateRes->assertStatus(200)->assertJsonPath('data.question_text', 'Pertanyaan Terupdate');

        // 5. Delete question
        $deleteRes = $this->actingAs($instructor, 'sanctum')->deleteJson("/api/v1/exams/{$exam->id}/questions/{$questionId}");
        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('exam_questions', ['id' => $questionId]);
    }
}
