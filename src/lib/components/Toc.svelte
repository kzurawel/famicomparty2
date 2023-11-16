<script>
	import { onMount } from 'svelte';
	export let headings;
	onMount(() => {
		if (typeof document == 'undefined') return;
		headings = [...document.querySelectorAll('h2')];
	});
</script>

{#if headings && headings.length > 0}
	<p class="toc">Table of contents:</p>
	<ul class="toc">
		{#each headings as heading}
			<li><a href="#{heading.id}">{heading.textContent}</a></li>
		{/each}
	</ul>
{/if}

<style>
	p.toc {
		margin-bottom: 0.1rem;
	}
	ul.toc {
		margin-top: 0.1rem;
		padding-left: 3rem;
	}
</style>
