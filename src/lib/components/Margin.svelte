<script>
	export let id;
</script>

<label for={id} class="margin-toggle">&#8853;</label>
<input type="checkbox" {id} class="margin-toggle" />
<span class="marginnote">
	<slot />
</span>

<style>
	.marginnote {
		float: right;
		clear: right;
		margin-right: -60%;
		width: 50%;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1.1rem;
		line-height: 1.3;
		vertical-align: baseline;
		position: relative;
		text-align: justify;
	}

	blockquote .marginnote {
		margin-right: -82%;
		min-width: 59%;
		text-align: left;
	}

	input.margin-toggle {
		display: none;
	}

	label.margin-toggle:not(.sidenote-number) {
		display: none;
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
