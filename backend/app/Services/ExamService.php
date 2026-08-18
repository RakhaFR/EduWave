<?php

namespace App\Services;

use App\Events\XpAwarded;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ExamService
{
    /**
     * Start a new exam attempt or resume an active in-progress attempt.
     */
    public function start(User $user, Exam $exam): array
    {
        // Resume existing in_progress attempt if present
        $existingAttempt = ExamAttempt::where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->whereNull('submitted_at')
            ->first();

        if ($existingAttempt && $existingAttempt->expires_at->isFuture()) {
            return $this->formatStartPayload($existingAttempt, $exam);
        }

        if ($existingAttempt) {
            $existingAttempt->forceFill(['submitted_at' => $existingAttempt->expires_at])->save();
        }

        // Authorize new attempt creation via ExamAttemptPolicy (checks max_attempts)
        Gate::forUser($user)->authorize('create', [ExamAttempt::class, $exam]);

        $attempt = ExamAttempt::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'started_at' => now(),
            'expires_at' => now()->addSeconds($exam->time_limit_sec),
            'answers' => [],
            'score' => null,
            'passed' => false,
            'submitted_at' => null,
        ]);

        return $this->formatStartPayload($attempt, $exam);
    }

    /**
     * Submit and grade an exam attempt.
     */
    public function submit(User $user, ExamAttempt $attempt, array $answersInput): array
    {
        // Ensure attempt belongs to user
        if ($attempt->user_id !== $user->id) {
            throw new AuthorizationException('Anda tidak memiliki akses ke percobaan ini.');
        }

        $exam = $attempt->exam;

        // Idempotency: if already submitted, return cached result
        if (! is_null($attempt->submitted_at)) {
            return $this->formatSubmittedPayload($attempt, $exam);
        }

        if ($attempt->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'attempt' => ['Waktu pengerjaan ujian telah berakhir.'],
            ]);
        }

        $questions = $exam->questions()->orderBy('order')->get();

        if ($questions->isEmpty()) {
            throw ValidationException::withMessages([
                'exam' => ['Ujian belum memiliki pertanyaan.'],
            ]);
        }

        $submittedIds = collect($answersInput)->pluck('question_id');
        if ($submittedIds->duplicates()->isNotEmpty() || $submittedIds->diff($questions->pluck('id'))->isNotEmpty()) {
            throw ValidationException::withMessages([
                'answers' => ['Jawaban berisi pertanyaan yang tidak valid atau duplikat.'],
            ]);
        }

        $submittedMap = collect($answersInput)->keyBy('question_id');

        $totalPossiblePoints = (int) $questions->sum('points');
        $earnedPoints = 0;
        $correctCount = 0;
        $results = [];

        foreach ($questions as $q) {
            $userAnswer = $submittedMap->get($q->id)['selected_key'] ?? null;

            // Objective choice grading (multiple_choice, single_choice, true_false)
            $isCorrect = false;
            if (! is_null($userAnswer) && strtolower(trim((string) $userAnswer)) === strtolower(trim((string) $q->correct_answer))) {
                $isCorrect = true;
                $earnedPoints += $q->points;
                $correctCount++;
            }

            $results[] = [
                'question_id' => $q->id,
                'is_correct' => $isCorrect,
                'your_answer' => $userAnswer,
                'correct_answer' => $q->correct_answer,
                'explanation' => $q->explanation,
            ];
        }

        $score = round(($earnedPoints / $totalPossiblePoints) * 100, 2);

        $passed = $score >= $exam->passing_score;
        $pearlsEarned = 0;
        $xpEarned = (int) round($score * 2);

        // Award XP based on score (always, regardless of pass/fail)
        if ($xpEarned > 0) {
            $user->increment('xp', $xpEarned);
            XpAwarded::dispatch($user, $xpEarned, 'exam');
        }

        // Idempotently award pearls on pass (only if user hasn't passed this exam before)
        if ($passed && $exam->pearls_reward > 0) {
            $previouslyPassed = ExamAttempt::where('user_id', $user->id)
                ->where('exam_id', $exam->id)
                ->where('passed', true)
                ->where('id', '!=', $attempt->id)
                ->exists();

            if (! $previouslyPassed) {
                $user->increment('pearls', $exam->pearls_reward);
                $pearlsEarned = $exam->pearls_reward;
            }
        }

        $attempt->score = $score;
        $attempt->passed = $passed;
        $attempt->answers = $answersInput;
        $attempt->submitted_at = now();
        $attempt->save();

        $timeTakenSeconds = $attempt->started_at ? now()->diffInSeconds($attempt->started_at) : 0;

        return [
            'attempt_id' => $attempt->id,
            'score' => (float) $attempt->score,
            'passed' => (bool) $attempt->passed,
            'passing_score' => (int) $exam->passing_score,
            'pearls_earned' => $pearlsEarned,
            'xp_earned' => $xpEarned,
            'correct_count' => $correctCount,
            'total_count' => $questions->count(),
            'time_taken_seconds' => $timeTakenSeconds,
            'results' => $results,
        ];
    }

    /**
     * Format in-progress attempt / start response.
     * SECURITY: NEVER include correct_answer or explanation here!
     */
    public function formatStartPayload(ExamAttempt $attempt, Exam $exam): array
    {
        $questions = $exam->questions()->orderBy('order')->get()->map(function ($q) {
            return self::formatQuestionWithoutAnswerKey($q);
        });

        return [
            'attempt_id' => $attempt->id,
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'time_limit_sec' => $exam->time_limit_sec,
                'question_count' => $questions->count(),
                'passing_score' => $exam->passing_score,
            ],
            'questions' => $questions,
            'started_at' => $attempt->started_at,
            'expires_at' => $attempt->expires_at,
        ];
    }

    /**
     * Format submitted attempt payload for review.
     */
    public function formatSubmittedPayload(ExamAttempt $attempt, Exam $exam): array
    {
        $questions = $exam->questions()->orderBy('order')->get();
        $submittedMap = collect($attempt->answers ?? [])->keyBy('question_id');

        $correctCount = 0;
        $results = [];

        foreach ($questions as $q) {
            $userAnswer = $submittedMap->get($q->id)['selected_key'] ?? null;
            $isCorrect = (! is_null($userAnswer) && strtolower(trim((string) $userAnswer)) === strtolower(trim((string) $q->correct_answer)));

            if ($isCorrect) {
                $correctCount++;
            }

            $results[] = [
                'question_id' => $q->id,
                'is_correct' => $isCorrect,
                'your_answer' => $userAnswer,
                'correct_answer' => $q->correct_answer,
                'explanation' => $q->explanation,
            ];
        }

        $timeTakenSeconds = ($attempt->started_at && $attempt->submitted_at)
            ? $attempt->submitted_at->diffInSeconds($attempt->started_at)
            : 0;

        return [
            'attempt_id' => $attempt->id,
            'score' => (float) $attempt->score,
            'passed' => (bool) $attempt->passed,
            'passing_score' => (int) $exam->passing_score,
            'pearls_earned' => 0, // already awarded during submit
            'xp_earned' => (int) round(($attempt->score ?? 0) * 2),
            'correct_count' => $correctCount,
            'total_count' => $questions->count(),
            'time_taken_seconds' => $timeTakenSeconds,
            'results' => $results,
        ];
    }

    /**
     * Format question for student view during an in-progress exam.
     * SECURITY CRITICAL: Strict suppression of correct_answer and explanation.
     */
    public static function formatQuestionWithoutAnswerKey(ExamQuestion $q): array
    {
        return [
            'id' => $q->id,
            'question_text' => $q->question_text,
            'type' => $q->type,
            'options' => $q->options,
            'points' => $q->points,
            'order' => $q->order,
        ];
    }
}
