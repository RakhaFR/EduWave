<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends ApiController
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Check if user already exists (should be caught by validation, but extra check)
        if (User::where('email', $validated['email'])->exists()) {
            return $this->error('AUTH_EMAIL_TAKEN', 'Email sudah terdaftar.', 409);
        }

        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'full_name' => $validated['full_name'],
            'role' => 'student',
            'pearls' => 0,
            'xp' => 0,
            'level' => 1,
        ]);

        // Create token
        $token = $user->createToken('eduwave-api', ['*'], now()->addDays(7));

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'created_at' => $user->created_at,
            ],
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
        ], '', 201);
    }

    /**
     * Login a user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Find user by email or username
        $user = User::where('email', $validated['email'])
            ->orWhere('username', $validated['email'])
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->error('AUTH_INVALID_CREDENTIALS', 'Email atau password salah.', 401);
        }

        // Create token
        $token = $user->createToken('eduwave-api', ['*'], now()->addDays(7));

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'created_at' => $user->created_at,
            ],
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout a user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        auth()->forgetGuards();

        return $this->success([], 'Logout berhasil.');
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'bio' => $user->bio,
                'last_active' => $user->last_active,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $status = Password::sendResetLink(['email' => $validated['email']]);

        if ($status !== Password::RESET_LINK_SENT) {
            return $this->error('RESET_FAILED', 'Gagal mengirim link reset.', 400);
        }

        return $this->success([], 'Link reset password telah dikirim ke email.');
    }

    /**
     * Reset password with token.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $status = Password::reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $validated['password_confirmation'],
                'token' => $validated['token'],
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->error('RESET_FAILED', 'Token reset tidak valid atau kadaluarsa.', 400);
        }

        return $this->success([], 'Password berhasil direset.');
    }
}
