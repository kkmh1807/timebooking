<script lang="ts">
	import { resolve } from '$app/paths';
	import banner from '#lib/assets/banner.jpeg';
	import { studio } from '#lib/studio';
</script>

<svelte:head>
	<title>{studio.name}</title>
</svelte:head>

<section class="hero">
	<img class="photo" src={banner} alt="" />
	<div class="copy">
		<h1><span>Dans med</span><span class="name">Jenny</span></h1>
		<p class="eyebrow">Teknikk · Musikalitet · Danseglede</p>
		<p>Privat danseundervisning tilpasset ditt nivå, dine mål og din stil.</p>
		<a class="button" href={resolve('/availability')}>Book en privatime →</a>
		<ul class="points">
			<li>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<rect x="4" y="5.5" width="16" height="14" rx="1.2" />
					<path d="M4 9.5h16M8 3.8v3.2M16 3.8v3.2" />
				</svg>
				Fleksible tidspunkter
			</li>
			<li>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="12" cy="12" r="7.5" />
					<path d="M12 8.2V12l2.8 1.8" />
				</svg>
				60 min
			</li>
			<li>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="12" cy="8" r="2.7" />
					<path d="M6.8 19c.7-2.8 2.6-4.2 5.2-4.2s4.5 1.4 5.2 4.2" />
				</svg>
				Tilpasset ditt nivå
			</li>
		</ul>
	</div>
</section>

<style>
	.hero {
		position: relative;
		margin: 0 -1.15rem;
		min-height: 38rem;
		color: #f6f1e8;
		overflow: hidden;
	}

	.photo {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 58% center;
	}

	.copy {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-height: 38rem;
		padding: 2.4rem 1.35rem 1.2rem;
		background:
			linear-gradient(180deg, rgba(28, 16, 10, 0.15) 0%, rgba(28, 16, 10, 0) 28%, rgba(28, 16, 10, 0.45) 100%),
			linear-gradient(90deg, rgba(28, 16, 10, 0.62) 0%, rgba(28, 16, 10, 0.28) 48%, rgba(28, 16, 10, 0.05) 78%);
	}

	h1 {
		margin: 0;
		color: #f6f1e8;
		font-size: clamp(3.1rem, 14vw, 4.2rem);
		line-height: 0.86;
		letter-spacing: 0.01em;
		text-shadow: 0 1px 16px rgba(20, 10, 6, 0.35);
		text-transform: uppercase;
	}

	h1 span {
		display: block;
	}

	.name {
		font-style: italic;
		font-size: 1.12em;
	}

	.eyebrow {
		margin: 1rem 0 0.85rem;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.copy > p:not(.eyebrow) {
		max-width: 16rem;
		margin: 0 0 1.4rem;
		font-size: 1.05rem;
	}

	.hero :global(.button) {
		align-self: flex-start;
		background: #f7f3ee;
		color: #3a302b;
		border-color: #f7f3ee;
	}

	.points {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		margin: auto 0 0;
		padding: 1.6rem 0 0;
		list-style: none;
	}

	.points li {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		padding: 0 0.35rem;
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		line-height: 1.25;
		text-align: center;
		text-transform: uppercase;
	}

	.points li + li {
		border-left: 1px solid rgba(246, 241, 232, 0.55);
	}

	svg {
		width: 1.7rem;
		height: 1.7rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
