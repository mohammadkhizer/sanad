import { useAuthStore } from '../store/authStore';
import { can, Permission } from '@sanad/shared';

export function useCan(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  return can(user?.roles || ['guest'], permission);
}

