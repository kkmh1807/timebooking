<script lang="ts">
	import { studio } from '#lib/studio';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Logg inn – {studio.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Logg inn</h1>
<p class="lead">Skriv inn passord.</p>
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}
<form method="POST" action="?/login">
	<label class="field">
		<span>Passord</span>
		<input name="password" type="password" autocomplete="current-password" required />
	</label>
	<button type="submit">Logg inn</button>
</form>
