<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

<div class="form-group">
	{@render children?.()}
</div>

<style>
	.form-group {
		display: grid;
		gap: var(--space-2);
		width: 100%;
		position: relative;
	}
</style>
