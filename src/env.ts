import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
};

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'libSQL connection string. Use file:local.db locally, Turso in production.'
	},
	ADMIN_PASSWORD: { description: 'Password for the single studio admin.' },
	SESSION_SECRET: { description: 'Secret used to sign the admin session cookie.' },
	RESEND_API_KEY: {
		description: 'Resend API key. Booking email is skipped when this is empty.',
		schema: optional
	},
	EMAIL_FROM: {
		description: 'From address for booking email, for example Studio <time@studio.no>.',
		schema: optional
	},
	ADMIN_EMAIL: {
		description: 'Optional address that receives a copy of each booking.',
		schema: optional
	}
});
