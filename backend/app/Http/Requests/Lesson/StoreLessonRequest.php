<?php

namespace App\Http\Requests\Lesson;

use App\Http\Requests\BaseRequest;

class StoreLessonRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'in:video,text,quiz'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'order' => ['required', 'integer', 'min:1'],
            'xp_reward' => ['nullable', 'integer', 'min:0'],
            'is_preview' => ['nullable', 'boolean'],
        ];
    }
}
