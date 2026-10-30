<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import {
		formatDuration,
		formatInterval,
		formatOsloDate,
		formatPrice,
		osloDayKey,
		zonedTimeToUtc
	} from '#lib/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const weekdays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

	function initialDay() {
		const slot = data.slots[0];
		return slot ? osloDayKey(slot.startsAt) : osloDayKey(new Date());
	}

	let selectedKey = $state(untrack(initialDay));
	let monthKey = $state(untrack(() => initialDay().slice(0, 7)));

	let openDays = $derived(new Set(data.slots.map((slot) => osloDayKey(slot.startsAt))));
	let selectedSlots = $derived(
		data.slots.filter((slot) => osloDayKey(slot.startsAt) === selectedKey)
	);
	let cells = $derived(monthCells(monthKey));
	let monthLabel = $derived(
		new Intl.DateTimeFormat('nb-NO', {
			timeZone: studio.timezone,
			month: 'long',
			year: 'numeric'
		}).format(zonedTimeToUtc(`${monthKey}-01`, '12:00'))
	);

	function weekdayMonday(dayKey: string) {
		const label = new Intl.DateTimeFormat('en-GB', {
			timeZone: studio.timezone,
			weekday: 'short'
		}).format(zonedTimeToUtc(dayKey, '12:00'));
		const index = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(label);
		return index === -1 ? 0 : index;
	}

	function monthCells(key: string) {
		const [year, month] = key.split('-').map(Number);
		const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
		const cells: Array<string | null> = Array.from(
			{ length: weekdayMonday(`${key}-01`) },
			() => null
		);
		for (let day = 1; day <= count; day += 1) {
			cells.push(`${key}-${String(day).padStart(2, '0')}`);
		}
		return cells;
	}

	function shiftMonth(delta: number) {
		const [year, month] = monthKey.split('-').map(Number);
		const next = new Date(Date.UTC(year, month - 1 + delta, 1));
		const key = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
		monthKey = key;
		const available = data.slots.find((slot) => osloDayKey(slot.startsAt).startsWith(key));
		if (available) selectedKey = osloDayKey(available.startsAt);
	}

	function chooseDay(dayKey: string) {
		selectedKey = dayKey;
	}
</script>

<svelte:head>
	<title>Booking – {studio.name}</title>
</svelte:head>

<h1>Velg din dansetime</h1>
<p class="lead">
	Finn et tidspunkt som passer deg. Alle timer er private, én til én eller i liten gruppe.
</p>

{#if data.labels.length > 0}
	<form method="GET" class="actions">
		<label class="field">
			<span>Stil eller instruktør</span>
			<select name="label">
				<option value="">Alle</option>
				{#each data.labels as label (label)}
					<option value={label} selected={label === data.label}>{label}</option>
				{/each}
			</select>
		</label>
		<button class="quiet" type="submit">Filtrer</button>
	</form>
{/if}

<div class="calendar">
		<div class="month-bar">
			<button class="quiet" type="button" onclick={() => shiftMonth(-1)} aria-label="Forrige måned"
				>‹</button
			>
			<p>{monthLabel}</p>
			<button class="quiet" type="button" onclick={() => shiftMonth(1)} aria-label="Neste måned"
				>›</button
			>
		</div>
		<div class="weekdays" aria-hidden="true">
			{#each weekdays as day (day)}<span>{day}</span>{/each}
		</div>
		<div class="days" role="grid" aria-label={monthLabel}>
			{#each cells as cell, index (cell ?? `empty-${index}`)}
				{#if cell}
					<button
						type="button"
						class={{ selected: cell === selectedKey, open: openDays.has(cell) }}
						aria-current={cell === selectedKey ? 'date' : undefined}
						aria-label={formatOsloDate(zonedTimeToUtc(cell, '12:00'))}
						onclick={() => chooseDay(cell)}>{Number(cell.slice(-2))}</button
					>
				{:else}
					<span class="empty"></span>
				{/if}
			{/each}
		</div>
	</div>

	{#if selectedSlots.length > 0}
		<h2>{formatOsloDate(zonedTimeToUtc(selectedKey, '12:00'))}</h2>
		<ul class="slot-list">
			{#each selectedSlots as slot (slot.id)}
				<li class="slot">
					<div class="stack">
						<time datetime={slot.startsAt.toISOString()}
							>{formatInterval(slot.startsAt, slot.endsAt)}</time
						>
						<span class="muted">
							{formatDuration(slot.startsAt, slot.endsAt)}{#if slot.label}
								· {slot.label}{/if}
						</span>
						{#if slot.priceKr != null}
							<span class="price">{formatPrice(slot.priceKr)}</span>
						{/if}
					</div>
					<a class="button" href={resolve('/book/[slotId]', { slotId: slot.id })}>Book</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Ingen ledige timer på valgt dag</p>
	{/if}

	<p class="note">Avbestilling gjøres av studioet. Ta kontakt hvis du ikke kan komme.</p>

<style>
	.calendar {
		margin-top: 0.5rem;
	}

	.month-bar {
		display: grid;
		grid-template-columns: 2.5rem 1fr 2.5rem;
		align-items: center;
	}

	.month-bar p {
		margin: 0;
		color: var(--accent);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-align: center;
		text-transform: uppercase;
	}

	.month-bar button {
		padding: 0.4rem;
		background: transparent;
		color: var(--accent);
		border: 0;
		font-size: 1.4rem;
		letter-spacing: 0;
	}

	.weekdays,
	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.weekdays span {
		padding: 0.85rem 0 0.4rem;
		color: var(--muted);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
	}

	.days button,
	.days span {
		display: grid;
		place-items: center;
		height: 2.4rem;
		margin: 0.15rem auto;
		padding: 0;
		background: transparent;
		color: var(--muted);
		border: 0;
		font-size: 0.95rem;
		letter-spacing: 0;
		text-transform: none;
	}

	.days button {
		position: relative;
		width: 2.4rem;
		color: var(--ink);
		cursor: pointer;
	}

	.days button.open:not(.selected) {
		color: var(--accent);
		font-weight: 600;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.days button.selected {
		background: var(--accent);
		color: var(--accent-ink);
		border-radius: 50%;
	}

	.days span.empty {
		visibility: hidden;
	}

	h2 {
		margin-top: 1.6rem;
		font-size: 1.7rem;
	}

	.price {
		color: var(--accent);
		font-size: 1.05rem;
		white-space: nowrap;
	}

	.note {
		margin-top: 1.5rem;
		color: var(--muted);
		font-size: 0.92rem;
	}
</style>
