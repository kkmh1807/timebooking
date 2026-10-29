<script lang="ts">
	import { resolve } from '$app/paths';
	import SlotList from '#lib/components/SlotList.svelte';
	import { studio } from '#lib/studio';
	import { formatOsloDate, osloDayKey } from '#lib/time';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let groups = $derived(groupByDay(data.slots));

	function groupByDay(slots: typeof data.slots) {
		const grouped: { key: string; label: string; slots: typeof data.slots }[] = [];
		for (const slot of slots) {
			const key = osloDayKey(slot.startsAt);
			const last = grouped.at(-1);
			if (last && last.key === key) last.slots.push(slot);
			else grouped.push({ key, label: formatOsloDate(slot.startsAt), slots: [slot] });
		}
		return grouped;
	}
</script>

<svelte:head>
	<title>{studio.kicker} – {studio.name}</title>
</svelte:head>

<h1>{studio.kicker}</h1>
<p class="lead">
	Finn en ledig time og book den med en gang. Undervisningen er privat, én til én eller i en liten
	gruppe.
</p>
<div class="actions">
	<a class="button" href={resolve('/availability')}>Se ledige timer</a>
</div>

{#if groups.length === 0}
	<h2>Neste ledige</h2>
	<p>Ingen ledige timer er lagt ut ennå.</p>
{:else}
	{#each groups as group (group.key)}
		<section class="day">
			<h2>{group.label}</h2>
			<SlotList slots={group.slots} />
		</section>
	{/each}
{/if}
