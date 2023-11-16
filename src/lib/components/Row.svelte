<script>
	export let values;
</script>

<tr>
	{#each values as val}
		<td>{val}</td>
	{/each}
</tr>
