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
            'answers' => ['present', 'array'],
            'answers.*.question_id' => ['required', 'uuid'],
            'answers.*.selected_key' => ['required', 'string', 'max:10'],
        ];
    }
}
