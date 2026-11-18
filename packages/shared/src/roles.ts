export const ROLES = ['guest', 'member', 'scholar', 'moderator', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export interface UserSummary {
  id: string;
  email?: string;
  phone?: string;
  roles: Role[];
  status: 'active' | 'suspended' | 'deleted';
  twoFactorEnabled: boolean;
  displayName: string;
  avatarUrl?: string;
}

