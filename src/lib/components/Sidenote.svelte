<script>
	export let id;
</script>

<label for={id} class="margin-toggle sidenote-number" />
<input type="checkbox" {id} class="margin-toggle" />
<span class="sidenote">
	<slot />
</span>

<style>
	.sidenote {
		float: right;
		clear: right;
		margin-right: -60%;
		width: 50%;
		margin-top: 0;
		margin-bottom: 0;
		font-size: 1.1rem;
		line-height: 1.3;
		vertical-align: baseline;
		position: relative;
	}

	input.margin-toggle {
		display: none;
	}

	.sidenote-number {
		counter-increment: sidenote-counter;
	}

	.sidenote-number:after,
	.sidenote:before {
		position: relative;
		vertical-align: baseline;
	}

	.sidenote-number:after {
		content: counter(sidenote-counter);
		font-size: 1rem;
		top: -0.5rem;
		left: 0.1rem;
	}

	.sidenote:before {
		content: counter(sidenote-counter) ' ';
		top: -0.5rem;
	}

	blockquote .sidenote {
		margin-right: -82%;
		min-width: 59%;
		text-align: left;
	}

	@media screen and (max-width: 760px) {
		label.margin-toggle:not(.sidenote-number) {
			display: inline;
		}

		.marginnote {
			display: none;
		}

		.margin-toggle:checked + .marginnote {
			display: block;
			float: left;
			left: 1rem;
			clear: both;
			width: 95%;
			margin: 1rem 2.5%;
			vertical-align: baseline;
			position: relative;
		}

		label {
			cursor: pointer;
		}
	}
</style>
