<?php

namespace App\Providers;

use App\Events\XpAwarded;
use App\Listeners\UpdateLeaderboardOnXpAwarded;
use App\Models\Course;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Lesson;
use App\Models\StudyRoom;
use App\Policies\CoursePolicy;
use App\Policies\ExamAttemptPolicy;
use App\Policies\ExamPolicy;
use App\Policies\LessonPolicy;
use App\Policies\StudyRoomPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies for authorization checks
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(Lesson::class, LessonPolicy::class);
        Gate::policy(Exam::class, ExamPolicy::class);
        Gate::policy(ExamAttempt::class, ExamAttemptPolicy::class);
        Gate::policy(StudyRoom::class, StudyRoomPolicy::class);

        // Register event listeners
        Event::listen(
            XpAwarded::class,
            UpdateLeaderboardOnXpAwarded::class
        );
    }
}
