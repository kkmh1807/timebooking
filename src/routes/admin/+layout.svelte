<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let pathname = $derived(page.url.pathname);

	const links = [
		{ href: '/admin', label: 'Oversikt' },
		{ href: '/admin/slots', label: 'Timer' },
		{ href: '/admin/bookings', label: 'Bookinger' },
		{ href: '/admin/info', label: 'Rediger informasjon' }
	] as const;
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<nav class="subnav" aria-label="Admin">
	{#each links as link (link.href)}
		<a
			href={resolve(link.href)}
			aria-current={pathname === link.href ||
			(link.href !== '/admin' && pathname.startsWith(link.href))
				? 'page'
				: undefined}
		>
			{link.label}
		</a>
	{/each}
	{#if data.admin}
		<form method="POST" action="/login?/logout">
			<button class="linkish" type="submit">Logg ut</button>
		</form>
	{/if}
</nav>
{@render children()}
