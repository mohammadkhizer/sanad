import { Role } from './roles.js';

export const PERMISSIONS = [
  'content:view',
  'content:like_comment',
  'content:create',
  'content:edit_own',
  'content:delete_own',
  'content:remove_any',
  'live:host',
  'live:watch_chat',
  'chat:request',
  'chat:accept_initiate',
  'call:initiate',
  'application:submit',
  'application:review',
  'application:approve',
  'user:suspend',
  'role:assign',
  'role:revoke_scholar',
  'audit:view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  guest: ['content:view'],
  member: [
    'content:view',
    'content:like_comment',
    'live:watch_chat',
    'chat:request',
    'application:submit',
  ],
  scholar: [
    'content:view',
    'content:like_comment',
    'content:create',
    'content:edit_own',
    'content:delete_own',
    'live:host',
    'live:watch_chat',
    'chat:request',
    'chat:accept_initiate',
    'call:initiate',
  ],
  moderator: [
    'content:view',
    'content:like_comment',
    'content:remove_any',
    'live:watch_chat',
    'chat:request',
    'chat:accept_initiate',
    'application:review',
    'user:suspend',
  ],
  admin: [
    'content:view',
    'content:like_comment',
    'content:create',
    'content:edit_own',
    'content:delete_own',
    'content:remove_any',
    'live:host',
    'live:watch_chat',
    'chat:request',
    'chat:accept_initiate',
    'call:initiate',
    'application:review',
    'application:approve',
    'user:suspend',
    'role:assign',
    'role:revoke_scholar',
    'audit:view',
  ],
};

export function can(roles: Role[] | readonly Role[], permission: Permission): boolean {
  if (!roles || roles.length === 0) {
    return ROLE_PERMISSIONS.guest.includes(permission);
  }
  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions && permissions.includes(permission)) {
      return true;
    }
  }
  return false;
}

