<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { studio } from '#lib/studio';

	let { pages }: { pages: { slug: string; title: string }[] } = $props();
	let pathname = $derived(page.url.pathname);
	let teaching = $derived(pages.find((infoPage) => infoPage.slug === 'om') ?? pages[0]);
</script>

<header class="site-header">
	<div class="brand-bar">
		<a class="wordmark" href={resolve('/')}>{studio.name}</a>
	</div>
	<nav class="nav" aria-label="Hovedmeny">
		<a href={resolve('/')} aria-current={pathname === '/' ? 'page' : undefined}>Hjem</a>
		{#if teaching}
			<a
				href={resolve('/info/[slug]', { slug: teaching.slug })}
				aria-current={pathname.startsWith('/info') ? 'page' : undefined}>Undervisning</a
			>
		{/if}
		<a
			href={resolve('/availability')}
			aria-current={pathname.startsWith('/availability') || pathname.startsWith('/book')
				? 'page'
				: undefined}>Booking</a
		>
	</nav>
</header>
