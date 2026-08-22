<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function messages(): array
    {
        return [
            'required' => 'Validasi gagal.',
            'required_without' => 'Validasi gagal.',
            'required_without_all' => 'Validasi gagal.',
            'string' => 'Validasi gagal.',
            'email' => 'Validasi gagal.',
            'uuid' => 'Validasi gagal.',
            'nullable' => 'Validasi gagal.',
            'numeric' => 'Validasi gagal.',
            'integer' => 'Validasi gagal.',
            'array' => 'Validasi gagal.',
            'file' => 'Validasi gagal.',
            'mimes' => 'Validasi gagal.',
            'mimetypes' => 'Validasi gagal.',
            'boolean' => 'Validasi gagal.',
            'in' => 'Validasi gagal.',
            'min' => 'Validasi gagal.',
            'max' => 'Validasi gagal.',
            'confirmed' => 'Validasi gagal.',
            'unique' => 'Validasi gagal.',
            'exists' => 'Validasi gagal.',
            'url' => 'Validasi gagal.',
            'sometimes' => 'Validasi gagal.',
        ];
    }
}
