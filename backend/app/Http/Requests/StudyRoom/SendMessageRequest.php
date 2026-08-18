<?php

namespace App\Http\Requests\StudyRoom;

use App\Http\Requests\BaseRequest;

class SendMessageRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:2000'],
            'type' => ['sometimes', 'in:text,file,ai'],
        ];
    }
}
