import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { clearSession, establishSession, passwordMatches, safeNext } from '#lib/server/auth';
import { field } from '#lib/server/form';

export const actions = {
	login: async ({ request, cookies, url, locals }) => {
		const password = field(await request.formData(), 'password');
		if (!password) return fail(400, { message: 'Skriv inn passord.' });
		if (!passwordMatches(password)) return fail(400, { message: 'Feil passord.' });
		establishSession(cookies, url);
		locals.admin = true;
		redirect(303, safeNext(url.searchParams.get('redirectTo')));
	},
	logout: async ({ cookies, url, locals }) => {
		clearSession(cookies, url);
		locals.admin = false;
		redirect(303, '/');
	}
} satisfies Actions;
