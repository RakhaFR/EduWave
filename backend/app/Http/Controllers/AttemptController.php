<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exam\SubmitAttemptRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttemptController extends ApiController
{
    protected ExamService $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    /**
     * Start a new attempt or resume an active in-progress attempt for an exam.
     */
    public function start(Request $request, Exam $exam): JsonResponse
    {
        $data = $this->examService->start($request->user(), $exam);

        return $this->success($data, '', 201);
    }

    /**
     * Submit an attempt for grading.
     */
    public function submit(SubmitAttemptRequest $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        if ($attempt->exam_id !== $exam->id) {
            return $this->error('INVALID_ATTEMPT', 'Percobaan ini tidak milik ujian ini.', 400);
        }

        $data = $this->examService->submit($request->user(), $attempt, $request->validated()['answers']);

        return $this->success($data);
    }

    /**
     * Get attempt history for the authenticated user for an exam.
     */
    public function index(Request $request, Exam $exam): JsonResponse
    {
        $user = $request->user();

        $attempts = ExamAttempt::where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->orderByDesc('started_at')
            ->get()
            ->map(fn ($attempt) => [
                'id'           => $attempt->id,
                'score'        => $attempt->score !== null ? (float) $attempt->score : null,
                'passed'       => (bool) $attempt->passed,
                'started_at'   => $attempt->started_at,
                'submitted_at' => $attempt->submitted_at,
                'expires_at'   => $attempt->expires_at,
            ]);

        return $this->success(['attempts' => $attempts]);
    }

    /**
     * View a specific attempt payload.
     * SECURITY: In-progress attempts use formatStartPayload which strictly suppresses correct_answer and explanation.
     */
    public function show(Request $request, Exam $exam, ExamAttempt $attempt): JsonResponse
    {
        if ($attempt->exam_id !== $exam->id) {
            return $this->error('INVALID_ATTEMPT', 'Percobaan ini tidak milik ujian ini.', 400);
        }

        $this->authorize('view', $attempt);

        if (is_null($attempt->submitted_at)) {
            $data = $this->examService->formatStartPayload($attempt, $exam);
        } else {
            $data = $this->examService->formatSubmittedPayload($attempt, $exam);
        }

        return $this->success($data);
    }
}
