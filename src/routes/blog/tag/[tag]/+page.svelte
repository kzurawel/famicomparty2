<script>
	export let data;
	export let options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	};

	import calendarIcon from '$lib/icons/lnr-calendar-full.svg';
	import tagIcon from '$lib/icons/lnr-tag.svg';
</script>

<svelte:head>
	<title>Famicom Party | {data.tag}</title>
</svelte:head>

<h1>Posts tagged "{data.tag}"</h1>

<ul>
	{#each data.posts as post}
		<li>
			<span class="pubdate">
				<img src={calendarIcon} alt="" />
				{new Date(post.meta.date).toLocaleDateString('en-us', options)}
			</span>
			<h2>
				<a href="/blog/{post.dir}/{post.path}">
					{post.meta.title}
				</a>
			</h2>
			{#if post.meta.summary}
				<span>{post.meta.summary}</span>
			{/if}
			{#if post.meta.tags && post.meta.tags.length}
				<br /><span>
					{#each post.meta.tags as tag}
						<a href="/blog/tag/{tag}" class="tag"><img src={tagIcon} alt="" /> {tag}</a>
					{/each}
				</span>
			{/if}
		</li>
	{/each}
</ul>

<style lang="scss">
	ul {
		list-style-type: none;
		padding-left: 1rem;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.tag {
		font-size: 1rem;
		margin-right: 1rem;

		img {
			height: 1rem;
		}
	}

	@media screen and (max-width: 760px) {
		.tag img,
		.pubdate img {
			width: 1rem;
		}
	}
</style>
