<?php

use App\Models\StudyRoom;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Study Room Private Channel Authorization
Broadcast::channel('study-room.{roomId}', function ($user, $roomId) {
    $room = StudyRoom::find($roomId);

    if (! $room) {
        return false;
    }

    // User must be a participant of the room
    return $room->participants()->where('user_id', $user->id)->exists();
});
