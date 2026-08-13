<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class UpdateProfileRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'string', 'max:100'],
            'username' => ['sometimes', 'string', 'max:50', 'unique:users,username,' . ($this->user()?->id ?? 'NULL')],
            'email' => ['sometimes', 'email:rfc,dns', 'max:255', 'unique:users,email,' . ($this->user()?->id ?? 'NULL')],
            'bio' => ['sometimes', 'nullable', 'string'],
            'avatar_url' => ['sometimes', 'nullable', 'url'],
        ];
    }
}
