<?php

namespace Tests\Feature;

use App\Events\StudyRoomClosed;
use App\Events\StudyRoomMessageSent;
use App\Events\StudyRoomUserJoined;
use App\Events\StudyRoomUserLeft;
use App\Models\RoomMessage;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

/**
 * Phase 4.6 Feature Tests — StudyRoomController, RoomMessageController
 */
class StudyRoomTest extends TestCase
{
    use RefreshDatabase;

    private function student(): User
    {
        return User::factory()->create(['role' => 'student']);
    }

    private function instructor(): User
    {
        return User::factory()->create(['role' => 'instructor']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Study Room CRUD
    // ──────────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_create_study_room(): void
    {
        $user = $this->student();

        $response = $this->actingAs($user)->postJson('/api/v1/study-rooms', [
            'name' => 'Laravel Study Group',
            'topic' => 'Building REST APIs',
            'max_capacity' => 10,
            'is_public' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.room.name', 'Laravel Study Group')
            ->assertJsonPath('data.room.current_capacity', 1);

        $roomId = $response->json('data.room.id');

        // Verify host auto-joined
        $this->assertDatabaseHas('study_room_participants', [
            'room_id' => $roomId,
            'user_id' => $user->id,
        ]);
    }

    public function test_list_study_rooms_returns_active_rooms(): void
    {
        $user = $this->student();

        StudyRoom::factory()->count(3)->create(['status' => 'active']);
        StudyRoom::factory()->count(2)->create(['status' => 'closed']);

        $response = $this->actingAs($user)->getJson('/api/v1/study-rooms?status=active');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $rooms = $response->json('data.rooms');
        $this->assertCount(3, $rooms);
    }

    public function test_show_study_room_includes_participants(): void
    {
        $host = $this->student();
        $participant = $this->instructor();

        $room = StudyRoom::factory()->create(['host_user_id' => $host->id]);
        $room->participants()->attach([$host->id, $participant->id]);

        $response = $this->actingAs($host)->getJson("/api/v1/study-rooms/{$room->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.room.id', $room->id)
            ->assertJsonPath('data.room.current_capacity', 2);

        $participants = $response->json('data.room.participants');
        $this->assertCount(2, $participants);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Join & Leave
    // ──────────────────────────────────────────────────────────────────────────

    public function test_user_can_join_active_room(): void
    {
        $host = $this->student();
        $joiner = $this->instructor();

        $room = StudyRoom::factory()->create([
            'host_user_id' => $host->id,
            'status' => 'active',
            'max_capacity' => 10,
        ]);
        $room->participants()->attach($host->id);

        $response = $this->actingAs($joiner)->postJson("/api/v1/study-rooms/{$room->id}/join");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('study_room_participants', [
            'room_id' => $room->id,
            'user_id' => $joiner->id,
        ]);
    }

    public function test_joining_same_room_twice_returns_409(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/join");

        $response->assertStatus(409)
            ->assertJsonPath('error.code', 'ALREADY_JOINED');
    }

    public function test_joining_full_room_returns_403(): void
    {
        $host = $this->student();
        $joiner = $this->instructor();

        $room = StudyRoom::factory()->create([
            'host_user_id' => $host->id,
            'max_capacity' => 1,
        ]);
        $room->participants()->attach($host->id);

        $response = $this->actingAs($joiner)->postJson("/api/v1/study-rooms/{$room->id}/join");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'ROOM_FULL');
    }

    public function test_joining_closed_room_returns_403(): void
    {
        $joiner = $this->student();
        $room = StudyRoom::factory()->create(['status' => 'closed']);

        $response = $this->actingAs($joiner)->postJson("/api/v1/study-rooms/{$room->id}/join");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'ROOM_CLOSED');
    }

    public function test_user_can_leave_room(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->deleteJson("/api/v1/study-rooms/{$room->id}/leave");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('study_room_participants', [
            'room_id' => $room->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_host_leaving_closes_room(): void
    {
        $host = $this->student();
        $room = StudyRoom::factory()->create([
            'host_user_id' => $host->id,
            'status' => 'active',
        ]);
        $room->participants()->attach($host->id);

        $response = $this->actingAs($host)->deleteJson("/api/v1/study-rooms/{$room->id}/leave");

        $response->assertStatus(200);

        $this->assertDatabaseHas('study_rooms', [
            'id' => $room->id,
            'status' => 'closed',
        ]);
    }

    public function test_leaving_room_when_not_participant_returns_404(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();

        $response = $this->actingAs($user)->deleteJson("/api/v1/study-rooms/{$room->id}/leave");

        $response->assertStatus(404)
            ->assertJsonPath('error.code', 'NOT_A_PARTICIPANT');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Close Room (Destroy)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_host_can_close_room(): void
    {
        $host = $this->student();
        $room = StudyRoom::factory()->create([
            'host_user_id' => $host->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($host)->deleteJson("/api/v1/study-rooms/{$room->id}");

        $response->assertStatus(200);

        $this->assertDatabaseHas('study_rooms', [
            'id' => $room->id,
            'status' => 'closed',
        ]);
    }

    public function test_admin_can_close_any_room(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $host = $this->student();
        $room = StudyRoom::factory()->create(['host_user_id' => $host->id]);

        $response = $this->actingAs($admin)->deleteJson("/api/v1/study-rooms/{$room->id}");

        $response->assertStatus(200);

        $this->assertDatabaseHas('study_rooms', [
            'id' => $room->id,
            'status' => 'closed',
        ]);
    }

    public function test_non_host_cannot_close_room(): void
    {
        $host = $this->student();
        $other = $this->instructor();
        $room = StudyRoom::factory()->create(['host_user_id' => $host->id]);

        $response = $this->actingAs($other)->deleteJson("/api/v1/study-rooms/{$room->id}");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Messages
    // ──────────────────────────────────────────────────────────────────────────

    public function test_participant_can_send_message(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create(['status' => 'active']);
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'content' => 'Hello everyone!',
            'type' => 'text',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.message.content', 'Hello everyone!');

        $this->assertDatabaseHas('room_messages', [
            'room_id' => $room->id,
            'user_id' => $user->id,
            'content' => 'Hello everyone!',
        ]);
    }

    public function test_non_participant_cannot_send_message(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'content' => 'Hello!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'NOT_A_PARTICIPANT');
    }

    public function test_cannot_send_message_to_closed_room(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create(['status' => 'closed']);
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'content' => 'Hello!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'ROOM_CLOSED');
    }

    public function test_participant_can_get_message_history(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();
        $room->participants()->attach($user->id);

        RoomMessage::factory()->count(5)->create([
            'room_id' => $room->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->getJson("/api/v1/study-rooms/{$room->id}/messages?limit=10");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $messages = $response->json('data.messages');
        $this->assertCount(5, $messages);
    }

    public function test_non_participant_cannot_get_message_history(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();

        $response = $this->actingAs($user)->getJson("/api/v1/study-rooms/{$room->id}/messages");

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'NOT_A_PARTICIPANT');
    }

    public function test_study_room_actions_dispatch_broadcast_events(): void
    {
        $host = $this->student();
        $participant = $this->instructor();
        $room = StudyRoom::factory()->create([
            'host_user_id' => $host->id,
            'status' => 'active',
        ]);
        $room->participants()->attach($host->id);

        Event::fake([
            StudyRoomClosed::class,
            StudyRoomMessageSent::class,
            StudyRoomUserJoined::class,
            StudyRoomUserLeft::class,
        ]);

        $this->actingAs($participant)->postJson("/api/v1/study-rooms/{$room->id}/join")->assertOk();
        $this->actingAs($participant)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'content' => 'Ready to study.',
        ])->assertCreated();
        $this->actingAs($participant)->deleteJson("/api/v1/study-rooms/{$room->id}/leave")->assertOk();
        $this->actingAs($host)->deleteJson("/api/v1/study-rooms/{$room->id}")->assertOk();

        Event::assertDispatched(StudyRoomUserJoined::class);
        Event::assertDispatched(StudyRoomMessageSent::class);
        Event::assertDispatched(StudyRoomUserLeft::class);
        Event::assertDispatched(StudyRoomClosed::class);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. Validation
    // ──────────────────────────────────────────────────────────────────────────

    public function test_create_room_requires_name(): void
    {
        $user = $this->student();

        $response = $this->actingAs($user)->postJson('/api/v1/study-rooms', [
            'topic' => 'Some topic',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_create_room_validates_max_capacity_range(): void
    {
        $user = $this->student();

        $response = $this->actingAs($user)->postJson('/api/v1/study-rooms', [
            'name' => 'Test Room',
            'max_capacity' => 1, // Below minimum of 2
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('max_capacity');
    }

    public function test_send_message_requires_content(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create();
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'type' => 'text',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }

    public function test_send_message_validates_content_max_length(): void
    {
        $user = $this->student();
        $room = StudyRoom::factory()->create(['status' => 'active']);
        $room->participants()->attach($user->id);

        $response = $this->actingAs($user)->postJson("/api/v1/study-rooms/{$room->id}/messages", [
            'content' => str_repeat('a', 2001), // Exceeds 2000 character limit
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('content');
    }
}
