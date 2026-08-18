<?php

namespace App\Http\Requests\Course;

use App\Http\Requests\BaseRequest;

class UpdateCourseRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'instructor_id' => ['sometimes', 'nullable', 'uuid'],
            'category' => ['sometimes', 'nullable', 'in:technology,design,marine,language,science,business'],
            'difficulty' => ['sometimes', 'nullable', 'in:beginner,intermediate,advanced'],
            'thumbnail_url' => ['sometimes', 'nullable', 'url'],
            'trailer_url' => ['sometimes', 'nullable', 'url'],
            'status' => ['sometimes', 'nullable', 'in:draft,published,archived'],
            'pearls_reward' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'duration_minutes' => ['sometimes', 'integer', 'min:0', 'max:100000'],
        ];
    }
}
