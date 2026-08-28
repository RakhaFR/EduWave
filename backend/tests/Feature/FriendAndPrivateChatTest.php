<?php

namespace Tests\Feature;

use App\Events\PrivateMessageDeleted;
use App\Events\PrivateMessageUpdated;
use App\Models\PrivateConversation;
use App\Models\PrivateMessage;
use App\Models\User;
use App\Services\ChatAttachmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
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

    public function test_sender_can_update_own_private_message(): void
    {
        [$userA, , $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA, 'Pesan awal');

        $response = $this->actingAs($userA)->putJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}", [
            'content' => 'Pesan diperbarui',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.message.id', $message->id)
            ->assertJsonPath('data.message.content', 'Pesan diperbarui')
            ->assertJsonPath('data.message.sender_id', $userA->id);

        $this->assertDatabaseHas('private_messages', [
            'id' => $message->id,
            'content' => 'Pesan diperbarui',
        ]);
    }

    public function test_sender_can_delete_own_private_message(): void
    {
        [$userA, , $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA);

        $response = $this->actingAs($userA)
            ->deleteJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}");

        $response->assertOk()->assertJsonPath('data.message_id', $message->id);
        $this->assertDatabaseMissing('private_messages', ['id' => $message->id]);
    }

    public function test_user_cannot_update_or_delete_another_users_private_message(): void
    {
        [$userA, $userB, $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA);

        $this->actingAs($userB)
            ->putJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}", ['content' => 'Tidak boleh'])
            ->assertForbidden()
            ->assertJsonPath('error.code', 'MESSAGE_NOT_OWNED');

        $this->actingAs($userB)
            ->deleteJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}")
            ->assertForbidden()
            ->assertJsonPath('error.code', 'MESSAGE_NOT_OWNED');
    }

    public function test_private_message_must_belong_to_url_conversation(): void
    {
        [$userA, , $conversation] = $this->privateConversation();
        [, , $otherConversation] = $this->privateConversation();
        $message = $this->privateMessage($otherConversation, $otherConversation->userOne);

        $this->actingAs($userA)
            ->putJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}", ['content' => 'Tidak boleh'])
            ->assertNotFound()
            ->assertJsonPath('error.code', 'MESSAGE_NOT_FOUND');

        $this->actingAs($userA)
            ->deleteJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}")
            ->assertNotFound()
            ->assertJsonPath('error.code', 'MESSAGE_NOT_FOUND');
    }

    public function test_private_message_update_validates_content(): void
    {
        [$userA, , $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA);

        $this->actingAs($userA)
            ->putJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}", ['content' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }

    public function test_private_message_update_and_delete_dispatch_broadcast_events(): void
    {
        Event::fake([PrivateMessageUpdated::class, PrivateMessageDeleted::class]);
        [$userA, , $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA);

        $this->actingAs($userA)
            ->putJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}", ['content' => 'Diperbarui'])
            ->assertOk();

        $this->actingAs($userA)
            ->deleteJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}")
            ->assertOk();

        Event::assertDispatched(PrivateMessageUpdated::class);
        Event::assertDispatched(PrivateMessageDeleted::class);
    }

    public function test_deleting_private_message_cleans_up_its_attachment(): void
    {
        [$userA, , $conversation] = $this->privateConversation();
        $message = $this->privateMessage($conversation, $userA, json_encode([
            'url' => 'https://res.cloudinary.com/example/image/upload/chat/file.jpg',
            'public_id' => 'chat/private/example/file',
            'resource_type' => 'image',
        ]));

        $this->mock(ChatAttachmentService::class, function ($mock) use ($message): void {
            $mock->shouldReceive('deleteFromPrivateMessage')->once()->withArgs(function ($actual) use ($message): bool {
                return $actual->is($message);
            });
        });

        $this->actingAs($userA)
            ->deleteJson("/api/v1/private-chats/{$conversation->id}/messages/{$message->id}")
            ->assertOk();
    }

    private function privateConversation(): array
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $conversation = PrivateConversation::create([
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
        ]);

        return [$userA, $userB, $conversation];
    }

    private function privateMessage(PrivateConversation $conversation, User $sender, string $content = 'Halo'): PrivateMessage
    {
        return PrivateMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'content' => $content,
            'sent_at' => now(),
        ]);
    }
}
