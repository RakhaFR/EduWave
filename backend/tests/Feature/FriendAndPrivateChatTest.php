<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendAndPrivateChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_follow_another_user_and_see_friends_when_mutual(): void
    {
        $userA = User::factory()->create(['username' => 'usera']);
        $userB = User::factory()->create(['username' => 'userb']);

        $resFollow = $this->actingAs($userA)->postJson("/api/v1/friends/follow/{$userB->id}");
        $resFollow->assertOk()
            ->assertJsonPath('data.status', 'following')
            ->assertJsonPath('data.is_mutual', false);

        $resMutual = $this->actingAs($userB)->postJson("/api/v1/friends/follow/{$userA->id}");
        $resMutual->assertOk()
            ->assertJsonPath('data.status', 'friend')
            ->assertJsonPath('data.is_mutual', true);

        $this->actingAs($userA)->getJson('/api/v1/friends')
            ->assertOk()
            ->assertJsonCount(1, 'data.friends')
            ->assertJsonPath('data.friends.0.id', $userB->id);
    }

    public function test_cannot_start_private_chat_unless_mutual_friends(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($userA)->postJson("/api/v1/friends/follow/{$userB->id}")->assertOk();

        $this->actingAs($userA)->postJson("/api/v1/private-chats/start/{$userB->id}")
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'NOT_MUTUAL_FRIENDS');
    }

    public function test_mutual_friends_can_start_chat_and_send_messages(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $this->actingAs($userA)->postJson("/api/v1/friends/follow/{$userB->id}")->assertOk();
        $this->actingAs($userB)->postJson("/api/v1/friends/follow/{$userA->id}")->assertOk();

        $startRes = $this->actingAs($userA)->postJson("/api/v1/private-chats/start/{$userB->id}");
        $startRes->assertOk();

        $convId = $startRes->json('data.conversation.id');

        $sendRes = $this->actingAs($userA)->postJson("/api/v1/private-chats/{$convId}/messages", [
            'content' => 'Halo teman!',
        ]);

        $sendRes->assertCreated()
            ->assertJsonPath('data.message.content', 'Halo teman!');

        $this->actingAs($userB)->getJson("/api/v1/private-chats/{$convId}/messages")
            ->assertOk()
            ->assertJsonCount(1, 'data.messages')
            ->assertJsonPath('data.messages.0.content', 'Halo teman!');
    }

    public function test_non_participant_cannot_read_private_chat_messages(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userC = User::factory()->create();

        $this->actingAs($userA)->postJson("/api/v1/friends/follow/{$userB->id}")->assertOk();
        $this->actingAs($userB)->postJson("/api/v1/friends/follow/{$userA->id}")->assertOk();

        $startRes = $this->actingAs($userA)->postJson("/api/v1/private-chats/start/{$userB->id}")->assertOk();
        $convId = $startRes->json('data.conversation.id');

        $this->actingAs($userC)->getJson("/api/v1/private-chats/{$convId}/messages")
            ->assertStatus(403)
            ->assertJsonPath('error.code', 'UNAUTHORIZED_CONVERSATION');
    }
}
