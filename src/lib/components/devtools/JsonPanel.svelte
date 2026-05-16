<script lang="ts">
	import { pretty_json } from '$lib/pretty-json'
	import PrettyJson from '$components/PrettyJson.svelte'
	import CopyButton from '$components/CopyButton.svelte'

	let { json }: { json: unknown } = $props()

	function replacer(key: string, value: unknown): unknown {
		// Replace 'unique' with the data from 'uniqueWithLocations' but only their counts
		if (typeof value === 'object' && value !== null && 'uniqueWithLocations' in value) {
			const { uniqueWithLocations, ...rest } = value as Record<string, unknown>
			return {
				...rest,
				unique: Object.fromEntries(
					Object.entries(uniqueWithLocations as Record<string, unknown[]>).map(([k, v]) => [k, v.length])
				)
			}
		}
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
