<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;

class UpdateUserRoleRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'in:student,instructor,admin'],
        ];
    }
}
