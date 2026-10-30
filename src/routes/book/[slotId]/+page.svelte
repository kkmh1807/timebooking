<script lang="ts">
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import { formatDuration, formatInterval, formatOsloDate, formatPrice } from '#lib/time';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Book time – {studio.name}</title>
</svelte:head>

<h1>Book time</h1>
<p class="lead">
	{formatOsloDate(data.slot.startsAt)} kl. {formatInterval(data.slot.startsAt, data.slot.endsAt)}
	<span class="muted">· {formatDuration(data.slot.startsAt, data.slot.endsAt)}</span>
	{#if data.slot.priceKr != null}
		<span class="muted">· {formatPrice(data.slot.priceKr)}</span>
	{/if}
</p>
{#if data.slot.label}
	<p>{data.slot.label}</p>
{/if}

{#if !data.bookable}
	<p>Denne timen er ikke ledig.</p>
	<p><a href={resolve('/availability')}>Se ledige timer</a></p>
{:else}
	{#if form?.message}
		<p class="error">{form.message}</p>
	{/if}
	<form method="POST">
		<label class="field">
			<span>Navn</span>
			<input
				name="name"
				autocomplete="name"
				required
				value={form?.name ?? ''}
				aria-invalid={form?.errors?.name ? 'true' : undefined}
				aria-describedby={form?.errors?.name ? 'name-error' : undefined}
			/>
			{#if form?.errors?.name}<small id="name-error">{form.errors.name}</small>{/if}
		</label>
		<label class="field">
			<span>E-post</span>
			<input
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
				aria-invalid={form?.errors?.email ? 'true' : undefined}
				aria-describedby={form?.errors?.email ? 'email-error' : undefined}
			/>
			{#if form?.errors?.email}<small id="email-error">{form.errors.email}</small>{/if}
		</label>
		<label class="field">
			<span>Telefon</span>
			<input
				name="phone"
				type="tel"
				autocomplete="tel"
				required
				value={form?.phone ?? ''}
				aria-invalid={form?.errors?.phone ? 'true' : undefined}
				aria-describedby={form?.errors?.phone ? 'phone-error' : undefined}
			/>
			{#if form?.errors?.phone}<small id="phone-error">{form.errors.phone}</small>{/if}
		</label>
		<label class="field">
			<span>Merknad (valgfritt)</span>
			<textarea
				name="notes"
				rows="4"
				placeholder="Stil, erfaring, eller noe vi bør vite"
				aria-invalid={form?.errors?.notes ? 'true' : undefined}
				aria-describedby={form?.errors?.notes ? 'notes-error' : undefined}
				>{form?.notes ?? ''}</textarea
			>
			{#if form?.errors?.notes}<small id="notes-error">{form.errors.notes}</small>{/if}
		</label>
		<button type="submit">Book timen</button>
	</form>
{/if}
