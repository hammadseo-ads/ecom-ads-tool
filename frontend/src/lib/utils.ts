import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pushToDataLayer(data: Record<string, any>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(data);
  }
}

export function cleanupAuthState() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('supabase_user_uuid');
  localStorage.removeItem('email_verified');
  localStorage.removeItem('is_new_user');
}
