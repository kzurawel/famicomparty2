<script>
	export let rom;
</script>

<svelte:head>
	<script src="/binjnes/binjnes.js"></script>
	<script src="/binjnes/simple.js"></script>
	<script>
		// Load a ROM.
		setTimeout(go, 2000);

		async function go() {
			let rom = document.querySelector('canvas').dataset.rom;
			let response = await fetch(rom);
			let romBuffer = await response.arrayBuffer();
			Emulator.start(await binjnesPromise, romBuffer);
		}
	</script>
</svelte:head>

<p class="nes-example">
	<canvas data-rom={rom} width="256" height="240" tabIndex="0" />
</p>

<style>
	.nes-example canvas {
		display: block;
		width: 512px;
		height: 480px;
		text-align: center;
		margin: 0 auto;
	}

	@media screen and (max-width: 760px) {
		.nes-example canvas {
			width: 256px;
			height: 240px;
		}
	}
</style>
