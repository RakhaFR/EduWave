<?php

namespace App\Http\Requests\ExamQuestion;

use App\Http\Requests\BaseRequest;

class StoreExamQuestionRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_text' => ['required', 'string'],
            'type' => ['nullable', 'string', 'in:multiple_choice,essay,true_false'],
            'options' => ['nullable', 'array'],
            'correct_answer' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
            'points' => ['nullable', 'integer', 'min:1'],
            'order' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
