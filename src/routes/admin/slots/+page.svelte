<script lang="ts">
	import { untrack } from 'svelte';
	import { studio } from '#lib/studio';
	import {
		DURATIONS,
		MAX_CLASSES,
		formatClockSpan,
		formatInterval,
		formatOsloDate,
		hasClockOverlap,
		isDateKey,
		isTime,
		nextClock,
		zonedTimeToUtc
	} from '#lib/time';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const counts = Array.from({ length: MAX_CLASSES }, (_, index) => index + 1);
	const statusLabel = { open: 'Ledig', booked: 'Booket', cancelled: 'Avlyst' };

	let date = $state(untrack(() => form?.date ?? ''));
	let duration = $state(untrack(() => form?.duration ?? '60'));
	let starts = $state(
		untrack(() => (form?.starts && form.starts.length > 0 ? [...form.starts] : ['10:00']))
	);
	let overlap = $derived(
		starts.every((start) => isTime(start)) && hasClockOverlap(starts, Number(duration))
	);
	let past = $derived(
		isDateKey(date) &&
			starts.some((start) => isTime(start) && zonedTimeToUtc(date, start).getTime() <= Date.now())
	);

	function setCount(next: number) {
		if (!Number.isInteger(next) || next < 1 || next > MAX_CLASSES || next === starts.length) return;
		if (next < starts.length) {
			starts = starts.slice(0, next);
			return;
		}
		const minutes = Number(duration);
		const added = [...starts];
		while (added.length < next) {
			const previous = added.at(-1);
			const base = previous && isTime(previous) ? previous : '10:00';
			added.push(nextClock(base, Number.isFinite(minutes) ? minutes : 60));
		}
		starts = added;
	}
</script>

<svelte:head>
	<title>Timer – {studio.name}</title>
</svelte:head>

<h1>Timer</h1>
<p class="lead">Velg antall timer, og sett klokkeslettet på hver.</p>
{#if data.notice}
	<p class="notice">{data.notice}</p>
{/if}
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<form method="POST" action="?/create">
	<label class="field">
		<span>Dato</span>
		<input type="date" name="date" required bind:value={date} />
	</label>
	<label class="field">
		<span>Varighet</span>
		<select name="duration" bind:value={duration}>
			{#each DURATIONS as minutes (minutes)}
				<option value={String(minutes)}>{minutes} min</option>
			{/each}
		</select>
	</label>
	<label class="field">
		<span>Antall</span>
		<select
			value={String(starts.length)}
			onchange={(event) => setCount(Number(event.currentTarget.value))}
		>
			{#each counts as hours (hours)}
				<option value={String(hours)}>{hours}</option>
			{/each}
		</select>
	</label>
	<ul class="clock-list">
		{#each starts as _, index (index)}
			<li class="clock-row">
				<label>
					<span>Time {index + 1}</span>
					<input
						type="time"
						name="start"
						required
						lang="nb-NO"
						title="Klokkeslett med 24 timer, for eksempel 13:30"
						bind:value={starts[index]}
					/>
				</label>
				{#if isTime(starts[index])}
					<span class="muted">{formatClockSpan(starts[index], Number(duration))}</span>
				{/if}
			</li>
		{/each}
	</ul>
	{#if overlap}
		<p class="error">To av timene overlapper. Endre klokkeslettet.</p>
	{:else if past}
		<p class="error">Et av tidspunktene har allerede passert.</p>
	{/if}
	<button type="submit" disabled={overlap || past}>
		{starts.length === 1 ? 'Legg ut timen' : `Legg ut ${starts.length} timer`}
	</button>
</form>

<h2>Lagt ut</h2>
{#if data.slots.length === 0}
	<p>Ingen timer fra og med i dag.</p>
{:else}
	<ul class="record-list">
		{#each data.slots as row (row.slot.id)}
			<li class="record">
				<div class="stack">
					<span
						>{formatOsloDate(row.slot.startsAt)} · {formatInterval(
							row.slot.startsAt,
							row.slot.endsAt
						)}</span
					>
					<span class="muted">
						{statusLabel[row.slot.status]}{#if row.slot.label}
							· {row.slot.label}{/if}
					</span>
				</div>
				{#if row.slot.status === 'cancelled' || (row.slot.status !== 'booked' && !row.hasBooking)}
					<form method="POST" action="?/remove">
						<input type="hidden" name="id" value={row.slot.id} />
						<button class="quiet" type="submit">Slett</button>
					</form>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
