<?php

namespace App\Events;

use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudyRoomUserJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public StudyRoom $room,
        public User $user
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('study-room.'.$this->room->id);
    }

    public function broadcastAs(): string
    {
        return 'user_joined';
    }

    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'avatar_url' => $this->user->avatar_url,
            ],
            'room_id' => $this->room->id,
        ];
    }
}
