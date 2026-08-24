<?php

namespace App\Events;

use App\Models\RoomMessage;
use App\Models\StudyRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudyRoomMessageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public StudyRoom $room,
        public RoomMessage $message,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('study-room.'.$this->room->id);
    }

    public function broadcastAs(): string
    {
        return 'message_updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'type' => $this->message->type,
            'user' => $this->message->user ? [
                'id' => $this->message->user->id,
                'username' => $this->message->user->username,
                'avatar_url' => $this->message->user->avatar_url,
            ] : null,
            'sent_at' => $this->message->sent_at,
        ];
    }
}
