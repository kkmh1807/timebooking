<script lang="ts">
	import { untrack } from 'svelte';
	import { studio } from '#lib/studio';
	import { formatOsloDateTime } from '#lib/time';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let published = $state(untrack(() => form?.published ?? data.page.published));
</script>

<svelte:head>
	<title>{data.page.title} – {studio.name}</title>
</svelte:head>

<h1>{data.page.title}</h1>
<p class="muted">Sist endret {formatOsloDateTime(data.page.updatedAt)}</p>
{#if form?.saved}
	<p class="notice">Lagret.</p>
{/if}
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<form method="POST" action="?/save">
	<label class="field">
		<span>Tittel</span>
		<input name="title" required value={form?.title ?? data.page.title} />
		{#if form?.errors?.title}<small>{form.errors.title}</small>{/if}
	</label>
	<label class="field">
		<span>URL-navn</span>
		<input
			name="slug"
			required
			value={form?.slug ?? data.page.slug}
			autocapitalize="none"
			spellcheck="false"
		/>
		{#if form?.errors?.slug}<small>{form.errors.slug}</small>{/if}
	</label>
	<label class="field">
		<span>Tekst</span>
		<textarea name="body" required>{form?.body ?? data.page.body}</textarea>
		<small class="muted">
			{#if data.page.slug === 'om'}
				Første avsnitt er innledningen. En linje som starter med ## blir et punkt med ikon, og
				teksten under er forklaringen.
			{:else}
				Avsnitt skilles med en blank linje. ## for overskrift, - for punktliste.
			{/if}
		</small>
		{#if form?.errors?.body}<small>{form.errors.body}</small>{/if}
	</label>
	<label>
		<input name="published" type="checkbox" bind:checked={published} />
		Publisert
	</label>
	<button type="submit">Lagre</button>
</form>

<form method="POST" action="?/remove" class="actions">
	<button class="danger" type="submit">Slett siden</button>
</form>
