<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ai\AiChatRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
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
        if (! $contextCourse) {
            return $this->error('AI_CONTEXT_REQUIRED', 'Pilih kursus atau lesson sebelum bertanya kepada AI.', 422);
        }

        if ($contextCourse && ! $this->canAccessCourse($user, $contextCourse)) {
            return $this->error('AI_CONTEXT_ACCESS_DENIED', 'Anda tidak memiliki akses ke konteks kursus tersebut.', 403);
        }

        if (! $this->isQuestionRelatedToContext($data['message'], $contextCourse, $lesson)) {
            return $this->error('AI_TOPIC_OUT_OF_SCOPE', 'Pertanyaan harus berkaitan dengan materi kursus atau lesson yang dipilih.', 422);
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

    private function isQuestionRelatedToContext(string $message, Course $course, ?Lesson $lesson): bool
    {
        $context = implode(' ', array_filter([
            $course->title,
            $course->description,
            $course->category,
            $lesson?->title,
            $lesson?->content,
        ]));

        $stopWords = [
            'apa', 'apakah', 'bagaimana', 'bisa', 'dapat', 'dengan', 'dan', 'dari', 'di',
            'ini', 'itu', 'jelaskan', 'jelaskanlah', 'ke', 'mengapa', 'saya', 'sebuah',
            'tentang', 'terkait', 'tolong', 'untuk', 'yang', 'the', 'what', 'how', 'is',
            'are', 'can', 'explain', 'please', 'about', 'this', 'that', 'to', 'of',
        ];

        $tokenize = static function (string $value) use ($stopWords): array {
            return collect(preg_split('/[^\p{L}\p{N}]+/u', Str::lower($value), -1, PREG_SPLIT_NO_EMPTY))
                ->filter(fn (string $word): bool => mb_strlen($word) >= 3 && ! in_array($word, $stopWords, true))
                ->values()
                ->all();
        };

        $questionWords = $tokenize($message);

        // Generic requests can still be answered from the selected lesson context.
        if ($questionWords === []) {
            return true;
        }

        return count(array_intersect($questionWords, $tokenize($context))) > 0;
    }
}
