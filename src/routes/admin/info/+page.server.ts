import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertAdmin } from '#lib/server/auth';
import { pageInput } from '#lib/server/form';
import { createPage, listAllPages } from '#lib/server/info';

export const load: PageServerLoad = async () => {
	return { pages: await listAllPages() };
};

export const actions = {
	create: async ({ request, locals, url }) => {
		assertAdmin(locals.admin, url);
		const input = pageInput(await request.formData());
		if (Object.keys(input.errors).length > 0) return fail(400, input);
		const result = await createPage(input);
		if (!result.ok) return fail(400, { ...input, message: result.message });
		redirect(303, `/admin/info/${result.page.id}`);
	}
} satisfies Actions;
