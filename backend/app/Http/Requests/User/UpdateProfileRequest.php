<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Validator;

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
            'email' => ['sometimes', 'email:rfc', 'max:255', 'unique:users,email,' . ($this->user()?->id ?? 'NULL')],
            'bio' => ['sometimes', 'nullable', 'string'],
            'avatar_url' => ['sometimes', 'nullable', 'url'],
            'current_password' => ['sometimes', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $changingEmailOrUsername = $this->has('email') || $this->has('username');

            if ($changingEmailOrUsername) {
                if (!$this->has('current_password')) {
                    $validator->errors()->add(
                        'current_password',
                        'Kata sandi saat ini diperlukan untuk mengubah email atau username.'
                    );
                } elseif (!Hash::check($this->input('current_password'), $this->user()->password)) {
                    $validator->errors()->add(
                        'current_password',
                        'Kata sandi saat ini salah.'
                    );
                }
            }
        });
    }
}
