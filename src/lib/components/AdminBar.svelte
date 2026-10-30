<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let pathname = $derived(page.url.pathname);
	let openFor = $state<string | null>(null);
	let menuOpen = $derived(openFor === pathname);

	const adminLinks = [
		{ href: '/admin', label: 'Oversikt' },
		{ href: '/admin/slots', label: 'Timer' },
		{ href: '/admin/bookings', label: 'Bookinger' },
		{ href: '/admin/info', label: 'Rediger informasjon' }
	] as const;

	function toggleMenu() {
		openFor = menuOpen ? null : pathname;
	}

	function closeMenu() {
		openFor = null;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeMenu();
	}

	function adminCurrent(href: string) {
		return pathname === href || (href !== '/admin' && pathname.startsWith(href));
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="admin-banner">
	<p>Du er nå logget inn som admin</p>
	<button
		class={['menu-button', { open: menuOpen }]}
		type="button"
		aria-expanded={menuOpen}
		aria-controls="admin-menu"
		aria-label={menuOpen ? 'Lukk adminmeny' : 'Åpne adminmeny'}
		onclick={toggleMenu}
	>
		<span></span>
		<span></span>
		<span></span>
	</button>
	{#if menuOpen}
		<nav id="admin-menu" class="admin-menu" aria-label="Admin">
			{#each adminLinks as link (link.href)}
				<a
					href={resolve(link.href)}
					aria-current={adminCurrent(link.href) ? 'page' : undefined}
				>
					{link.label}
				</a>
			{/each}
			<form method="POST" action="/login?/logout">
				<button class="logout" type="submit">Logg ut</button>
			</form>
		</nav>
	{/if}
</div>

<style>
	.admin-banner {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 2.6rem;
		margin: 0;
		padding: 0.4rem 3rem;
		background: var(--accent);
		color: var(--accent-ink);
	}

	.admin-banner p {
		margin: 0;
		font-size: 0.85rem;
		text-align: center;
	}

	.menu-button {
		position: absolute;
		top: 50%;
		right: 0.45rem;
		width: 2.4rem;
		height: 2.4rem;
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.28rem;
		padding: 0.5rem;
		background: transparent;
		color: var(--accent-ink);
		border: 0;
		letter-spacing: 0;
		text-transform: none;
		transform: translateY(-50%);
	}

	.menu-button span {
		display: block;
		width: 100%;
		height: 2px;
		background: currentColor;
		transform-origin: center;
	}

	.menu-button.open span:nth-child(1) {
		transform: translateY(0.43rem) rotate(45deg);
	}

	.menu-button.open span:nth-child(2) {
		opacity: 0;
	}

	.menu-button.open span:nth-child(3) {
		transform: translateY(-0.43rem) rotate(-45deg);
	}

	.admin-menu {
		position: absolute;
		top: 100%;
		right: 0.45rem;
		z-index: 3;
		display: flex;
		flex-direction: column;
		min-width: 14rem;
		margin: 0;
		padding: 0.35rem 1rem;
		background: var(--paper);
		border: 1px solid var(--line);
	}

	.admin-menu a,
	.admin-menu .logout {
		justify-content: flex-start;
		padding: 0.7rem 0;
		background: transparent;
		color: var(--ink);
		border: 0;
		border-radius: 0;
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-align: left;
		text-decoration: none;
		text-transform: uppercase;
	}

	.admin-menu a[aria-current='page'] {
		color: var(--accent);
	}
</style>
