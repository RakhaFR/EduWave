<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FriendshipController extends ApiController
{
    /**
     * List all friends (mutual follow).
     * GET /api/v1/friends
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $friends = $user->friends()
            ->select(['users.id', 'users.username', 'users.full_name', 'users.avatar_url', 'users.bio', 'users.level', 'users.xp', 'users.last_active'])
            ->orderBy('username')
            ->get();

        return $this->success([
            'friends' => $friends->map(fn (User $friend) => [
                'id' => $friend->id,
                'username' => $friend->username,
                'full_name' => $friend->full_name,
                'avatar_url' => $friend->avatar_url,
                'bio' => $friend->bio,
                'level' => $friend->level,
                'xp' => $friend->xp,
                'last_active' => $friend->last_active,
                'status' => 'friend',
            ]),
        ]);
    }

    /**
     * List user's outgoing follow list and incoming followers.
     * GET /api/v1/friends/requests
     */
    public function requests(Request $request): JsonResponse
    {
        $user = $request->user();

        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followerIds = $user->followers()->pluck('users.id')->toArray();

        // Pending incoming: follow me, but I don't follow back yet
        $incomingIds = array_diff($followerIds, $followingIds);
        $incoming = User::whereIn('id', $incomingIds)
            ->select(['id', 'username', 'full_name', 'avatar_url'])
            ->get();

        // Pending outgoing: I follow them, but they don't follow back yet
        $outgoingIds = array_diff($followingIds, $followerIds);
        $outgoing = User::whereIn('id', $outgoingIds)
            ->select(['id', 'username', 'full_name', 'avatar_url'])
            ->get();

        return $this->success([
            'incoming' => $incoming,
            'outgoing' => $outgoing,
        ]);
    }

    /**
     * Follow/add a user as friend.
     * POST /api/v1/friends/follow/{user}
     */
    public function follow(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();

        if ($auth->id === $user->id) {
            return $this->error('CANNOT_FOLLOW_SELF', 'Anda tidak dapat mengikuti diri sendiri.', 422);
        }

        if ($auth->isFollowing($user)) {
            return $this->error('ALREADY_FOLLOWING', 'Anda sudah mengikuti pengguna ini.', 409);
        }

        $auth->following()->attach($user->id, ['id' => (string) Str::uuid()]);

        $isMutual = $user->isFollowing($auth);

        return $this->success([
            'following_id' => $user->id,
            'is_mutual' => $isMutual,
            'status' => $isMutual ? 'friend' : 'following',
        ], $isMutual ? 'Sekarang kalian berteman.' : 'Berhasil mengikuti pengguna.');
    }

    /**
     * Unfollow/remove a friend.
     * DELETE /api/v1/friends/unfollow/{user}
     */
    public function unfollow(Request $request, User $user): JsonResponse
    {
        $auth = $request->user();

        if (! $auth->isFollowing($user)) {
            return $this->error('NOT_FOLLOWING', 'Anda belum mengikuti pengguna ini.', 404);
        }

        $auth->following()->detach($user->id);

        return $this->success([
            'unfollowed_id' => $user->id,
        ], 'Berhasil berhenti mengikuti.');
    }
}
