<script lang="ts">
	import { pretty_json } from '$lib/pretty-json'
	import PrettyJson from '$components/PrettyJson.svelte'
	import CopyButton from '$components/CopyButton.svelte'

	let { json }: { json: unknown } = $props()

	function replacer(key: string, value: unknown): unknown {
		// Stringification is super slow with this, so skip it
		if (key === 'uniqueWithLocations') return undefined
		return value
	}

	let pretty = $derived(pretty_json(json, replacer, 2))
</script>

<div class="panel scroll-container">
	<div class="toolbar">
		<CopyButton text={pretty}>Copy JSON</CopyButton>
	</div>

	<PrettyJson json={pretty} />
</div>

<style>
	.toolbar {
		position: fixed;
		top: var(--space-4);
		right: var(--space-6);
	}

	.panel {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		width: 100%;
		height: calc(100% - 6px);
		max-height: calc(100% - 6px);
		overflow: auto;
		font-family: var(--font-mono);
	}
</style>
