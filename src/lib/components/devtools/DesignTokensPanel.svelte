<script lang="ts">
	import { pretty_json } from '$lib/pretty-json'
	import PrettyJson from '$components/PrettyJson.svelte'
	import CopyButton from '$components/CopyButton.svelte'
	import Button from '$components/Button.svelte'
	import type { CssAnalysis } from '$lib/analyze-css'
	import { analysis_to_tokens } from '@projectwallace/css-design-tokens'

	interface Props {
		analysis: CssAnalysis
	}

	let { analysis }: Props = $props()

	function replacer(key: string, value: unknown): unknown {
		// Stringification is super slow with this, so skip it
		if (key === 'uniqueWithLocations') return undefined
		return value
	}

	let pretty = $derived(pretty_json(analysis_to_tokens(analysis), replacer, 2))
</script>

<div class="toolbar">
	<Button
		element="a"
		variant="secondary"
		size="sm"
		icon="file"
		href={`data:text/json;charset=utf-8,${encodeURIComponent(pretty)}`}
		download="projectwallace-css.tokens.json"
	>
		Download tokens
	</Button>
	<CopyButton text={pretty}>Copy tokens</CopyButton>
</div>

<div class="panel scroll-container">
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
		font-family: var(--font-mono);
	}
</style>
