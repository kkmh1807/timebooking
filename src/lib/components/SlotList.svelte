<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDuration, formatInterval } from '#lib/time';

	type Slot = {
		id: string;
		startsAt: Date;
		endsAt: Date;
		label: string | null;
	};

	let { slots }: { slots: Slot[] } = $props();
</script>

{#if slots.length > 0}
	<ul class="slot-list">
		{#each slots as slot (slot.id)}
			<li class="slot">
				<div class="stack">
					<time datetime={slot.startsAt.toISOString()}
						>{formatInterval(slot.startsAt, slot.endsAt)}</time
					>
					<span class="muted">
						{formatDuration(slot.startsAt, slot.endsAt)}{#if slot.label}
							· {slot.label}{/if}
					</span>
				</div>
				<a class="button" href={resolve('/book/[slotId]', { slotId: slot.id })}>Book</a>
			</li>
		{/each}
	</ul>
{/if}
