<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Prose from '#lib/components/Prose.svelte';
	import { studio } from '#lib/studio';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let others = $derived(
		data.pages.filter((infoPage) => page.url.pathname !== `/info/${infoPage.slug}`)
	);
</script>

{#snippet mark(index: number)}
	<svg viewBox="0 0 24 24" aria-hidden="true">
		{#if index % 3 === 0}
			<path d="M7 16.5V11M12 16.5V7.5M17 16.5v-4" />
		{:else if index % 3 === 1}
			<path
				d="M12 18.5s-5.2-3.2-5.2-6.8a3 3 0 0 1 5.2-2 3 3 0 0 1 5.2 2c0 3.6-5.2 6.8-5.2 6.8z"
			/>
		{:else}
			<path d="M12 4.2 13.2 9.4 18.4 10.6 13.2 11.8 12 17 10.8 11.8 5.6 10.6 10.8 9.4z" />
		{/if}
	</svg>
{/snippet}

<svelte:head>
	<title>{data.title} – {studio.name}</title>
</svelte:head>

<h1>{data.title}</h1>
{#if data.admin}
	<p class="edit">
		<a href={resolve('/admin/info/[id]', { id: data.id })}>Rediger innhold</a>
	</p>
{/if}

{#if data.teaching}
	<div class="intro">
		{#each data.teaching.intro as paragraph (paragraph)}
			<p>{paragraph}</p>
		{/each}
	</div>
	{#if data.teaching.points.length > 0}
		<ul class="points">
			{#each data.teaching.points as point, index (point.title)}
				<li>
					<span class="icon">{@render mark(index)}</span>
					<div>
						<h2>{point.title}</h2>
						{#each point.text.split('\n\n') as paragraph (paragraph)}
							<p>{paragraph}</p>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{:else}
	<Prose html={data.html} />
{/if}

{#if others.length > 0}
	<nav class="more" aria-label="Mer informasjon">
		{#each others as infoPage (infoPage.slug)}
			<a href={resolve('/info/[slug]', { slug: infoPage.slug })}>{infoPage.title}</a>
		{/each}
	</nav>
{/if}

<style>
	h1 {
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--accent);
	}

	.edit {
		margin: 0.8rem 0 0;
		font-size: 0.85rem;
	}

	.edit a {
		color: var(--accent);
	}

	.intro p {
		margin: 1.15rem 0 0;
	}

	.points {
		display: flex;
		flex-direction: column;
		gap: 1.35rem;
		margin: 1.8rem 0 0;
		padding: 0;
		list-style: none;
	}

	.points li {
		display: grid;
		grid-template-columns: 3.4rem 1fr;
		gap: 0.95rem;
		align-items: start;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 3.4rem;
		height: 3.4rem;
		border-radius: 50%;
		background: #f3e6df;
		color: var(--accent);
	}

	svg {
		width: 1.35rem;
		height: 1.35rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.points h2 {
		margin: 0.15rem 0 0.25rem;
		color: var(--ink);
		font-family: Palatino, 'Palatino Linotype', Georgia, serif;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		line-height: 1.3;
		text-transform: uppercase;
	}

	.points p {
		margin: 0;
	}

	.more {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		margin-top: 2rem;
		padding-top: 1.2rem;
		border-top: 1px solid var(--line);
	}

	.more a {
		color: var(--accent);
		text-decoration: none;
	}
</style>
