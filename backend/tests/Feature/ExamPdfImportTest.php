<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Exam;
use App\Models\User;
use App\Services\PdfQuestionParser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ExamPdfImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_pdf_parser_service_parses_text_correctly(): void
    {
        $text = '1. Apa zona laut terdalam?
A. Pelagis
B. Hadapelagis
C. Mesopelagis
D. Batial
Kunci: B
Pembahasan: Zona Hadapelagis adalah zona palung laut terdalam.
Poin: 15

2. Berapa persentase air pasang?
A. 10%
B. 50%
C. 70%
D. 90%
Kunci: C
Pembahasan: Sebagian besar permukaan bumi terisi air laut.
Poin: 10';

        $parser = new PdfQuestionParser;
        $parsed = $parser->parseText($text);

        $this->assertCount(2, $parsed);

        $this->assertEquals('Apa zona laut terdalam?', $parsed[0]['question_text']);
        $this->assertEquals('multiple_choice', $parsed[0]['type']);
        $this->assertEquals('B', $parsed[0]['correct_answer']);
        $this->assertEquals('Zona Hadapelagis adalah zona palung laut terdalam.', $parsed[0]['explanation']);
        $this->assertEquals(15, $parsed[0]['points']);
        $this->assertCount(4, $parsed[0]['options']);

        $this->assertEquals('Berapa persentase air pasang?', $parsed[1]['question_text']);
        $this->assertEquals('C', $parsed[1]['correct_answer']);
        $this->assertEquals(10, $parsed[1]['points']);
    }

    public function test_instructor_can_import_questions_from_pdf(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $exam = Exam::factory()->create(['course_id' => $course->id]);

        $text = '1. Apa nama samudra terbesar?
A. Samudra Pasifik
B. Samudra Atlantik
C. Samudra Hindia
D. Samudra Arktik
Kunci: A
Pembahasan: Samudra Pasifik adalah yang terluas.';

        $mockParser = $this->mock(PdfQuestionParser::class);
        $mockParser->shouldReceive('parsePdf')
            ->once()
            ->andReturn((new PdfQuestionParser)->parseText($text));

        $file = UploadedFile::fake()->create('soal.pdf', 100, 'application/pdf');

        $response = $this->actingAs($instructor, 'sanctum')->postJson("/api/v1/exams/{$exam->id}/questions/import-pdf", [
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.imported_count', 1);

        $this->assertDatabaseHas('exam_questions', [
            'exam_id' => $exam->id,
            'question_text' => 'Apa nama samudra terbesar?',
            'correct_answer' => 'A',
            'explanation' => 'Samudra Pasifik adalah yang terluas.',
        ]);
    }

    public function test_sample_pdf_is_imported_end_to_end(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $exam = Exam::factory()->create(['course_id' => $course->id]);
        $file = UploadedFile::fake()->createWithContent(
            'sample_exam_questions.pdf',
            file_get_contents(base_path('sample_exam_questions.pdf')),
        );

        $response = $this->actingAs($instructor, 'sanctum')->postJson("/api/v1/exams/{$exam->id}/questions/import-pdf", [
            'file' => $file,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.imported_count', 2)
            ->assertJsonPath('data.questions.0.correct_answer', 'C')
            ->assertJsonPath('data.questions.1.order', 2);

        $this->assertDatabaseCount('exam_questions', 2);
    }

    public function test_student_cannot_import_questions_from_pdf(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $exam = Exam::factory()->create();
        $file = UploadedFile::fake()->create('soal.pdf', 100, 'application/pdf');

        $response = $this->actingAs($student, 'sanctum')->postJson("/api/v1/exams/{$exam->id}/questions/import-pdf", [
            'file' => $file,
        ]);

        $response->assertStatus(403);
    }

    public function test_import_is_rejected_without_creating_questions_when_a_pdf_question_is_invalid(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['instructor_id' => $instructor->id]);
        $exam = Exam::factory()->create(['course_id' => $course->id]);

        $mockParser = $this->mock(PdfQuestionParser::class);
        $mockParser->shouldReceive('parsePdf')->once()->andThrow(new \RuntimeException('Invalid PDF question'));

        $file = UploadedFile::fake()->create('soal.pdf', 100, 'application/pdf');
        $response = $this->actingAs($instructor, 'sanctum')->postJson("/api/v1/exams/{$exam->id}/questions/import-pdf", [
            'file' => $file,
        ]);

        $response->assertStatus(422)->assertJsonPath('error.code', 'PDF_IMPORT_FAILED');
        $this->assertDatabaseCount('exam_questions', 0);
    }
}
