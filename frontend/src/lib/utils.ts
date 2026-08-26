import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatErrorMessage(err: any, defaultMsg = 'Terjadi kesalahan pada sistem.'): string {
  if (!err) return defaultMsg;

  // Jika response dari API backend memiliki format error message
  const apiMsg = err.response?.data?.error?.message;
  if (apiMsg && typeof apiMsg === 'string') {
    return escapeHtml(apiMsg);
  }

  // Jika error status code 422 (Unprocessable Content)
  if (err.response?.status === 422) {
    return 'Format data yang Anda masukkan tidak valid. Silakan periksa kembali.';
  }

  // Jika error status code 401 (Unauthorized)
  if (err.response?.status === 401) {
    return 'Email/username atau password salah.';
  }

  // Jika error status code 409 (Conflict/Already registered)
  if (err.response?.status === 409) {
    return 'Email atau username sudah terdaftar.';
  }

  const rawMsg = err.message || '';
  if (typeof rawMsg === 'string' && rawMsg.includes('Request failed with status code')) {
    if (rawMsg.includes('422')) return 'Format data tidak valid. Silakan periksa isian Anda.';
    if (rawMsg.includes('401')) return 'Email/username atau password salah.';
    if (rawMsg.includes('403')) return 'Anda tidak memiliki hak akses.';
    if (rawMsg.includes('500')) return 'Terjadi gangguan pada server backend.';
    return defaultMsg;
  }

  return escapeHtml(typeof rawMsg === 'string' ? rawMsg : defaultMsg);
}
