import type { LayoutServerLoad } from './$types';
import { ensureInfoPages, listPublishedPages } from '#lib/server/info';

export const load: LayoutServerLoad = async ({ locals }) => {
	await ensureInfoPages();
	const pages = await listPublishedPages();
	return { admin: locals.admin, pages };
};
