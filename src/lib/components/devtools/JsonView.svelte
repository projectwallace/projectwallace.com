<script lang="ts">
	import PrettyJson from '#lib/components/PrettyJson.svelte'

	let { json }: { json: string } = $props()
</script>

<div class="panel scroll-container">
	<PrettyJson {json} />
</div>

<style>
	.panel {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		inline-size: 100%;
		block-size: calc(100% - 6px);
		overflow: auto;
		font-family: var(--font-mono);
	}
</style>
