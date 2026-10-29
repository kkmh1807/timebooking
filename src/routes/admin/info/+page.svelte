<script lang="ts">
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import { studio } from '#lib/studio';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let published = $state(untrack(() => form?.published ?? false));
</script>

<svelte:head>
	<title>Informasjon – {studio.name}</title>
</svelte:head>

<h1>Rediger informasjon</h1>
{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

{#if data.pages.length === 0}
	<p>Ingen sider ennå.</p>
{:else}
	<ul class="page-list">
		{#each data.pages as infoPage (infoPage.id)}
			<li class="page-row">
				<a href={resolve('/admin/info/[id]', { id: infoPage.id })}>{infoPage.title}</a>
				<span class="muted">{infoPage.published ? 'Publisert' : 'Utkast'}</span>
			</li>
		{/each}
	</ul>
{/if}

<h2>Ny side</h2>
<form method="POST" action="?/create">
	<label class="field">
		<span>Tittel</span>
		<input name="title" required value={form?.title ?? ''} />
		{#if form?.errors?.title}<small>{form.errors.title}</small>{/if}
	</label>
	<label class="field">
		<span>URL-navn</span>
		<input name="slug" required value={form?.slug ?? ''} autocapitalize="none" spellcheck="false" />
		{#if form?.errors?.slug}<small>{form.errors.slug}</small>{/if}
	</label>
	<label class="field">
		<span>Tekst</span>
		<textarea name="body" required>{form?.body ?? ''}</textarea>
		<small class="muted"
			>Avsnitt skilles med en blank linje. ## for overskrift, - for punktliste.</small
		>
		{#if form?.errors?.body}<small>{form.errors.body}</small>{/if}
	</label>
	<label>
		<input name="published" type="checkbox" bind:checked={published} />
		Publisert
	</label>
	<button type="submit">Opprett side</button>
</form>
