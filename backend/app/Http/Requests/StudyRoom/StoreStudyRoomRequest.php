<?php

namespace App\Http\Requests\StudyRoom;

use App\Http\Requests\BaseRequest;

class StoreStudyRoomRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'topic' => ['nullable', 'string'],
            'max_capacity' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'is_public' => ['nullable', 'boolean'],
        ];
    }
}
