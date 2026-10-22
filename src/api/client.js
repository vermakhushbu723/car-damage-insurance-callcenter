import { getToken, clearSession } from '../auth/session.js';

// Same-origin by default: Vite (dev/preview) and nginx (production) proxy
// /api to callcenter-service (ai-damage-assessment-service/panel-backends).
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

/** Error thrown for any non-2xx response; `.message` is the server's readable reason. */
export class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

function onUnauthorized(token) {
    if (!token) return;
    clearSession();
    if (!window.location.pathname.startsWith('/login')) window.location.replace('/login?expired=1');
}

async function send(method, path, { body, headers = {}, auth = true, raw = false } = {}) {
    const token = auth ? getToken() : null;
    const h = { Accept: 'application/json', ...headers };
    const isFile = body instanceof Blob;
    if (body !== undefined && !isFile && !h['Content-Type']) h['Content-Type'] = 'application/json';
    if (token) h.Authorization = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: h,
            body: body === undefined ? undefined : isFile ? body : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Cannot reach the server. Check your internet connection and try again.');
    }
    if (res.ok && raw) return res;
    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }
    if (!res.ok) {
        if (res.status === 401) onUnauthorized(token);
        const message = data?.detail || (res.status >= 500 ? 'Server error, please try again.' : `Request failed (${res.status}).`);
        throw new ApiError(res.status, message, data);
    }
    return data;
}

export const api = {
    get: (path, opts) => send('GET', path, opts),
    post: (path, body, opts) => send('POST', path, { ...opts, body: body ?? {} }),
    patch: (path, body, opts) => send('PATCH', path, { ...opts, body }),
    put: (path, body, opts) => send('PUT', path, { ...opts, body }),
    del: (path, opts) => send('DELETE', path, opts),
};

/** Saves a response body as a file in the browser. */
async function save(res, fallbackName) {
    const disposition = res.headers.get('Content-Disposition') || '';
    const name = /filename="([^"]+)"/.exec(disposition)?.[1] || fallbackName;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return name;
}

/** GET (or POST with a body) a generated file -- PDF / CSV -- and download it. */
export async function download(path, fallbackName, { method = 'GET', body } = {}) {
    const res = await send(method, path, { body, raw: true, headers: { Accept: '*/*' } });
    return save(res, fallbackName);
}

/** PUT one file as the raw request body (Documents DMS). */
export function uploadFile(path, file) {
    return send('PUT', path, {
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name || 'document') },
    });
}

/** Browser URL of a signed file link returned by the API (/files/...). */
export const fileUrl = (relative) => (relative ? `${API_BASE}${relative}` : null);
