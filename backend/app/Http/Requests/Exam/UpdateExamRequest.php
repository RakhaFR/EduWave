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
            'time_limit_sec' => ['sometimes', 'integer', 'min:1'],
            'passing_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['sometimes', 'integer', 'min:1'],
            'pearls_reward' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
