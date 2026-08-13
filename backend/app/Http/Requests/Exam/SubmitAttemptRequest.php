<?php

namespace App\Http\Requests\Exam;

use App\Http\Requests\BaseRequest;

class SubmitAttemptRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answers' => ['required', 'array'],
            'answers.*.question_id' => ['required', 'uuid'],
            'answers.*.selected_key' => ['required', 'string', 'max:10'],
        ];
    }
}
