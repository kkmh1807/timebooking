import { ADMIN_EMAIL, EMAIL_FROM, RESEND_API_KEY } from '$app/env/private';
import { studio } from '#lib/studio';
import { formatInterval, formatOsloDate } from '#lib/time';

type BookingMail = {
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	notes: string | null;
	startsAt: Date;
	endsAt: Date;
	label: string | null;
};

export async function sendBookingEmails(booking: BookingMail) {
	const apiKey = RESEND_API_KEY;
	const from = EMAIL_FROM;
	if (!apiKey || !from) return false;

	const when = `${formatOsloDate(booking.startsAt)} kl. ${formatInterval(booking.startsAt, booking.endsAt)}`;
	const customerLines = [
		`Hei ${booking.customerName},`,
		'',
		`Timen din hos ${studio.name} er booket:`,
		when
	];
	if (booking.label) customerLines.push(`Stil / instruktør: ${booking.label}`);
	customerLines.push(
		'',
		studio.paymentNote,
		'Trenger du å avbestille, tar du kontakt med studioet.',
		'',
		'Vennlig hilsen',
		studio.name
	);

	const customerSent = await sendEmail(
		apiKey,
		from,
		booking.customerEmail,
		`Time booket ${formatOsloDate(booking.startsAt)}`,
		customerLines.join('\n')
	);

	if (ADMIN_EMAIL) {
		const adminLines = [`Ny booking hos ${studio.name}.`, '', when];
		if (booking.label) adminLines.push(`Stil / instruktør: ${booking.label}`);
		adminLines.push(
			`Navn: ${booking.customerName}`,
			`E-post: ${booking.customerEmail}`,
			`Telefon: ${booking.customerPhone}`
		);
		if (booking.notes) adminLines.push(`Merknad: ${booking.notes}`);
		await sendEmail(apiKey, from, ADMIN_EMAIL, `Ny booking ${when}`, adminLines.join('\n'));
	}

	return customerSent;
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, text: string) {
	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: [to],
				subject,
				text
			}),
			signal: AbortSignal.timeout(8000)
		});
		if (!response.ok) console.error('Booking email failed', response.status);
		return response.ok;
	} catch (error) {
		console.error('Booking email failed', error);
		return false;
	}
}
