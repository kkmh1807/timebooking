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

const colors = {
	bg: '#f6f1e8',
	paper: '#fbf8f3',
	hero: '#4a1824',
	ink: '#3d2428',
	muted: '#7a655f',
	line: '#e3d8cc',
	accentInk: '#f8f3ee'
} as const;

export async function sendBookingEmails(booking: BookingMail) {
	const apiKey = RESEND_API_KEY;
	const from = EMAIL_FROM;
	if (!apiKey || !from) return false;

	const date = formatOsloDate(booking.startsAt);
	const interval = formatInterval(booking.startsAt, booking.endsAt);
	const when = `${date} kl. ${interval}`;

	const customerLines = [
		`Hei ${booking.customerName},`,
		'',
		`Timen din hos Jenny er booket:`,
		when
	];
	if (booking.label) customerLines.push(`Stil / instruktør: ${booking.label}`);
	customerLines.push(
		'',
		studio.kicker,
		'Trenger du å avbestille, tar du kontakt med Jenny.',
		'',
		'Vennlig hilsen',
		'Jenny Smestad'
	);

	const customerBody = [
		`<p style="margin:0 0 1rem;font-size:16px;line-height:1.55;color:${colors.ink};">Hei ${escapeHtml(booking.customerName)},</p>`,
		`<p style="margin:0 0 1.25rem;font-size:16px;line-height:1.55;color:${colors.ink};">Timen din hos Jenny er booket:</p>`,
		whenBlock(date, interval, booking.label),
		`<p style="margin:1.25rem 0 0;font-size:14px;line-height:1.5;color:${colors.muted};">${escapeHtml(studio.kicker)}</p>`,
		`<p style="margin:0.5rem 0 0;font-size:14px;line-height:1.5;color:${colors.muted};">Trenger du å avbestille, tar du kontakt med studioet.</p>`,
		`<p style="margin:1.5rem 0 0;font-size:16px;line-height:1.55;color:${colors.ink};">Vennlig hilsen<br />Jenny Smestad</p>`
	].join('');

	const customerSent = await sendEmail(
		apiKey,
		from,
		booking.customerEmail,
		`Time booket ${date}`,
		customerLines.join('\n'),
		wrapEmail(customerBody)
	);

	if (ADMIN_EMAIL) {
		const adminLines = [
			`Noen har booket en dansetime hos deg! En bekreftelse er sendt til deltakeren.`,
			'',
			when
		];
		if (booking.label) adminLines.push(`Stil / instruktør: ${booking.label}`);
		adminLines.push(
			`Navn: ${booking.customerName}`,
			`E-post: ${booking.customerEmail}`,
			`Telefon: ${booking.customerPhone}`
		);
		if (booking.notes) adminLines.push(`Merknad: ${booking.notes}`);

		const contactRows = [
			detailRow('Navn', booking.customerName),
			detailRow('E-post', booking.customerEmail),
			detailRow('Telefon', booking.customerPhone)
		];
		if (booking.notes) contactRows.push(detailRow('Merknad', booking.notes));

		const adminBody = [
			`<p style="margin:0 0 1.25rem;font-size:16px;line-height:1.55;color:${colors.ink};">Noen har booket en dansetime hos deg! En bekreftelse er sendt til deltakeren.</p>`,
			whenBlock(date, interval, booking.label),
			`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:1.25rem 0 0;border-top:1px solid ${colors.line};">`,
			...contactRows,
			`</table>`
		].join('');

		await sendEmail(
			apiKey,
			from,
			ADMIN_EMAIL,
			`Noen har booket en dansetime! ${when}`,
			adminLines.join('\n'),
			wrapEmail(adminBody)
		);
	}

	return customerSent;
}

function whenBlock(date: string, interval: string, label: string | null) {
	const labelHtml = label
		? `<p style="margin:0.65rem 0 0;font-size:14px;line-height:1.45;color:${colors.muted};">Stil / instruktør: ${escapeHtml(label)}</p>`
		: '';
	return [
		`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.bg};border:1px solid ${colors.line};">`,
		`<tr><td style="padding:1.1rem 1.15rem;">`,
		`<p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${colors.muted};">Tidspunkt</p>`,
		`<p style="margin:0.4rem 0 0;font-size:22px;line-height:1.2;color:${colors.hero};font-family:Georgia,'Times New Roman',serif;">${escapeHtml(date)}</p>`,
		`<p style="margin:0.25rem 0 0;font-size:18px;line-height:1.3;color:${colors.ink};">kl. ${escapeHtml(interval)}</p>`,
		labelHtml,
		`</td></tr></table>`
	].join('');
}

function detailRow(label: string, value: string) {
	return [
		`<tr>`,
		`<td style="padding:0.85rem 0 0;font-size:13px;line-height:1.4;color:${colors.muted};width:6.5rem;vertical-align:top;">${escapeHtml(label)}</td>`,
		`<td style="padding:0.85rem 0 0;font-size:15px;line-height:1.45;color:${colors.ink};vertical-align:top;">${escapeHtml(value)}</td>`,
		`</tr>`
	].join('');
}

function wrapEmail(body: string) {
	return `<!DOCTYPE html>
<html lang="nb">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${colors.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.bg};">
<tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${colors.paper};border:1px solid ${colors.line};">
<tr><td style="padding:1.35rem 1.4rem;background:${colors.hero};">
<p style="margin:0;font-size:22px;line-height:1.15;color:${colors.accentInk};font-family:Georgia,'Times New Roman',serif;">${escapeHtml(studio.name)}</p>
<p style="margin:0.45rem 0 0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${colors.accentInk};opacity:0.82;">${escapeHtml(studio.kicker)}</p>
</td></tr>
<tr><td style="padding:1.5rem 1.4rem 1.6rem;font-family:Georgia,'Times New Roman',serif;color:${colors.ink};">
${body}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

async function sendEmail(
	apiKey: string,
	from: string,
	to: string,
	subject: string,
	text: string,
	html: string
) {
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
				text,
				html
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
