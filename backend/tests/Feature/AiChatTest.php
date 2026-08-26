<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiChatTest extends TestCase
{
    public function test_authenticated_user_can_chat_with_ai(): void
    {
        config(['services.xkiro.key' => 'test-key']);
        Http::fake([
            'api.xkiro.com/v1/chat/completions' => Http::response([
                'model' => 'qwen/qwen3.7-plus:free',
                'choices' => [['message' => ['content' => 'Halo dari AI.']]],
                'usage' => ['total_tokens' => 12],
            ]),
        ]);

        $user = User::factory()->create(['role' => 'student']);
        $response = $this->actingAs($user)->postJson('/api/v1/ai/chat', ['message' => 'Hello!']);

        $response->assertOk()
            ->assertJsonPath('data.message', 'Halo dari AI.')
            ->assertJsonPath('data.model', 'qwen/qwen3.7-plus:free');
        Http::assertSent(fn ($request) => $request->url() === 'https://api.xkiro.com/v1/chat/completions'
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && data_get($request->data(), 'messages.1.content') === 'Hello!');
    }

    public function test_course_context_requires_enrollment(): void
    {
        config(['services.xkiro.key' => 'test-key']);
        Http::fake();
        $user = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create(['status' => 'published']);

        $this->actingAs($user)->postJson('/api/v1/ai/chat', [
            'message' => 'Explain this course', 'course_context_id' => $course->id,
        ])->assertForbidden()->assertJsonPath('error.code', 'AI_CONTEXT_ACCESS_DENIED');

        Http::assertNothingSent();
    }

    public function test_upstream_failure_returns_service_unavailable(): void
    {
        config(['services.xkiro.key' => 'test-key']);
        Http::fake(['api.xkiro.com/v1/chat/completions' => Http::response([], 503)]);
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/v1/ai/chat', ['message' => 'Hello!'])
            ->assertServiceUnavailable()->assertJsonPath('error.code', 'AI_SERVICE_UNAVAILABLE');
    }
}
