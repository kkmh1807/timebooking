<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		admin
	}: {
		admin: boolean;
	} = $props();
</script>

<footer class="site-footer">
	<nav class="footer-nav" aria-label="Bunnmeny">
		{#if admin}
			<a href={resolve('/admin')}>Admin</a>
		{:else}
			<a href={resolve('/login')}>Logg inn</a>
		{/if}
	</nav>
</footer>
