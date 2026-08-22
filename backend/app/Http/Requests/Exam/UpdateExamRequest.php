<?php

namespace App\Http\Requests\Exam;

use App\Http\Requests\BaseRequest;

class UpdateExamRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['sometimes', 'uuid'],
            'lesson_id' => ['sometimes', 'nullable', 'uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'time_limit_sec' => ['sometimes', 'integer', 'min:1', 'max:86400'],
            'passing_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'pearls_reward' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'questions' => ['sometimes', 'array'],
            'questions.*.id' => ['nullable', 'uuid'],
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
