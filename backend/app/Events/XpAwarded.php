<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class XpAwarded
{
    use Dispatchable, SerializesModels;

    public User $user;
    public int $xpAmount;
    public string $source;

    /**
     * Create a new event instance.
     *
     * @param  User  $user
     * @param  int  $xpAmount
     * @param  string  $source  ('lesson', 'exam', 'achievement', etc.)
     */
    public function __construct(User $user, int $xpAmount, string $source)
    {
        $this->user = $user;
        $this->xpAmount = $xpAmount;
        $this->source = $source;
    }
}
