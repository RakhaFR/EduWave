<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);

        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $query->orderBy('created_at', 'desc');

        $users = $query->paginate($perPage);

        return $this->paginated($users, function ($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
                'pearls' => $user->pearls,
                'xp' => $user->xp,
                'level' => $user->level,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
            ];
        });
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $user->update(['role' => $validated['role']]);

        return $this->success([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'role' => $user->role,
            ],
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role === 'admin') {
            return $this->error(
                'CANNOT_DELETE_ADMIN',
                'Akun admin tidak dapat dihapus.',
                403
            );
        }

        $user->delete();

        return $this->success(null);
    }
}
