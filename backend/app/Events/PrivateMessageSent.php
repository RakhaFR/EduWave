<?php

namespace App\Events;

use App\Models\PrivateMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class PrivateMessageSent implements ShouldBroadcast
{
    public function __construct(
        public PrivateMessage $message
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-chat.'.$this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message_sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'content' => $this->message->content,
            'sent_at' => $this->message->sent_at?->toIso8601String(),
            'sender' => $this->message->sender ? [
                'id' => $this->message->sender->id,
                'username' => $this->message->sender->username,
                'full_name' => $this->message->sender->full_name,
                'avatar_url' => $this->message->sender->avatar_url,
            ] : null,
        ];
    }
}
