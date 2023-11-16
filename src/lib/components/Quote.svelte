<script>
	export let author;
</script>

<blockquote>
	<p>
		<slot />
	</p>
	<footer>{author}</footer>
</blockquote>

<style>
	blockquote {
		border-left: 3px solid #333;
		font-size: 1.4rem;
		margin-left: 0;
		padding-left: 40px;
	}

	blockquote p {
		width: 55%;
		margin-right: 40px;
	}

	blockquote footer {
		width: 55%;
		font-size: 1.1rem;
		text-align: right;
	}

	@media screen and (max-width: 760px) {
		blockquote {
			margin-left: 1.5em;
			margin-right: 0;
		}

		blockquote p,
		blockquote footer {
			width: 100%;
		}
	}
</style>
