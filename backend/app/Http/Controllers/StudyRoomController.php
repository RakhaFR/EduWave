<?php

namespace App\Http\Controllers;

use App\Events\StudyRoomClosed;
use App\Events\StudyRoomUserJoined;
use App\Events\StudyRoomUserLeft;
use App\Http\Requests\StudyRoom\StoreStudyRoomRequest;
use App\Models\StudyRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

class StudyRoomController extends ApiController
{
    /**
     * List all active study rooms.
     * GET /api/v1/study-rooms
     */
    public function index(Request $request): JsonResponse
    {
        $query = StudyRoom::with(['host:id,username,avatar_url'])
            ->withCount('participants');

        // Filter by status (default: active only)
        $status = $request->query('status', 'active');
        if (in_array($status, ['active', 'closed'])) {
            $query->where('status', $status);
        }

        // Filter by is_public
        if ($request->has('is_public')) {
            $query->where('is_public', (bool) $request->query('is_public'));
        }

        $rooms = $query->orderBy('created_at', 'desc')->get();

        return $this->success([
            'rooms' => $rooms->map(fn ($room) => [
                'id' => $room->id,
                'name' => $room->name,
                'topic' => $room->topic,
                'host' => $room->host ? [
                    'id' => $room->host->id,
                    'username' => $room->host->username,
                    'avatar_url' => $room->host->avatar_url,
                ] : null,
                'max_capacity' => $room->max_capacity,
                'current_capacity' => $room->participants_count,
                'is_public' => $room->is_public,
                'status' => $room->status,
                'created_at' => $room->created_at,
            ]),
        ]);
    }

    /**
     * Create a new study room.
     * POST /api/v1/study-rooms
     */
    public function store(StoreStudyRoomRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $room = StudyRoom::create([
            'name' => $validated['name'],
            'topic' => $validated['topic'] ?? null,
            'host_user_id' => $user->id,
            'max_capacity' => $validated['max_capacity'] ?? 20,
            'is_public' => $validated['is_public'] ?? true,
            'status' => 'active',
        ]);

        // Auto-join the host as the first participant
        $room->participants()->attach($user->id);

        $room->load('host:id,username,avatar_url');

        return $this->success([
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'topic' => $room->topic,
                'host' => [
                    'id' => $room->host->id,
                    'username' => $room->host->username,
                    'avatar_url' => $room->host->avatar_url,
                ],
                'max_capacity' => $room->max_capacity,
                'current_capacity' => 1,
                'is_public' => $room->is_public,
                'status' => $room->status,
                'created_at' => $room->created_at,
            ],
        ], 'Study room berhasil dibuat.', 201);
    }

    /**
     * Show a specific study room.
     * GET /api/v1/study-rooms/{room}
     */
    public function show(StudyRoom $room): JsonResponse
    {
        $room->load(['host:id,username,full_name,avatar_url', 'participants:id,username,avatar_url']);

        return $this->success([
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'topic' => $room->topic,
                'host' => $room->host ? [
                    'id' => $room->host->id,
                    'username' => $room->host->username,
                    'full_name' => $room->host->full_name,
                    'avatar_url' => $room->host->avatar_url,
                ] : null,
                'max_capacity' => $room->max_capacity,
                'current_capacity' => $room->participants->count(),
                'is_public' => $room->is_public,
                'status' => $room->status,
                'participants' => $room->participants->map(fn ($user) => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'avatar_url' => $user->avatar_url,
                ]),
                'created_at' => $room->created_at,
                'updated_at' => $room->updated_at,
            ],
        ]);
    }

    /**
     * Join a study room.
     * POST /api/v1/study-rooms/{room}/join
     */
    public function join(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();

        // Check if already a participant
        if ($room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('ALREADY_JOINED', 'Anda sudah bergabung di ruang belajar ini.', 409);
        }

        // Authorization check via policy (status + capacity)
        if (! $user->can('join', $room)) {
            if ($room->status !== 'active') {
                return $this->error('ROOM_CLOSED', 'Ruang belajar ini sudah ditutup.', 403);
            }

            return $this->error('ROOM_FULL', 'Ruang belajar sudah penuh.', 403);
        }

        $room->participants()->attach($user->id);

        // Broadcast user joined event
        broadcast(new StudyRoomUserJoined($room, $user))->toOthers();

        return $this->success([
            'room_id' => $room->id,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'avatar_url' => $user->avatar_url,
            ],
        ], 'Berhasil bergabung ke ruang belajar.');
    }

    /**
     * Leave a study room.
     * DELETE /api/v1/study-rooms/{room}/leave
     */
    public function leave(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();

        // Check if user is a participant
        if (! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('NOT_A_PARTICIPANT', 'Anda bukan peserta ruang belajar ini.', 404);
        }

        $room->participants()->detach($user->id);

        // Broadcast user left event
        broadcast(new StudyRoomUserLeft($room, $user))->toOthers();

        // If host leaves, close the room
        if ($room->host_user_id === $user->id) {
            $room->update(['status' => 'closed']);
            broadcast(new StudyRoomClosed($room));
        }

        return $this->success(null, 'Berhasil keluar dari ruang belajar.');
    }

    /**
     * Delete/close a study room.
     * DELETE /api/v1/study-rooms/{room}
     */
    public function destroy(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();

        // Authorization check via policy (host or admin)
        if (! $user->can('destroy', $room)) {
            return $this->error('FORBIDDEN', 'Anda tidak memiliki izin untuk menutup ruang belajar ini.', 403);
        }

        // Mark as closed instead of hard delete (preserve message history)
        $room->update(['status' => 'closed']);

        // Broadcast room closed event
        broadcast(new StudyRoomClosed($room));

        return $this->success(null, 'Ruang belajar berhasil ditutup.');
    }
}
