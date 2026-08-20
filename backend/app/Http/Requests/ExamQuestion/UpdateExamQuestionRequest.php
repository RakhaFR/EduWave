<?php

namespace App\Http\Requests\ExamQuestion;

use App\Http\Requests\BaseRequest;

class UpdateExamQuestionRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_text' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string', 'in:multiple_choice,essay,true_false'],
            'options' => ['sometimes', 'nullable', 'array'],
            'correct_answer' => ['sometimes', 'string'],
            'explanation' => ['sometimes', 'nullable', 'string'],
            'points' => ['sometimes', 'integer', 'min:1'],
            'order' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
