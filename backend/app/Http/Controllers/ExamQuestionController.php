<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExamQuestion\StoreExamQuestionRequest;
use App\Http\Requests\ExamQuestion\UpdateExamQuestionRequest;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamQuestionController extends ApiController
{
    /**
     * List all questions for an exam.
     * Admin & Instructor see full question data including answer keys.
     */
    public function index(Request $request, Exam $exam): JsonResponse
    {
        $this->authorize('update', $exam);

        $questions = $exam->questions()->orderBy('order')->get();

        return $this->success($questions);
    }

    /**
     * Store a new question under an exam.
     */
    public function store(StoreExamQuestionRequest $request, Exam $exam): JsonResponse
    {
        $this->authorize('update', $exam);

        $validated = $request->validated();

        if (! isset($validated['order'])) {
            $maxOrder = $exam->questions()->max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        $question = $exam->questions()->create($validated);

        return $this->success($question, '', 201);
    }

    /**
     * Show a single question (including answer key for admin/instructor).
     */
    public function show(Request $request, Exam $exam, ExamQuestion $question): JsonResponse
    {
        $this->authorize('update', $exam);

        if ($question->exam_id !== $exam->id) {
            return $this->error('QUESTION_NOT_FOUND', 'Pertanyaan tidak ditemukan pada ujian ini.', 404);
        }

        return $this->success($question);
    }

    /**
     * Update a question.
     */
    public function update(UpdateExamQuestionRequest $request, Exam $exam, ExamQuestion $question): JsonResponse
    {
        $this->authorize('update', $exam);

        if ($question->exam_id !== $exam->id) {
            return $this->error('QUESTION_NOT_FOUND', 'Pertanyaan tidak ditemukan pada ujian ini.', 404);
        }

        $validated = $request->validated();
        $question->update($validated);

        return $this->success($question);
    }

    /**
     * Delete a question.
     */
    public function destroy(Request $request, Exam $exam, ExamQuestion $question): JsonResponse
    {
        $this->authorize('update', $exam);

        if ($question->exam_id !== $exam->id) {
            return $this->error('QUESTION_NOT_FOUND', 'Pertanyaan tidak ditemukan pada ujian ini.', 404);
        }

        $question->delete();

        return $this->success([], '', 200);
    }
}
