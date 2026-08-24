<?php

namespace App\Http\Controllers;

use App\Events\PrivateMessageSent;
use App\Http\Requests\PrivateChat\SendPrivateMessageRequest;
use App\Models\PrivateConversation;
use App\Models\PrivateMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrivateChatController extends ApiController
{
    /**
     * List all private conversations for the authenticated user.
     * GET /api/v1/private-chats
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = PrivateConversation::where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with(['userOne:id,username,full_name,avatar_url', 'userTwo:id,username,full_name,avatar_url', 'messages' => fn ($q) => $q->latest('sent_at')->limit(1)])
            ->get()
            ->map(function ($conv) use ($user) {
                $friend = $conv->user_one_id === $user->id ? $conv->userTwo : $conv->userOne;
                $lastMessage = $conv->messages->first();

                return [
                    'id' => $conv->id,
                    'friend' => $friend ? [
                        'id' => $friend->id,
                        'username' => $friend->username,
                        'full_name' => $friend->full_name,
                        'avatar_url' => $friend->avatar_url,
                    ] : null,
                    'last_message' => $lastMessage ? [
                        'id' => $lastMessage->id,
                        'content' => $lastMessage->content,
                        'sender_id' => $lastMessage->sender_id,
                        'sent_at' => $lastMessage->sent_at,
                    ] : null,
                    'updated_at' => $conv->updated_at,
                ];
            });

        return $this->success(['conversations' => $conversations]);
    }

    /**
     * Start or fetch existing private conversation with a friend.
     * POST /api/v1/private-chats/start/{friend}
     */
    public function start(Request $request, User $friend): JsonResponse
    {
        $auth = $request->user();

        if ($auth->id === $friend->id) {
            return $this->error('CANNOT_CHAT_SELF', 'Anda tidak dapat memulai chat dengan diri sendiri.', 422);
        }

        if (! $auth->isFriendWith($friend)) {
            return $this->error('NOT_MUTUAL_FRIENDS', 'Anda hanya dapat mengobrol privat dengan pengguna yang saling berteman.', 403);
        }

        [$userOneId, $userTwoId] = $auth->id < $friend->id ? [$auth->id, $friend->id] : [$friend->id, $auth->id];

        $conversation = PrivateConversation::firstOrCreate([
            'user_one_id' => $userOneId,
            'user_two_id' => $userTwoId,
        ]);

        $conversation->load(['userOne:id,username,full_name,avatar_url', 'userTwo:id,username,full_name,avatar_url']);

        $peer = $conversation->user_one_id === $auth->id ? $conversation->userTwo : $conversation->userOne;

        return $this->success([
            'conversation' => [
                'id' => $conversation->id,
                'friend' => [
                    'id' => $peer->id,
                    'username' => $peer->username,
                    'full_name' => $peer->full_name,
                    'avatar_url' => $peer->avatar_url,
                ],
                'created_at' => $conversation->created_at,
            ],
        ], 'Percakapan berhasil dimulai atau ditemukan.');
    }

    /**
     * Get messages in a conversation.
     * GET /api/v1/private-chats/{conversation}/messages
     */
    public function messages(Request $request, PrivateConversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            return $this->error('UNAUTHORIZED_CONVERSATION', 'Anda tidak memiliki akses ke percakapan ini.', 403);
        }

        $perPage = min(100, max(1, (int) $request->query('per_page', 50)));

        $messages = $conversation->messages()
            ->with('sender:id,username,full_name,avatar_url')
            ->orderBy('sent_at', 'asc')
            ->paginate($perPage);

        return $this->success([
            'messages' => $messages->getCollection()->map(fn ($msg) => [
                'id' => $msg->id,
                'content' => $msg->content,
                'sender_id' => $msg->sender_id,
                'sent_at' => $msg->sent_at,
                'sender' => $msg->sender ? [
                    'id' => $msg->sender->id,
                    'username' => $msg->sender->username,
                    'full_name' => $msg->sender->full_name,
                    'avatar_url' => $msg->sender->avatar_url,
                ] : null,
            ]),
        ], '', 200, [
            'current_page' => $messages->currentPage(),
            'per_page' => $messages->perPage(),
            'total' => $messages->total(),
            'last_page' => $messages->lastPage(),
        ]);
    }

    /**
     * Send a private message to a friend conversation.
     * POST /api/v1/private-chats/{conversation}/messages
     */
    public function sendMessage(SendPrivateMessageRequest $request, PrivateConversation $conversation): JsonResponse
    {
        $user = $request->user();

        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            return $this->error('UNAUTHORIZED_CONVERSATION', 'Anda tidak memiliki akses ke percakapan ini.', 403);
        }

        $validated = $request->validated();

        $message = PrivateMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => $validated['content'],
            'sent_at' => now(),
        ]);

        $conversation->touch();
        $message->load('sender:id,username,full_name,avatar_url');

        broadcast(new PrivateMessageSent($message))->toOthers();

        return $this->success([
            'message' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'content' => $message->content,
                'sender_id' => $message->sender_id,
                'sent_at' => $message->sent_at,
                'sender' => [
                    'id' => $message->sender->id,
                    'username' => $message->sender->username,
                    'full_name' => $message->sender->full_name,
                    'avatar_url' => $message->sender->avatar_url,
                ],
            ],
        ], 'Pesan berhasil dikirim.', 201);
    }
}
