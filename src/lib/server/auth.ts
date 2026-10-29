import { redirect, type Cookies } from '@sveltejs/kit';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { ADMIN_PASSWORD, SESSION_SECRET } from '$app/env/private';

const COOKIE = 'admin_session';
const MAX_AGE = 60 * 60 * 24 * 14;

function sign(payload: string) {
	return createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

function cookieOptions(url: URL, maxAge?: number) {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: url.protocol === 'https:',
		...(maxAge === undefined ? {} : { maxAge })
	};
}

export function isAdmin(cookies: Pick<Cookies, 'get'>) {
	const token = cookies.get(COOKIE);
	if (!token) return false;
	const dot = token.lastIndexOf('.');
	if (dot <= 0) return false;

	const payload = token.slice(0, dot);
	const signature = token.slice(dot + 1);
	const expected = sign(payload);
	const left = Buffer.from(signature);
	const right = Buffer.from(expected);
	if (left.length !== right.length || !timingSafeEqual(left, right)) return false;

	const expiresAt = Number(payload);
	return Number.isFinite(expiresAt) && expiresAt > Date.now() / 1000;
}

export function establishSession(cookies: Cookies, url: URL) {
	const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE;
	const payload = String(expiresAt);
	cookies.set(COOKIE, `${payload}.${sign(payload)}`, cookieOptions(url, MAX_AGE));
}

export function clearSession(cookies: Cookies, url: URL) {
	cookies.delete(COOKIE, cookieOptions(url));
}

export function passwordMatches(input: string) {
	const left = createHash('sha256').update(input).digest();
	const right = createHash('sha256').update(ADMIN_PASSWORD).digest();
	return timingSafeEqual(left, right);
}

export function assertAdmin(admin: boolean, url: URL) {
	if (!admin) {
		const next = encodeURIComponent(url.pathname + url.search);
		redirect(303, `/login?redirectTo=${next}`);
	}
}

export function safeNext(value: string | null) {
	if (!value) return '/admin';
	try {
		const parsed = new URL(value, 'http://local');
		if (parsed.origin !== 'http://local' || !parsed.pathname.startsWith('/')) return '/admin';
		return parsed.pathname + parsed.search;
	} catch {
		return '/admin';
	}
}
