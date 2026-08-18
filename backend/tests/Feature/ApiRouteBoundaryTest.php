<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiRouteBoundaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_routes_are_available_without_authentication(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create([
            'instructor_id' => $instructor->id,
            'status' => 'published',
        ]);

        $this->getJson('/api/v1/courses')->assertOk();
        $this->getJson("/api/v1/courses/{$course->id}")->assertOk();
    }

    public function test_protected_routes_reject_unauthenticated_requests(): void
    {
        $this->getJson('/api/v1/users/me')->assertUnauthorized();
        $this->getJson('/api/v1/study-rooms')->assertUnauthorized();
        $this->getJson('/api/v1/admin/users')->assertUnauthorized();
    }

    public function test_student_and_instructor_role_boundaries_are_enforced(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);

        $this->actingAs($student)
            ->postJson('/api/v1/courses', [])
            ->assertForbidden()
            ->assertJsonPath('error.code', 'FORBIDDEN');

        $this->actingAs($instructor)
            ->getJson('/api/v1/admin/users')
            ->assertForbidden()
            ->assertJsonPath('error.code', 'FORBIDDEN');

        $this->actingAs($instructor)
            ->postJson('/api/v1/courses', [])
            ->assertUnprocessable();
    }

    public function test_phase_five_routes_have_stable_names_and_middleware(): void
    {
        $this->assertSame('/api/v1/auth/login', route('api.v1.auth.login', absolute: false));
        $this->assertSame('/api/v1/study-rooms', route('api.v1.study-rooms.index', absolute: false));

        $route = Route::getRoutes()->getByName('api.v1.study-rooms.messages.store');

        $this->assertNotNull($route);
        $this->assertContains('auth:sanctum', $route->gatherMiddleware());
        $this->assertSame(
            'App\\Http\\Controllers\\RoomMessageController@store',
            $route->getActionName(),
        );
    }

    public function test_broadcast_auth_route_uses_sanctum_authentication(): void
    {
        $route = Route::getRoutes()->match(
            Request::create('/api/broadcasting/auth', 'POST'),
        );

        $this->assertContains('auth:sanctum', $route->gatherMiddleware());
        $this->postJson('/api/broadcasting/auth')->assertUnauthorized();
    }

    public function test_only_participants_can_authorize_the_study_room_channel(): void
    {
        $participant = User::factory()->create(['role' => 'student']);
        $outsider = User::factory()->create(['role' => 'student']);
        $room = StudyRoom::factory()->create();
        $room->participants()->attach($participant->id);
        $authorize = Broadcast::getChannels()->get('study-room.{roomId}');

        $this->assertNotNull($authorize);
        $this->assertTrue($authorize($participant, $room->id));
        $this->assertFalse($authorize($outsider, $room->id));
    }
}
