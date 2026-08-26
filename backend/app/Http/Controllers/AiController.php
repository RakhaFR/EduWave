<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ai\AiChatRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class AiController extends ApiController
{
    public function __construct(private readonly AiService $aiService) {}

    public function chat(AiChatRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $course = isset($data['course_context_id']) ? Course::find($data['course_context_id']) : null;
        $lesson = isset($data['lesson_context_id']) ? Lesson::find($data['lesson_context_id']) : null;

        if ($lesson && $course && $lesson->course_id !== $course->id) {
            return $this->error('AI_INVALID_CONTEXT', 'Lesson tidak termasuk dalam kursus yang dipilih.', 422);
        }

        $contextCourse = $course ?? $lesson?->course;
        if ($contextCourse && ! $this->canAccessCourse($user, $contextCourse)) {
            return $this->error('AI_CONTEXT_ACCESS_DENIED', 'Anda tidak memiliki akses ke konteks kursus tersebut.', 403);
        }

        try {
            $completion = $this->aiService->chat($data['message'], $contextCourse, $lesson);
        } catch (RuntimeException $exception) {
            return $this->error('AI_SERVICE_UNAVAILABLE', $exception->getMessage(), 503);
        }

        return $this->success([
            'message' => $completion['content'],
            'conversation_id' => $data['conversation_id'] ?? null,
            'model' => $completion['model'],
            'usage' => $completion['usage'],
        ]);
    }

    private function canAccessCourse(User $user, Course $course): bool
    {
        if (in_array($user->role, ['admin', 'instructor'], true)) {
            return true;
        }

        return $course->status === 'published'
            && Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['enrolled', 'completed'])
                ->exists();
    }
}
