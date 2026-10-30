<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import AdminBar from '#lib/components/AdminBar.svelte';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import { studio } from '#lib/studio';
	import type { LayoutProps } from './$types';
	import './app.css';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{studio.name}</title>
	<meta name="description" content="Book private dansetimer. Se ledige timer og les om studioet." />
</svelte:head>

<a class="skip" href="#innhold">Hopp til innhold</a>
{#if data.admin}
	<AdminBar />
{/if}
<div class="shell">
	<SiteHeader pages={data.pages} />
	<main id="innhold">
		{@render children()}
	</main>
</div>
