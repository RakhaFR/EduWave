<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'full_name' => ['sometimes', 'string', 'max:100'],
            'username'  => ['sometimes', 'string', 'max:50', Rule::unique('users', 'username')->ignore($userId)],
            'email'     => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'role'      => ['sometimes', 'in:student,instructor,admin'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
