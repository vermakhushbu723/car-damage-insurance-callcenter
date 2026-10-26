import { api } from '../api/client.js';

// Signed-in user of the call-center portal: the token from callcenter-service
// plus the user (name, role, permissions from Admin > Roles & Permissions).
// Accounts are created in the Admin portal (Create Users).

const SESSION_KEY = 'ibima_callcenter_session_v1';
const listeners = new Set();

function read() {
    try {
        const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        return s?.token && s.expiresAt > Date.now() ? s : null;
    } catch {
        return null;
    }
}

function write(s) {
    try {
        if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        else localStorage.removeItem(SESSION_KEY);
    } catch {
        /* storage blocked -- session lasts for this page load only */
    }
    listeners.forEach((fn) => fn(s?.user ?? null));
}

export const getToken = () => read()?.token ?? null;
export const getUser = () => read()?.user ?? null;
export const clearSession = () => write(null);

export function onSessionChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Signs in with User ID or email; throws ApiError with the server's reason. */
export async function login(identifier, password) {
    const data = await api.post('/auth/login', { identifier: identifier.trim(), password }, { auth: false });
    // A user with several roles (Admin > Create Users) picks one before entering.
    write({ token: data.token, user: data.user, expiresAt: Date.now() + data.expiresIn * 1000, roleChosen: !(data.user.roles?.length > 1) });
    return data.user;
}

/** Signed in with several roles but none picked yet? */
export const needsRolePick = () => {
    const s = read();
    return !!s && !s.roleChosen && s.user?.roles?.length > 1;
};

/** Works in another of the user's roles: new session, menu + permissions follow. */
export async function switchRole(roleKey) {
    const data = await api.post('/auth/switch-role', { roleKey });
    write({ token: data.token, user: data.user, expiresAt: Date.now() + data.expiresIn * 1000, roleChosen: true });
    return data.user;
}

/** Re-reads the user (role / permissions may have changed in the Admin portal). */
export async function refreshUser() {
    const s = read();
    if (!s) return null;
    const { user } = await api.get('/auth/me');
    write({ ...s, user });
    return user;
}

export async function changePassword(currentPassword, newPassword) {
    await api.post('/auth/change-password', { currentPassword, newPassword });
    const s = read();
    if (s) write({ ...s, user: { ...s.user, mustChangePassword: false } });
}

export function logout() {
    if (getToken()) api.post('/auth/logout').catch(() => {});
    clearSession();
}

/** Role allows `action` (view | edit | create | approve | download) on `module`? */
export const can = (user, module, action = 'view') => !module || !!user?.permissions?.[module]?.[action];
