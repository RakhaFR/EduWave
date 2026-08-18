<?php

namespace App\Http\Controllers;

use App\Events\StudyRoomMessageSent;
use App\Http\Requests\StudyRoom\SendMessageRequest;
use App\Models\RoomMessage;
use App\Models\StudyRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomMessageController extends ApiController
{
    /**
     * Get message history for a study room.
     * GET /api/v1/study-rooms/{room}/messages
     */
    public function index(Request $request, StudyRoom $room): JsonResponse
    {
        // Check if user is a participant
        $user = $request->user();
        if (! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('NOT_A_PARTICIPANT', 'Anda bukan peserta ruang belajar ini.', 403);
        }

        $limit = min(100, max(10, (int) $request->query('limit', 50)));
        $before = $request->query('before'); // Pagination cursor (timestamp)

        $query = RoomMessage::where('room_id', $room->id)
            ->with('user:id,username,avatar_url')
            ->orderBy('sent_at', 'desc');

        if ($before) {
            $query->where('sent_at', '<', $before);
        }

        $messages = $query->limit($limit)->get();

        return $this->success([
            'messages' => $messages->map(fn ($msg) => [
                'id' => $msg->id,
                'content' => $msg->content,
                'type' => $msg->type,
                'user' => $msg->user ? [
                    'id' => $msg->user->id,
                    'username' => $msg->user->username,
                    'avatar_url' => $msg->user->avatar_url,
                ] : null,
                'sent_at' => $msg->sent_at,
            ]),
        ]);
    }

    /**
     * Send a message to a study room.
     * POST /api/v1/study-rooms/{room}/messages
     *
     * Note: In production, this would typically be done via WebSocket client-events,
     * but we provide this HTTP endpoint for fallback or initial message posting.
     */
    public function store(SendMessageRequest $request, StudyRoom $room): JsonResponse
    {
        $user = $request->user();

        // Check if user is a participant
        if (! $room->participants()->where('user_id', $user->id)->exists()) {
            return $this->error('NOT_A_PARTICIPANT', 'Anda bukan peserta ruang belajar ini.', 403);
        }

        // Check if room is still active
        if ($room->status !== 'active') {
            return $this->error('ROOM_CLOSED', 'Ruang belajar ini sudah ditutup.', 403);
        }

        $validated = $request->validated();

        $message = RoomMessage::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
            'sent_at' => now(),
        ]);

        $message->load('user:id,username,avatar_url');

        // Broadcast message via Reverb
        broadcast(new StudyRoomMessageSent($room, $message))->toOthers();

        return $this->success([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'type' => $message->type,
                'user' => [
                    'id' => $message->user->id,
                    'username' => $message->user->username,
                    'avatar_url' => $message->user->avatar_url,
                ],
                'sent_at' => $message->sent_at,
            ],
        ], 'Pesan berhasil dikirim.', 201);
    }
}
