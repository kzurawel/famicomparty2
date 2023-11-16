<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/styles/global.scss';
</script>

<Header />

<article class="wrapper">
	<slot />
</article>

<Footer />
