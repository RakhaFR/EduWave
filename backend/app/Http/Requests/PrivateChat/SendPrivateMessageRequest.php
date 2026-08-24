<?php

namespace App\Http\Requests\PrivateChat;

use App\Http\Requests\BaseRequest;

class SendPrivateMessageRequest extends BaseRequest
{
    public function rules(): array
    {
        return ['content' => ['required', 'string', 'max:5000']];
    }
}
