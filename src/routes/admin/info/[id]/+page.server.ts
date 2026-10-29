import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertAdmin } from '#lib/server/auth';
import { pageInput } from '#lib/server/form';
import { deletePage, getPage, updatePage } from '#lib/server/info';

export const load: PageServerLoad = async ({ params }) => {
	const page = await getPage(params.id);
	if (!page) error(404, 'Fant ikke siden.');
	return { page };
};

export const actions = {
	save: async ({ request, params, locals, url }) => {
		assertAdmin(locals.admin, url);
		const input = pageInput(await request.formData());
		if (Object.keys(input.errors).length > 0) return fail(400, input);
		const result = await updatePage(params.id, input);
		if (!result.ok) return fail(400, { ...input, message: result.message });
		return { saved: true, message: '' };
	},
	remove: async ({ params, locals, url }) => {
		assertAdmin(locals.admin, url);
		await deletePage(params.id);
		redirect(303, '/admin/info');
	}
} satisfies Actions;
