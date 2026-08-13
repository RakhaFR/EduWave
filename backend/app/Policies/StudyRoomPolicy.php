<?php

namespace App\Policies;

use App\Models\StudyRoom;
use App\Models\User;

class StudyRoomPolicy
{
    /**
     * Destroy a study room - host or admin only.
     * Traced to Permission Matrix: Study room routes are under authenticated middleware with no explicit role restriction,
     * but destroy is owner (host) only or admin.
     */
    public function destroy(User $user, StudyRoom $room): bool
    {
        return $user->role === 'admin' || $room->host_user_id === $user->id;
    }

    /**
     * Join a study room - room must be active AND not at capacity.
     */
    public function join(User $user, StudyRoom $room): bool
    {
        // Check room status
        if ($room->status !== 'active') {
            return false;
        }

        // Check capacity
        $participantCount = $room->participants()->count();

        return $participantCount < $room->max_capacity;
    }
}
