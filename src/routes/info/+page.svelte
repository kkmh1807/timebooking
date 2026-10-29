<script lang="ts">
	import { resolve } from '$app/paths';
	import { studio } from '#lib/studio';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Info – {studio.name}</title>
</svelte:head>

<h1>Info</h1>
{#if data.pages.length === 0}
	<p>Ingen informasjon er publisert ennå.</p>
{:else}
	<ul class="page-list">
		{#each data.pages as infoPage (infoPage.slug)}
			<li class="page-row">
				<a href={resolve('/info/[slug]', { slug: infoPage.slug })}>{infoPage.title}</a>
			</li>
		{/each}
	</ul>
{/if}
