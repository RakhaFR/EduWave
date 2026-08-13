<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class LoginRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['sometimes', 'required_without:username', 'email:rfc,dns', 'max:255'],
            'username' => ['sometimes', 'required_without:email', 'string', 'max:50'],
            'password' => ['required', 'string'],
        ];
    }
}
