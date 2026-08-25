<?php

namespace App\Http\Requests\Exam;

use App\Http\Requests\BaseRequest;

class RecordViolationRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event' => ['required', 'string', 'in:blur,visibility_hidden,fullscreen_exit,tab_switch'],
            'answers' => ['sometimes', 'array'],
            'answers.*.question_id' => ['required_with:answers', 'uuid'],
            'answers.*.selected_key' => ['required_with:answers', 'string', 'max:10'],
        ];
    }
}
