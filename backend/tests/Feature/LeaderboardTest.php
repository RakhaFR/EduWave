<?php

namespace Tests\Feature;

use App\Events\XpAwarded;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Lesson;
use App\Models\User;
use App\Services\LeaderboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

/**
 * Phase 4.5 Feature Tests — LeaderboardController, LeaderboardService, XpAwarded Event
 */
class LeaderboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Verify Redis is available; skip entire test if not
        try {
            $connection = Redis::connection();
            $connection->ping();

            // Flush Redis database to ensure no key leakage between tests
            $connection->flushdb();
        } catch (\Exception $e) {
            $this->markTestSkipped('Redis is not available: '.$e->getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. LeaderboardService Unit Tests
    // ──────────────────────────────────────────────────────────────────────────

    public function test_leaderboard_service_updates_global_leaderboard(): void
    {
        $user = User::factory()->create(['xp' => 100]);

        $service = app(LeaderboardService::class);
        $service->updateScore($user);

        $score = Redis::zscore('leaderboard:global', $user->id);
        $this->assertEquals('100', $score);
    }

    public function test_leaderboard_service_updates_weekly_leaderboard(): void
    {
        $user = User::factory()->create(['xp' => 250]);

        $service = app(LeaderboardService::class);
        $service->updateScore($user);

        $weekKey = 'leaderboard:weekly:'.now()->format('o-\WW');
        $score = Redis::zscore($weekKey, $user->id);
        $this->assertEquals('250', $score);
    }

    public function test_leaderboard_service_returns_correct_rank_using_zrevrank(): void
    {
        $service = app(LeaderboardService::class);

        // Create users with specific XP: 100, 200, 300, 400, 500
        $user1 = User::factory()->create(['xp' => 100]);
        $user2 = User::factory()->create(['xp' => 200]);
        $user3 = User::factory()->create(['xp' => 300]);
        $user4 = User::factory()->create(['xp' => 400]);
        $user5 = User::factory()->create(['xp' => 500]);

        $service->updateScore($user1);
        $service->updateScore($user2);
        $service->updateScore($user3);
        $service->updateScore($user4);
        $service->updateScore($user5);

        // User with 500 XP should be rank 0 (0-indexed from Redis ZREVRANK)
        $rank = $service->getRank($user5, 'global');
        $this->assertEquals(0, $rank);

        // User with 100 XP should be rank 4
        $rank = $service->getRank($user1, 'global');
        $this->assertEquals(4, $rank);
    }

    public function test_leaderboard_service_returns_top_n_users_in_correct_order(): void
    {
        $service = app(LeaderboardService::class);

        // Create users and immediately update leaderboard
        $user1 = User::factory()->create(['xp' => 100]);
        $service->updateScore($user1);

        $user2 = User::factory()->create(['xp' => 200]);
        $service->updateScore($user2);

        $user3 = User::factory()->create(['xp' => 300]);
        $service->updateScore($user3);

        $user4 = User::factory()->create(['xp' => 400]);
        $service->updateScore($user4);

        $user5 = User::factory()->create(['xp' => 500]);
        $service->updateScore($user5);

        $topUsers = $service->getTopN('global', 3);

        $this->assertCount(3, $topUsers);
        $this->assertEquals(500.0, $topUsers[0]['score']);
        $this->assertEquals(1, $topUsers[0]['rank']); // 1-indexed for display
        $this->assertEquals(400.0, $topUsers[1]['score']);
        $this->assertEquals(300.0, $topUsers[2]['score']);
    }

    public function test_leaderboard_service_returns_user_rank_and_neighbors(): void
    {
        $service = app(LeaderboardService::class);

        // Create 7 users with XP: 100, 200, 300, 400, 500, 600, 700
        $user1 = User::factory()->create(['xp' => 100]);
        $user2 = User::factory()->create(['xp' => 200]);
        $user3 = User::factory()->create(['xp' => 300]);
        $user4 = User::factory()->create(['xp' => 400]);
        $user5 = User::factory()->create(['xp' => 500]);
        $user6 = User::factory()->create(['xp' => 600]);
        $user7 = User::factory()->create(['xp' => 700]);

        $service->updateScore($user1);
        $service->updateScore($user2);
        $service->updateScore($user3);
        $service->updateScore($user4);
        $service->updateScore($user5);
        $service->updateScore($user6);
        $service->updateScore($user7);

        // Middle user (400 XP, rank 3 in 0-indexed = rank 4 in 1-indexed)
        $result = $service->getUserWithNeighbors($user4, 'global', 2, 2);

        $this->assertEquals(4, $result['user_rank']); // 1-indexed
        $this->assertCount(5, $result['neighbors']); // 2 above + self + 2 below

        // Verify order: 700, 600, 500, 400 (self), 300
        // neighbors[0] = rank 2 = 600 XP, neighbors[2] = rank 4 = 400 XP (self), neighbors[4] = rank 6 = 200 XP
        $this->assertEquals(600.0, $result['neighbors'][0]['score']);
        $this->assertEquals(400.0, $result['neighbors'][2]['score']); // self
        $this->assertEquals(200.0, $result['neighbors'][4]['score']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. XpAwarded Event Integration Tests
    // ──────────────────────────────────────────────────────────────────────────

    public function test_xp_awarded_event_dispatched_when_lesson_completed(): void
    {
        Event::fake([XpAwarded::class]);

        $user = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create(['instructor_id' => $user->id]);
        $lesson = Lesson::factory()->create([
            'course_id' => $course->id,
            'xp_reward' => 50,
        ]);

        Enrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => 'enrolled',
            'completed_at' => null,
        ]);

        $this->actingAs($user);
        $this->postJson("/api/v1/lessons/{$lesson->id}/complete", [
            'watch_seconds' => 300,
        ]);

        Event::assertDispatched(XpAwarded::class, function ($event) use ($user) {
            return $event->user->id === $user->id
                && $event->xpAmount === 50
                && $event->source === 'lesson';
        });
    }

    public function test_xp_awarded_event_dispatched_when_exam_submitted(): void
    {
        Event::fake([XpAwarded::class]);

        $user = User::factory()->create();
        $course = Course::factory()->create();
        $exam = Exam::factory()->create([
            'course_id' => $course->id,
            'passing_score' => 70,
            'pearls_reward' => 30,
        ]);

        // Create questions
        $questions = ExamQuestion::factory()->count(2)->create([
            'exam_id' => $exam->id,
            'points' => 50,
            'correct_answer' => 'A',
        ]);

        Enrollment::factory()->create([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        $this->actingAs($user);

        // Start attempt
        $startResponse = $this->postJson("/api/v1/exams/{$exam->id}/attempts");
        $attemptId = $startResponse->json('data.attempt_id');

        // Submit with correct answers (score 100)
        $this->postJson("/api/v1/exams/{$exam->id}/attempts/{$attemptId}/submit", [
            'answers' => [
                ['question_id' => $questions[0]->id, 'selected_key' => 'A'],
                ['question_id' => $questions[1]->id, 'selected_key' => 'A'],
            ],
        ]);

        Event::assertDispatched(XpAwarded::class, function ($event) use ($user) {
            return $event->user->id === $user->id
                && $event->xpAmount === 200 // score 100 * 2
                && $event->source === 'exam';
        });
    }

    public function test_leaderboard_updated_via_listener_when_xp_awarded(): void
    {
        // Don't fake events, let them run
        $user = User::factory()->create(['xp' => 0]);

        // Award XP manually
        $user->increment('xp', 150);
        XpAwarded::dispatch($user, 150, 'test');

        // Give listener time to process (for sync queue, this should be immediate)
        // Verify Redis was updated
        $score = Redis::zscore('leaderboard:global', $user->id);
        $this->assertEquals('150', $score);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Leaderboard API Endpoints Tests
    // ──────────────────────────────────────────────────────────────────────────

    public function test_global_leaderboard_returns_users_ordered_by_xp(): void
    {
        $service = app(LeaderboardService::class);

        // Create 5 users with ascending XP
        $user1 = User::factory()->create(['xp' => 100, 'username' => 'user0', 'level' => 1]);
        $user2 = User::factory()->create(['xp' => 200, 'username' => 'user1', 'level' => 2]);
        $user3 = User::factory()->create(['xp' => 300, 'username' => 'user2', 'level' => 3]);
        $user4 = User::factory()->create(['xp' => 400, 'username' => 'user3', 'level' => 4]);
        $user5 = User::factory()->create(['xp' => 500, 'username' => 'user4', 'level' => 5]);

        $service->updateScore($user1);
        $service->updateScore($user2);
        $service->updateScore($user3);
        $service->updateScore($user4);
        $service->updateScore($user5);

        $response = $this->getJson('/api/v1/leaderboard');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $rankings = $response->json('data.rankings');
        $this->assertCount(5, $rankings);

        // Highest XP first
        $this->assertEquals(500, $rankings[0]['xp']);
        $this->assertEquals(1, $rankings[0]['rank']);
        $this->assertEquals(100, $rankings[4]['xp']);
        $this->assertEquals(5, $rankings[4]['rank']);
    }

    public function test_weekly_leaderboard_returns_current_week_rankings(): void
    {
        $service = app(LeaderboardService::class);

        $user1 = User::factory()->create(['xp' => 100]);
        $user2 = User::factory()->create(['xp' => 200]);
        $user3 = User::factory()->create(['xp' => 300]);

        $service->updateScore($user1);
        $service->updateScore($user2);
        $service->updateScore($user3);

        $response = $this->getJson('/api/v1/leaderboard/weekly');

        $response->assertStatus(200);
        $response->assertJsonPath('meta.scope', 'weekly');
        $response->assertJsonPath('meta.week', now()->format('o-\WW'));

        $rankings = $response->json('data.rankings');
        $this->assertEquals(300, $rankings[0]['xp']);
    }

    public function test_leaderboard_me_returns_user_rank_and_neighbors(): void
    {
        $service = app(LeaderboardService::class);

        // Create 7 users with XP: 100, 200, 300, 400, 500, 600, 700
        $user1 = User::factory()->create(['xp' => 100, 'username' => 'user0']);
        $user2 = User::factory()->create(['xp' => 200, 'username' => 'user1']);
        $user3 = User::factory()->create(['xp' => 300, 'username' => 'user2']);
        $user4 = User::factory()->create(['xp' => 400, 'username' => 'user3']);
        $user5 = User::factory()->create(['xp' => 500, 'username' => 'user4']);
        $user6 = User::factory()->create(['xp' => 600, 'username' => 'user5']);
        $user7 = User::factory()->create(['xp' => 700, 'username' => 'user6']);

        $service->updateScore($user1);
        $service->updateScore($user2);
        $service->updateScore($user3);
        $service->updateScore($user4);
        $service->updateScore($user5);
        $service->updateScore($user6);
        $service->updateScore($user7);

        // Act as middle user (400 XP)
        $this->actingAs($user4);

        $response = $this->getJson('/api/v1/leaderboard/me?scope=global&neighbors=2');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $userRank = $response->json('data.user_rank');
        $neighbors = $response->json('data.neighbors');

        $this->assertEquals(4, $userRank); // 1-indexed
        $this->assertCount(5, $neighbors); // 2 above + self + 2 below

        // Verify middle neighbor is the authenticated user
        $middleNeighbor = collect($neighbors)->firstWhere('rank', 4);
        $this->assertEquals($user4->id, $middleNeighbor['user']['id']);
        $this->assertEquals(400, $middleNeighbor['xp']);
    }

    public function test_leaderboard_me_handles_user_with_no_xp_gracefully(): void
    {
        $user = User::factory()->create(['xp' => 0]);
        $service = app(LeaderboardService::class);
        $service->updateScore($user);

        $this->actingAs($user);
        $response = $this->getJson('/api/v1/leaderboard/me');

        $response->assertStatus(200);
        $response->assertJsonPath('data.user_rank', 1);
        $response->assertJsonPath('data.neighbors.0.user.id', $user->id);
        $response->assertJsonPath('data.neighbors.0.xp', 0);
        $response->assertJsonPath('data.neighbors.0.rank', 1);
    }

    public function test_leaderboard_me_includes_a_ranked_user_when_the_context_range_is_empty(): void
    {
        $user = User::factory()->create(['xp' => 150]);
        $service = app(LeaderboardService::class);
        $service->updateScore($user);

        $this->actingAs($user)
            ->getJson('/api/v1/leaderboard/me?scope=global&neighbors=3')
            ->assertOk()
            ->assertJsonPath('data.user_rank', 1)
            ->assertJsonPath('data.neighbors.0.user.id', $user->id)
            ->assertJsonPath('data.neighbors.0.xp', 150)
            ->assertJsonPath('data.neighbors.0.rank', 1);
    }

    public function test_global_leaderboard_supports_pagination(): void
    {
        $service = app(LeaderboardService::class);

        // Create 100 users with XP from 10 to 1000
        for ($i = 1; $i <= 100; $i++) {
            $user = User::factory()->create(['xp' => $i * 10]);
            $service->updateScore($user);
        }

        $authUser = User::factory()->create(['xp' => 1]);
        $this->actingAs($authUser);
        $response = $this->getJson('/api/v1/leaderboard?page=2&per_page=20');

        $response->assertStatus(200);
        $response->assertJsonPath('meta.current_page', 2);
        $response->assertJsonPath('meta.per_page', 20);

        $rankings = $response->json('data.rankings');
        $this->assertCount(20, $rankings);

        // Page 2 should show ranks 21-40
        $this->assertEquals(21, $rankings[0]['rank']);
        $this->assertEquals(40, $rankings[19]['rank']);
    }
}
