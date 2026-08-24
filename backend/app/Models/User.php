<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'bio',
        'avatar_url',
        'role',
        'pearls',
        'xp',
        'level',
        'streak_days',
        'last_active',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'id' => 'string',
        'pearls' => 'integer',
        'xp' => 'integer',
        'level' => 'integer',
        'streak_days' => 'integer',
        'last_active' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (User $user): void {
            if (Mascot::whereKey(Mascot::DEFAULT_ID)->exists()) {
                $user->mascots()->attach(Mascot::DEFAULT_ID, [
                    'is_active' => true,
                    'accessories' => null,
                    'unlocked_at' => now(),
                ]);
            }
        });
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function hostedRooms(): HasMany
    {
        return $this->hasMany(StudyRoom::class, 'host_user_id');
    }

    public function roomMessages(): HasMany
    {
        return $this->hasMany(RoomMessage::class);
    }

    public function userMascots(): HasMany
    {
        return $this->hasMany(UserMascot::class);
    }

    public function mascots(): BelongsToMany
    {
        return $this->belongsToMany(Mascot::class, 'user_mascots')
            ->using(UserMascot::class)
            ->withPivot(['is_active', 'accessories', 'unlocked_at']);
    }

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot(['earned_at']);
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'friendships', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    public function friends(): BelongsToMany
    {
        return $this->following()->whereHas('following', function ($query) {
            $query->where('following_id', $this->id);
        });
    }

    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    public function isFriendWith(User $user): bool
    {
        return $this->isFollowing($user) && $user->isFollowing($this);
    }
}
