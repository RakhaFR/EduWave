<?php

namespace App\Events;

use App\Models\StudyRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudyRoomClosed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public StudyRoom $room
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('study-room.'.$this->room->id);
    }

    public function broadcastAs(): string
    {
        return 'room_closed';
    }

    public function broadcastWith(): array
    {
        return [
            'room_id' => $this->room->id,
            'message' => 'Ruang belajar telah ditutup.',
        ];
    }
}
