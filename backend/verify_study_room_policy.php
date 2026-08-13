<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\StudyRoom;
use App\Models\User;

echo "=== StudyRoomPolicy::join() Verification ===\n\n";

// Create users
$host = User::factory()->create(['role' => 'student']);
$student1 = User::factory()->create(['role' => 'student']);
$student2 = User::factory()->create(['role' => 'student']);

// Create a study room with max_capacity = 3 (host + 2 participants)
$room = StudyRoom::factory()->create([
    'host_user_id' => $host->id,
    'max_capacity' => 3,
    'status' => 'active',
]);

echo "Test 1: Room with capacity 3, host already in room\n";

// Add host as participant
$room->participants()->attach($host->id);
$count = $room->participants()->count();
echo "  Participants: $count / 3\n";

// Test: student1 can join (count = 1, limit = 3)
$policy = new \App\Policies\StudyRoomPolicy();
$allowed = $policy->join($student1, $room);
echo "  Student1 can join: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Should allow when under capacity\n";
    exit(1);
}

// Add student1
$room->participants()->attach($student1->id);
$count = $room->participants()->count();
echo "  Participants: $count / 3\n";

// Test: student2 can join (count = 2, limit = 3)
$allowed = $policy->join($student2, $room);
echo "  Student2 can join: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Should allow when under capacity\n";
    exit(1);
}

// Add student2 (now at max capacity)
$room->participants()->attach($student2->id);
$count = $room->participants()->count();
echo "  Participants: $count / 3\n";

// Test: another user cannot join (count = 3, at limit)
$student3 = User::factory()->create(['role' => 'student']);
$allowed = $policy->join($student3, $room);
echo "  Student3 can join: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Should deny when at capacity\n";
    exit(1);
}

echo "\n";

// Test 2: Room status check
echo "Test 2: Room status validation\n";

// Create an inactive room
$closedRoom = StudyRoom::factory()->create([
    'host_user_id' => $host->id,
    'status' => 'closed',
]);

$allowed = $policy->join($student3, $closedRoom);
echo "  Can join closed room: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Should deny when room is closed\n";
    exit(1);
}

echo "\n";

echo "=== All StudyRoomPolicy Tests Passed ✅ ===\n";
