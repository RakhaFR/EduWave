<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

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

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'data' => null,
                'error' => [
                    'code' => 'INVALID_ROLE',
                    'message' => 'Role yang dipilih tidak valid.',
                    'details' => [
                        'allowed_roles' => ['student', 'instructor', 'admin'],
                    ],
                ],
                'meta' => null,
            ], 422)
        );
    }
}
