<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exam\RecordViolationRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;

class ViolationController extends ApiController
{
    public function store(RecordViolationRequest $request, Exam $exam, ExamAttempt $attempt, ExamService $examService): JsonResponse
    {
        if ($attempt->exam_id !== $exam->id) {
            return $this->error('INVALID_ATTEMPT', 'Percobaan ini tidak milik ujian ini.', 400);
        }

        $this->authorize('view', $attempt);
        $validated = $request->validated();
        $data = $examService->recordViolation(
            $attempt,
            $validated['event'],
            $validated['answers'] ?? []
        );

        return $this->success($data, '', $data['auto_submitted'] ? 200 : 201);
    }
}
