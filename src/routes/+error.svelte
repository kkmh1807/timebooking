<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { studio } from '#lib/studio';
	import './app.css';

	let title = $derived(page.status === 404 ? 'Siden finnes ikke' : 'Noe gikk galt');
	let message = $derived(
		page.status === 404
			? 'Vi finner ikke siden du leter etter.'
			: (page.error?.message ?? 'Prøv igjen om litt.')
	);
</script>

<svelte:head>
	<title>{title} – {studio.name}</title>
</svelte:head>

<h1>{title}</h1>
<p>{message}</p>
<p><a href={resolve('/')}>Til forsiden</a></p>
