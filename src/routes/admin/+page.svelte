<script lang="ts">
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import { formatInterval, formatOsloDate } from '#lib/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Oversikt – {studio.name}</title>
</svelte:head>

<h1>Oversikt</h1>
<p class="lead">
	{data.openSlots === 1 ? '1 ledig time' : `${data.openSlots} ledige timer`} fremover.
</p>
<p><a href={resolve('/admin/slots')}>Legg ut timer</a></p>

<h2>I dag</h2>
{#if data.today.length === 0}
	<p>Ingen bookinger i dag.</p>
{:else}
	<ul class="record-list">
		{#each data.today as row (row.booking.id)}
			<li class="record">
				<div class="stack">
					<span>{formatInterval(row.slot.startsAt, row.slot.endsAt)}</span>
					<span>{row.booking.customerName}</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<h2>Senere</h2>
{#if data.later.length === 0}
	<p>Ingen bookinger etter i dag.</p>
{:else}
	<ul class="record-list">
		{#each data.later as row (row.booking.id)}
			<li class="record">
				<div class="stack">
					<span
						>{formatOsloDate(row.slot.startsAt)} · {formatInterval(
							row.slot.startsAt,
							row.slot.endsAt
						)}</span
					>
					<span>{row.booking.customerName}</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}
<p><a href={resolve('/admin/bookings')}>Se alle bookinger</a></p>
