<?php

namespace App\Http\Requests\ExamQuestion;

use App\Http\Requests\BaseRequest;

class ImportPdfQuestionRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimetypes:application/pdf,application/x-pdf', 'max:5120'],
        ];
    }
}
