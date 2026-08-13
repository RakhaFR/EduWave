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
     *
     * ⚠️  FLAG: The schema does not yet include a participants pivot table or relationship.
     * The join policy requires counting current participants against max_capacity.
     * This logic is correct but will fail at runtime until a study_room_participants
     * table is created (linking users to study_rooms with a many-to-many relationship).
     * Example migration:
     *   Schema::create('study_room_participants', function (Blueprint $table) {
     *       $table->uuid('user_id');
     *       $table->uuid('room_id');
     *       $table->primary(['user_id', 'room_id']);
     *       $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
     *       $table->foreign('room_id')->references('id')->on('study_rooms')->cascadeOnDelete();
     *   });
     */
    public function join(User $user, StudyRoom $room): bool
    {
        // Check room status
        if ($room->status !== 'active') {
            return false;
        }

        // Check capacity — this requires a participants relationship
        // Once study_room_participants table exists: $participantCount = $room->participants()->count();
        // For now, this will throw an error if the relationship is accessed
        $participantCount = $room->participants()->count();

        return $participantCount < $room->max_capacity;
    }
}
