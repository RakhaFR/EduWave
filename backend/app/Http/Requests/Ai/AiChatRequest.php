<?php

namespace App\Http\Requests\Ai;

use App\Http\Requests\BaseRequest;

class AiChatRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:4000'],
            'course_context_id' => ['nullable', 'uuid', 'exists:courses,id'],
            'lesson_context_id' => ['nullable', 'uuid', 'exists:lessons,id'],
            'conversation_id' => ['nullable', 'uuid'],
        ];
    }
}
