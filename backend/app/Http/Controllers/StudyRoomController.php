<?php

namespace App\Http\Controllers;

use App\Events\StudyRoomClosed;
use App\Events\StudyRoomUserJoined;
use App\Events\StudyRoomUserKicked;
use App\Events\StudyRoomUserLeft;
use App\Http\Requests\StudyRoom\StoreStudyRoomRequest;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudyRoomController extends ApiController
{
    /**
     * List all active study rooms.
     * GET /api/v1/study-rooms
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = StudyRoom::with(['host:id,username,avatar_url'])
            ->withCount('participants');

        // Filter by status (default: active only)
        $status = $request->query('status', 'active');
        if (in_array($status, ['active', 'closed'])) {
            $query->where('status', $status);
        }

        // Filter by is_public
        if ($request->has('is_public')) {
            $isPublic = filter_var($request->query('is_public'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_public', $isPublic);
            if (! $isPublic) {
                $query->where(function ($query) use ($user) {
                    $query->where('host_user_id', $user->id)
                        ->orWhereHas('participants', fn ($participants) => $participants->where('users.id', $user->id));
                });
            }
        } else {
            $query->where(function ($query) use ($user) {
                $query->where('is_public', true)
                    ->orWhere('host_user_id', $user->id)
                    ->orWhereHas('participants', fn ($participants) => $participants->where('users.id', $user->id));
            });
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
                'join_code' => $room->host_user_id === $user->id ? $room->join_code : null,
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
            'join_code' => ($validated['is_public'] ?? true) ? null : $this->generateJoinCode(),
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
                'join_code' => $room->host_user_id === $user->id ? $room->join_code : null,
                'status' => $room->status,
                'created_at' => $room->created_at,
            ],
        ], 'Study room berhasil dibuat.', 201);
    }

    /**
     * Show a specific study room.
     * GET /api/v1/study-rooms/{room}
     */
    public function show(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();
        if (! $room->is_public && $room->host_user_id !== $user->id && ! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('PRIVATE_ROOM_ACCESS_REQUIRED', 'Anda harus menjadi peserta atau mendapatkan undangan untuk melihat ruang privat ini.', 403);
        }

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
                'join_code' => $room->host_user_id === $user->id ? $room->join_code : null,
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

        if (! $room->is_public && ! hash_equals((string) $room->join_code, (string) $request->input('code'))) {
            return $this->error('INVALID_JOIN_CODE', 'Kode join ruang privat tidak valid.', 403);
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
     * Invite a user to a study room. Host only.
     * POST /api/v1/study-rooms/{room}/invite
     */
    public function invite(Request $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();
        if ($room->host_user_id !== $user->id) {
            return $this->error('FORBIDDEN', 'Hanya host yang dapat mengundang peserta.', 403);
        }

        if ($room->status !== 'active') {
            return $this->error('ROOM_CLOSED', 'Ruang belajar ini sudah ditutup.', 403);
        }

        $validated = $request->validate(['user_id' => ['required', 'uuid', 'exists:users,id']]);
        $invitee = User::findOrFail($validated['user_id']);

        if ($room->participants()->where('user_id', $invitee->id)->exists()) {
            return $this->error('ALREADY_JOINED', 'User sudah bergabung di ruang belajar ini.', 409);
        }

        if ($room->participants()->count() >= $room->max_capacity) {
            return $this->error('ROOM_FULL', 'Ruang belajar sudah penuh.', 403);
        }

        $room->participants()->attach($invitee->id);
        broadcast(new StudyRoomUserJoined($room, $invitee))->toOthers();

        return $this->success([
            'room_id' => $room->id,
            'user' => [
                'id' => $invitee->id,
                'username' => $invitee->username,
                'avatar_url' => $invitee->avatar_url,
            ],
        ], 'User berhasil diundang ke ruang belajar.');
    }

    /**
     * Kick a participant from a study room. Host only.
     * DELETE /api/v1/study-rooms/{room}/participants/{user}
     */
    public function kick(Request $request, StudyRoom $room, User $user): JsonResponse
    {
        $host = $request->user();
        if ($room->host_user_id !== $host->id) {
            return $this->error('FORBIDDEN', 'Hanya host yang dapat mengeluarkan peserta.', 403);
        }

        if ($user->id === $room->host_user_id) {
            return $this->error('CANNOT_KICK_HOST', 'Host tidak dapat mengeluarkan dirinya sendiri.', 422);
        }

        if (! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('NOT_A_PARTICIPANT', 'User bukan peserta ruang belajar ini.', 404);
        }

        $room->participants()->detach($user->id);
        broadcast(new StudyRoomUserKicked($room, $user))->toOthers();

        return $this->success([
            'room_id' => $room->id,
            'user_id' => $user->id,
        ], 'Peserta berhasil dikeluarkan dari ruang belajar.');
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

    private function generateJoinCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (StudyRoom::where('join_code', $code)->exists());

        return $code;
    }
}
