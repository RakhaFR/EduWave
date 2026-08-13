<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class UpdateMascotRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mascot_id' => ['required', 'uuid'],
            'accessories' => ['nullable', 'array'],
            'accessories.hat' => ['nullable', 'string'],
            'accessories.glasses' => ['nullable', 'string'],
            'accessories.outfit' => ['nullable', 'string'],
            'accessories.background' => ['nullable', 'string'],
        ];
    }
}
