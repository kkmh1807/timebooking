import type { Handle } from '@sveltejs/kit/hooks';
import { assertAdmin, isAdmin } from '#lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.admin = isAdmin(event.cookies);
	const path = event.url.pathname;
	if (path === '/admin' || path.startsWith('/admin/')) assertAdmin(event.locals.admin, event.url);
	return resolve(event);
};
