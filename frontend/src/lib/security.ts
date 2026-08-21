/**
 * Security helper utilities for Frontend Input Validation & Sanitization
 */

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[<>'"]/g, '');    // Strip dangerous XML/HTML chars
}

export function validateUsername(username: string): { valid: boolean; message?: string } {
  const clean = username.trim();
  if (!clean) {
    return { valid: false, message: 'Username tidak boleh kosong.' };
  }
  if (clean.length < 3 || clean.length > 30) {
    return { valid: false, message: 'Username harus terdiri dari 3 - 30 karakter.' };
  }
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(clean)) {
    return { valid: false, message: 'Username hanya boleh memuat huruf, angka, underscore (_), dan dash (-).' };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; message?: string } {
  const clean = email.trim().toLowerCase();
  if (!clean) {
    return { valid: false, message: 'Email tidak boleh kosong.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'Format alamat email tidak valid.' };
  }
  if (!clean.endsWith('@gmail.com') && !clean.endsWith('@eduwave.id')) {
    return { valid: false, message: 'Email harus menggunakan domain @gmail.com atau @eduwave.id' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: 'Password tidak boleh kosong.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter.' };
  }
  return { valid: true };
}

// Client-side rate limiter for Brute-Force protection
class RateLimiter {
  private attempts: Record<string, { count: number; lastAttempt: number }> = {};

  isRateLimited(key: string, maxAttempts = 5, windowMs = 60000): { limited: boolean; remainingSec?: number } {
    const now = Date.now();
    const record = this.attempts[key];

    if (!record) {
      return { limited: false };
    }

    if (now - record.lastAttempt > windowMs) {
      // Reset window
      delete this.attempts[key];
      return { limited: false };
    }

    if (record.count >= maxAttempts) {
      const remainingSec = Math.ceil((windowMs - (now - record.lastAttempt)) / 1000);
      return { limited: true, remainingSec };
    }

    return { limited: false };
  }

  recordAttempt(key: string) {
    const now = Date.now();
    if (!this.attempts[key]) {
      this.attempts[key] = { count: 1, lastAttempt: now };
    } else {
      this.attempts[key].count += 1;
      this.attempts[key].lastAttempt = now;
    }
  }

  resetAttempts(key: string) {
    delete this.attempts[key];
  }
}

export const authRateLimiter = new RateLimiter();
