<script lang="ts">
	import { studio } from '#lib/studio';
	import { formatInterval, formatOsloDate } from '#lib/time';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let active = $derived(data.rows.filter((row) => row.booking.status === 'confirmed'));
	let inactive = $derived(data.rows.filter((row) => row.booking.status !== 'confirmed'));

	function bookingStateLabel(bookingStatus: string, slotStatus: string) {
		if (bookingStatus === 'confirmed') return 'Bekreftet';
		if (slotStatus === 'cancelled') return 'Ikke møtt';
		return 'Avbestilt';
	}
</script>

<svelte:head>
	<title>Bookinger – {studio.name}</title>
</svelte:head>

<h1>Bookinger</h1>
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}
{#if data.rows.length === 0}
	<p>Ingen bookinger fra og med i dag.</p>
{:else}
	<h2>Aktive</h2>
	{#if active.length === 0}
		<p>Ingen aktive bookinger.</p>
	{:else}
		{@render records(active)}
	{/if}

	<h2>Inaktive</h2>
	{#if inactive.length === 0}
		<p>Ingen inaktive bookinger.</p>
	{:else}
		{@render records(inactive)}
	{/if}
{/if}

{#snippet records(rows: typeof data.rows)}
	<ul class="record-list">
		{#each rows as row (row.booking.id)}
			<li class="record">
				<div class="stack">
					<span
						>{formatOsloDate(row.slot.startsAt)} · {formatInterval(
							row.slot.startsAt,
							row.slot.endsAt
						)}</span
					>
					<strong>{row.booking.customerName}</strong>
					<span>
						<a href="mailto:{row.booking.customerEmail}">{row.booking.customerEmail}</a>
						·
						<a href="tel:{row.booking.customerPhone}">{row.booking.customerPhone}</a>
					</span>
					{#if row.booking.notes}
						<span>{row.booking.notes}</span>
					{/if}
					{#if row.slot.label}
						<span class="muted">{row.slot.label}</span>
					{/if}
					<span class="muted">{bookingStateLabel(row.booking.status, row.slot.status)}</span>
				</div>
				{#if row.booking.status === 'confirmed'}
					<form method="POST" class="actions">
						<input type="hidden" name="id" value={row.booking.id} />
						<button class="quiet" type="submit" formaction="?/release">Avbestill og frigjør</button>
						<button class="danger" type="submit" formaction="?/noshow">Ikke møtt</button>
					</form>
				{:else}
					<form method="POST" action="?/restore">
						<input type="hidden" name="id" value={row.booking.id} />
						<button class="quiet" type="submit">Angre</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}
