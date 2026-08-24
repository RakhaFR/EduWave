<?php

namespace App\Events;

use App\Models\StudyRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudyRoomMessageDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public StudyRoom $room,
        public string $messageId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('study-room.'.$this->room->id);
    }

    public function broadcastAs(): string
    {
        return 'message_deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->messageId,
            'room_id' => $this->room->id,
        ];
    }
}
