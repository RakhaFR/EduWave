<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Requests\Exam\UpdateExamRequest;
use App\Models\Course;
use App\Models\Exam;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends ApiController
{
    /**
     * Show exam details and questions.
     * SECURITY: Question output uses formatQuestionWithoutAnswerKey to NEVER leak correct_answer or explanation.
     */
    public function show(Request $request, Exam $exam): JsonResponse
    {
        $exam->load('course:id,title');

        $questions = $exam->questions()->orderBy('order')->get()->map(function ($q) {
            return ExamService::formatQuestionWithoutAnswerKey($q);
        });

        return $this->success([
            'id' => $exam->id,
            'course_id' => $exam->course_id,
            'lesson_id' => $exam->lesson_id,
            'title' => $exam->title,
            'time_limit_sec' => $exam->time_limit_sec,
            'passing_score' => $exam->passing_score,
            'max_attempts' => $exam->max_attempts,
            'pearls_reward' => $exam->pearls_reward,
            'questions' => $questions,
        ]);
    }

    /**
     * Store a new exam (instructor or admin).
     */
    public function store(StoreExamRequest $request): JsonResponse
    {
        $this->authorize('create', Exam::class);

        $validated = $request->validated();
        $course = Course::findOrFail($validated['course_id']);

        // Instructor ownership check
        if ($request->user()->role === 'instructor' && $course->instructor_id !== $request->user()->id) {
            return $this->error('EXAM_FORBIDDEN', 'Anda tidak memiliki izin untuk menambah ujian ke kursus ini.', 403);
        }

        $exam = Exam::create($validated);

        return $this->success([
            'id' => $exam->id,
            'course_id' => $exam->course_id,
            'lesson_id' => $exam->lesson_id,
            'title' => $exam->title,
            'time_limit_sec' => $exam->time_limit_sec,
            'passing_score' => $exam->passing_score,
            'max_attempts' => $exam->max_attempts,
            'pearls_reward' => $exam->pearls_reward,
        ], '', 201);
    }

    /**
     * Update an exam (admin or course owner instructor).
     */
    public function update(UpdateExamRequest $request, Exam $exam): JsonResponse
    {
        $this->authorize('update', $exam);

        $exam->update($request->validated());

        return $this->success([
            'id' => $exam->id,
            'course_id' => $exam->course_id,
            'lesson_id' => $exam->lesson_id,
            'title' => $exam->title,
            'time_limit_sec' => $exam->time_limit_sec,
            'passing_score' => $exam->passing_score,
            'max_attempts' => $exam->max_attempts,
            'pearls_reward' => $exam->pearls_reward,
        ]);
    }

    /**
     * Delete an exam (admin or course owner instructor).
     */
    public function destroy(Exam $exam): JsonResponse
    {
        $this->authorize('destroy', $exam);

        $exam->delete();

        return $this->success([], '', 200);
    }
}
