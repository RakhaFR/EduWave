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
            'message' => ['required', 'string'],
            'course_context_id' => ['nullable', 'uuid'],
            'lesson_context_id' => ['nullable', 'uuid'],
            'conversation_id' => ['nullable', 'uuid'],
        ];
    }
}
