<script>
	export let columns;
	export let caption;
</script>

<div class="table-wrapper">
	<table>
		{#if caption}
			<caption>{caption}</caption>
		{/if}
		<thead>
			<tr>
				{#each columns as col}
					<th>{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<slot />
		</tbody>
	</table>
</div>
