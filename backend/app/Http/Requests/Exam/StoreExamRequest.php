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
            'time_limit_sec' => ['nullable', 'integer', 'min:1', 'max:86400'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:100'],
            'pearls_reward' => ['nullable', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
