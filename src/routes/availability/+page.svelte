<script lang="ts">
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import { formatInterval, formatOsloMonth, formatOsloWeekday, osloDayKey } from '#lib/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let months = $derived(groupByMonth(data.slots));

	function groupByMonth(slots: typeof data.slots) {
		const grouped: {
			key: string;
			label: string;
			days: { key: string; label: string; slots: typeof data.slots }[];
		}[] = [];

		for (const slot of slots) {
			const dayKey = osloDayKey(slot.startsAt);
			const monthKey = dayKey.slice(0, 7);
			let month = grouped.at(-1);
			if (!month || month.key !== monthKey) {
				month = { key: monthKey, label: formatOsloMonth(slot.startsAt), days: [] };
				grouped.push(month);
			}
			const day = month.days.at(-1);
			if (day && day.key === dayKey) day.slots.push(slot);
			else month.days.push({ key: dayKey, label: formatOsloWeekday(slot.startsAt), slots: [slot] });
		}

		return grouped;
	}
</script>

<svelte:head>
	<title>Ledige timer – {studio.name}</title>
</svelte:head>

<h1>Ledige timer</h1>
<p class="lead">Velg dato og klokkeslett.</p>

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

{#if months.length === 0}
	<p>Ingen ledige timer{data.label ? ' som passer filteret' : ''}.</p>
{:else}
	{#each months as month (month.key)}
		<section class="month">
			<h2>{month.label}</h2>
			<ul class="schedule">
				{#each month.days as day (day.key)}
					<li class="day-row">
						<h3>{day.label}</h3>
						<ul class="times">
							{#each day.slots as slot (slot.id)}
								<li>
									<a href={resolve('/book/[slotId]', { slotId: slot.id })}>
										<time datetime={slot.startsAt.toISOString()}
											>{formatInterval(slot.startsAt, slot.endsAt)}</time
										>
										{#if slot.label}<span class="muted">{slot.label}</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
{/if}

<style>
	.month h2 {
		margin: 2rem 0 0.35rem;
		font-size: 1.6rem;
	}

	.schedule {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.day-row {
		display: grid;
		grid-template-columns: 9.5rem 1fr;
		gap: 0.35rem 1.25rem;
		align-items: baseline;
		padding: 0.9rem 0;
		border-top: 1px solid var(--line);
	}

	.day-row h3 {
		margin: 0;
		font-size: 1.35rem;
	}

	.times {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem 1.15rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.times a {
		display: flex;
		flex-direction: column;
		color: inherit;
		text-decoration: none;
		font-variant-numeric: tabular-nums;
	}

	.times a:hover time,
	.times a:focus-visible time {
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}

	.times .muted {
		font-size: 0.85rem;
	}

	@media (max-width: 36rem) {
		.day-row {
			grid-template-columns: 1fr;
			gap: 0.15rem;
		}
	}
</style>
