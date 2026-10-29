import type { LayoutServerLoad } from './$types';
import { assertAdmin } from '#lib/server/auth';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	assertAdmin(locals.admin, url);
	return {};
};
