<script lang="ts">
	let { children } = $props()
</script>

<div class="formula">
	{@render children?.()}
</div>

<style>
	.formula {
		font-size: var(--size-2xl);
		font-family: cursive;
	}
</style>
