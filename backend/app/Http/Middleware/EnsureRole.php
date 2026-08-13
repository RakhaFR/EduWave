<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes: ->middleware('role:admin,instructor')
     * Grants access if the authenticated user's role matches any of the given roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'error'   => [
                    'code'    => 'FORBIDDEN',
                    'message' => 'Anda tidak memiliki izin untuk mengakses sumber daya ini.',
                ],
                'meta' => null,
            ], 403);
        }

        return $next($request);
    }
}
