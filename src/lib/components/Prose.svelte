<script lang="ts">
	let { html }: { html: string } = $props();
</script>

<div class="prose">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown is escaped before any tags are added -->
	{@html html}
</div>
