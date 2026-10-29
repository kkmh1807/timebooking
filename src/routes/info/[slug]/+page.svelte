<script lang="ts">
	import Prose from '#lib/components/Prose.svelte';
	import { studio } from '#lib/studio';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.title} – {studio.name}</title>
</svelte:head>

<h1>{data.title}</h1>
<Prose html={data.html} />
