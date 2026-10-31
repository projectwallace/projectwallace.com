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
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-2);
		inline-size: 100%;
		position: relative;
	}
</style>
