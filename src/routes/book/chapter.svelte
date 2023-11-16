<script>
	export let title;
	export let prev;
	export let next;

	import Toc from '$lib/components/Toc.svelte';
</script>

<svelte:head>
	<title>Famicom Party | {title}</title>
</svelte:head>

<h1>{title}</h1>

<p class="chapter-links">
	{#if prev}
		<a href="/book/{prev.url}">&laquo; {prev.title}</a>
	{/if}
	{#if next}
		<a href="/book/{next.url}">{next.title} &raquo;</a>
	{/if}
</p>

<Toc />

<slot />

<p class="chapter-links">
	{#if prev}
		<a href="/book/{prev.url}">&laquo; {prev.title}</a>
	{/if}
	{#if next}
		<a href="/book/{next.url}">{next.title} &raquo;</a>
	{/if}
</p>
