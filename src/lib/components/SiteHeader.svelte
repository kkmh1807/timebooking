<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { studio } from '#lib/studio';

	let { pages }: { pages: { slug: string; title: string }[] } = $props();
	let pathname = $derived(page.url.pathname);
</script>

<header class="site-header">
	<a class="wordmark" href={resolve('/')}>
		<span class="wordmark-name">{studio.name}</span>
		<span class="wordmark-kicker">{studio.kicker}</span>
	</a>
	<nav class="nav" aria-label="Hovedmeny">
		<a href={resolve('/')} aria-current={pathname === '/' ? 'page' : undefined}>Hjem</a>
		<a
			href={resolve('/availability')}
			aria-current={pathname.startsWith('/availability') ? 'page' : undefined}>Ledige timer</a
		>
		{#each pages as infoPage (infoPage.slug)}
			<a
				href={resolve('/info/[slug]', { slug: infoPage.slug })}
				aria-current={pathname === `/info/${infoPage.slug}` ? 'page' : undefined}
				>{infoPage.title}</a
			>
		{/each}
		<a href={resolve('/admin')} aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
			>Admin</a
		>
	</nav>
</header>
