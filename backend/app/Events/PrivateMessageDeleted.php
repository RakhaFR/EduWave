<?php

namespace App\Events;

use App\Models\PrivateConversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PrivateMessageDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public PrivateConversation $conversation,
        public string $messageId,
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('private-chat.'.$this->conversation->id);
    }

    public function broadcastAs(): string
    {
        return 'message_deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->messageId,
            'conversation_id' => $this->conversation->id,
        ];
    }
}
