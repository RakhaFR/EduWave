<?php

namespace App\Http\Requests\Exam;

use App\Http\Requests\BaseRequest;

class StoreExamRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'uuid'],
            'lesson_id' => ['nullable', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'mode' => ['nullable', 'string', 'in:locked,quiz'],
            'requires_fullscreen' => ['nullable', 'boolean'],
            'time_limit_sec' => ['nullable', 'integer', 'min:1', 'max:86400'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:100'],
            'pearls_reward' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'questions' => ['nullable', 'array'],
            'questions.*.question_text' => ['required_with:questions', 'string'],
            'questions.*.type' => ['nullable', 'string', 'in:multiple_choice'],
            'questions.*.options' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.correct_answer' => ['required_with:questions', 'string'],
            'questions.*.explanation' => ['nullable', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.order' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
