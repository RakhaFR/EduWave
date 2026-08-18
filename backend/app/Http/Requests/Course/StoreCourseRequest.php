<?php

namespace App\Http\Requests\Course;

use App\Http\Requests\BaseRequest;

class StoreCourseRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'instructor_id' => ['nullable', 'uuid'],
            'category' => ['nullable', 'in:technology,design,marine,language,science,business'],
            'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
            'thumbnail_url' => ['nullable', 'url'],
            'trailer_url' => ['nullable', 'url'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'pearls_reward' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'duration_minutes' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ];
    }
}
