<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;
use App\Models\ExamAttempt;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

echo "=== Phase 4.1 Policy Verification ===\n\n";

// ===== Test 1: CoursePolicy update() =====
echo "Test 1: CoursePolicy::update()\n";

// Create users
$student = User::factory()->create(['role' => 'student']);
$instructor = User::factory()->create(['role' => 'instructor']);
$otherInstructor = User::factory()->create(['role' => 'instructor']);
$admin = User::factory()->create(['role' => 'admin']);

// Create a course with $instructor as owner
$course = Course::factory()->create(['instructor_id' => $instructor->id]);

$policy = new \App\Policies\CoursePolicy();

// Test: student cannot update
$allowed = $policy->update($student, $course);
echo "  Student can update course: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Student should not be able to update\n";
    exit(1);
}

// Test: owning instructor can update
$allowed = $policy->update($instructor, $course);
echo "  Owning instructor can update course: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Owning instructor should be able to update\n";
    exit(1);
}

// Test: non-owning instructor cannot update
$allowed = $policy->update($otherInstructor, $course);
echo "  Non-owning instructor can update course: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Non-owning instructor should not be able to update\n";
    exit(1);
}

// Test: admin can update
$allowed = $policy->update($admin, $course);
echo "  Admin can update course: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Admin should be able to update\n";
    exit(1);
}

echo "\n";

// ===== Test 2: ExamAttemptPolicy create() =====
echo "Test 2: ExamAttemptPolicy::create() — Attempt Limit Check\n";

// Create an exam with max_attempts = 2
$exam = Exam::factory()->create(['max_attempts' => 2]);

// Test: 0 attempts, should allow
$attemptCount = ExamAttempt::where('user_id', $student->id)
                            ->where('exam_id', $exam->id)
                            ->count();
// Use authorize() directly since create() is called with just the exam instance in controller context
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->create($student, $exam);
echo "  Attempts: $attemptCount / 2 → Create allowed: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Should allow at 0 attempts\n";
    exit(1);
}

// Create first attempt
ExamAttempt::factory()->create(['user_id' => $student->id, 'exam_id' => $exam->id]);

// Test: 1 attempt, should allow
$attemptCount = ExamAttempt::where('user_id', $student->id)
                            ->where('exam_id', $exam->id)
                            ->count();
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->create($student, $exam);
echo "  Attempts: $attemptCount / 2 → Create allowed: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Should allow at 1 attempt\n";
    exit(1);
}

// Create second attempt (now at max)
ExamAttempt::factory()->create(['user_id' => $student->id, 'exam_id' => $exam->id]);

// Test: 2 attempts (at limit), should deny
$attemptCount = ExamAttempt::where('user_id', $student->id)
                            ->where('exam_id', $exam->id)
                            ->count();
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->create($student, $exam);
echo "  Attempts: $attemptCount / 2 → Create allowed: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Should deny at 2 attempts (at limit)\n";
    exit(1);
}

echo "\n";

// ===== Test 3: ExamAttemptPolicy view() =====
echo "Test 3: ExamAttemptPolicy::view()\n";

$attempt = ExamAttempt::factory()->create(['user_id' => $student->id, 'exam_id' => $exam->id]);
$otherStudent = User::factory()->create(['role' => 'student']);

// Test: owner can view
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->view($student, $attempt);
echo "  Owner can view attempt: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Owner should be able to view\n";
    exit(1);
}

// Test: other student cannot view
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->view($otherStudent, $attempt);
echo "  Other student can view attempt: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Other student should not be able to view\n";
    exit(1);
}

// Test: admin can view
$policy = new \App\Policies\ExamAttemptPolicy();
$allowed = $policy->view($admin, $attempt);
echo "  Admin can view attempt: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Admin should be able to view\n";
    exit(1);
}

echo "\n";

// ===== Test 4: CoursePolicy create() =====
echo "Test 4: CoursePolicy::create()\n";

$coursePolicy = new \App\Policies\CoursePolicy();

// Test: student cannot create
$allowed = $coursePolicy->create($student);
echo "  Student can create course: " . ($allowed ? "YES ❌" : "NO ✅") . "\n";
if ($allowed) {
    echo "    FAILED: Student should not be able to create\n";
    exit(1);
}

// Test: instructor can create
$allowed = $coursePolicy->create($instructor);
echo "  Instructor can create course: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Instructor should be able to create\n";
    exit(1);
}

// Test: admin can create
$allowed = $coursePolicy->create($admin);
echo "  Admin can create course: " . ($allowed ? "YES ✅" : "NO ❌") . "\n";
if (!$allowed) {
    echo "    FAILED: Admin should be able to create\n";
    exit(1);
}

echo "\n";

echo "=== All Tests Passed ✅ ===\n";
