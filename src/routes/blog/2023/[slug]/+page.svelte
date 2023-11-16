<script>
	export let data;

	export let options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	};
	export const pubdate = new Date(data.date).toLocaleDateString('en-us', options);

	import calendarIcon from '$lib/icons/lnr-calendar-full.svg';
	import tagIcon from '$lib/icons/lnr-tag.svg';
</script>

<svelte:head>
	<title>Famicom Party | {data.title}</title>
</svelte:head>

<h1>{data.title}</h1>
<p>
	<span class="pubdate"><img src={calendarIcon} alt="" /> {pubdate}</span>
	{#if data.tags && data.tags.length}
		<br />
		<span>
			{#each data.tags as tag}
				<a href="/blog/tag/{tag}" class="tag"><img src={tagIcon} alt="" /> {tag}</a>
			{/each}
		</span>
	{/if}
</p>
<svelte:component this={data.content} />

<style lang="scss">
	h1 {
		margin-bottom: 0;
	}

	h1 + p {
		margin-top: 0.5rem;

		span {
			display: inline-block;
			margin-bottom: 0.25rem;
		}
	}

	.tag {
		margin-right: 1rem;
	}

	@media screen and (max-width: 760px) {
		.tag img,
		.pubdate img {
			width: 1rem;
		}
	}
</style>
