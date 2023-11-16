<script>
	export let id;
	export let start;
	export let title;

	let url = `https://www.youtube-nocookie.com/embed/${id}`;
	if (start) {
		url += `?start=${start}`;
	}
</script>

<figure class="iframe-wrapper">
	<iframe
		width="560"
		height="315"
		src={url}
		frameborder="0"
		allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; clipboard-write"
		allowfullscreen
	/><br />
	<figcaption><a href={url}>{title}</a></figcaption>
</figure>

<style>
	.iframe-wrapper figcaption {
		float: none;
		clear: none;
	}
</style>
