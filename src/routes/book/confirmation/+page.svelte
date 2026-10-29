<script lang="ts">
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import { formatDuration, formatInterval, formatOsloDate } from '#lib/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Timen er booket – {studio.name}</title>
</svelte:head>

<h1>Timen er booket</h1>
<p class="lead">
	{formatOsloDate(data.slot.startsAt)} kl. {formatInterval(data.slot.startsAt, data.slot.endsAt)}
	<span class="muted">· {formatDuration(data.slot.startsAt, data.slot.endsAt)}</span>
</p>
{#if data.slot.label}
	<p>{data.slot.label}</p>
{/if}
{#if data.emailSent === true}
	<p>En bekreftelse er sendt til {data.booking.customerEmail}.</p>
{:else if data.emailSent === false}
	<p>Ta direkte kontakt med Jenny for å avbestille</p>
{/if}
<dl class="stack">
	<div>
		<dt class="muted">Navn</dt>
		<dd>{data.booking.customerName}</dd>
	</div>
	<div>
		<dt class="muted">E-post</dt>
		<dd>{data.booking.customerEmail}</dd>
	</div>
	<div>
		<dt class="muted">Telefon</dt>
		<dd>{data.booking.customerPhone}</dd>
	</div>
	{#if data.booking.notes}
		<div>
			<dt class="muted">Merknad</dt>
			<dd>{data.booking.notes}</dd>
		</div>
	{/if}
</dl>
<p><a href={resolve('/availability')}>Se flere ledige timer</a></p>

<style>
	dd {
		margin: 0 0 0.8rem;
	}
</style>
