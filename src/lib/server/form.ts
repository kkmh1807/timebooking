export function field(data: FormData, name: string) {
	const value = data.get(name);
	return typeof value === 'string' ? value.trim() : '';
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function pageInput(data: FormData) {
	const slug = field(data, 'slug').toLowerCase();
	const title = field(data, 'title');
	const body = field(data, 'body');
	const published = data.get('published') === 'on';
	const errors: Record<string, string> = {};

	if (!slugPattern.test(slug) || slug.length > 80) {
		errors.slug = 'Bruk små bokstaver, tall og bindestrek.';
	}
	if (!title || title.length > 120) errors.title = 'Skriv en tittel på maks 120 tegn.';
	if (!body || body.length > 20_000) errors.body = 'Skriv en tekst, maks 20 000 tegn.';

	return { slug, title, body, published, errors, message: '' };
}

export function customerInput(data: FormData) {
	const name = field(data, 'name');
	const email = field(data, 'email');
	const phone = field(data, 'phone');
	const notes = field(data, 'notes');
	const errors: Record<string, string> = {};

	if (!name || name.length > 120) errors.name = 'Skriv inn navnet ditt.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
		errors.email = 'Skriv inn en gyldig e-postadresse.';
	}
	const digits = phone.replace(/\D/g, '');
	if (digits.length < 8 || digits.length > 15 || phone.length > 30) {
		errors.phone = 'Skriv inn et telefonnummer.';
	}
	if (notes.length > 2000) errors.notes = 'Merknaden er for lang.';

	return {
		name,
		email,
		phone,
		notes: notes || null,
		errors,
		message: ''
	};
}
