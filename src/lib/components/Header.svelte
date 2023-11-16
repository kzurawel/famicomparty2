<header class="header-wrapper">
	<h1 class="site-title">
		<a href="/"><img src="/img/famicomparty.png" alt="Famicom Party" /></a>
	</h1>
	<nav class="header-links">
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/book">The Book</a></li>
			<li><a href="/blog">The Blog</a></li>
		</ul>
	</nav>
</header>

<style>
	.header-wrapper {
		background-color: #88030f;
		display: flex;
		margin-bottom: 1.45rem;
		min-height: 3rem;
		padding: 1.45rem 1.0875rem;
	}

	.header-wrapper ul {
		display: flex;
		list-style-type: none;
	}

	.header-wrapper ul li {
		margin-right: 1em;
	}

	.header-wrapper ul li:not(:first-child) {
		margin-top: 0;
	}

	.site-title {
		display: inline-block;
		margin: 0;
	}

	.header-wrapper .site-title a {
		background: none;
	}

	a:link {
		background: linear-gradient(#88030f, #88030f), linear-gradient(#88030f, #88030f),
			linear-gradient(#bb8f3e, #bb8f3e);
		background-size: 0.05em 1px, 0.05em 1px, 1px 1px;
		background-repeat: no-repeat, no-repeat, repeat-x;
		text-shadow: 0.03em 0 #88030f, -0.03em 0 #88030f, 0 0.03em #88030f, 0 -0.03em #88030f,
			0.06em 0 #8803 0f, -0.06em 0 #88030f, 0.09em 0 #88030f, -0.09em 0 #88030f, 0.12em 0 #88030f,
			-0.12em 0 #88030f, 0.15em 0 #88030f, -0.15em 0 #88030f;
		background-position: 0% 93%, 100% 93%, 0% 93%;
	}

	a:link,
	a:visited {
		color: #bb8f3e;
		font-style: italic;
		font-weight: bold;
		text-shadow: none;
	}
</style>
