<?php

namespace App\Http\Requests\Lesson;

use App\Http\Requests\BaseRequest;

class UpdateLessonRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['sometimes', 'uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'nullable', 'in:video,text,quiz'],
            'content' => ['sometimes', 'nullable', 'string'],
            'video_url' => ['sometimes', 'nullable', 'url'],
            'duration_minutes' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'order' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'xp_reward' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'is_preview' => ['sometimes', 'boolean'],
        ];
    }
}
