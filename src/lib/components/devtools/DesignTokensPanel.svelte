<script lang="ts">
	import { pretty_json } from '#lib/pretty-json.ts'
	import Toolbar from './Toolbar.svelte'
	import JsonView from './JsonView.svelte'
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { analysis_to_tokens } from '@projectwallace/css-design-tokens'

	interface Props {
		analysis: CssAnalysis
	}

	let { analysis }: Props = $props()

	function replacer(key: string, value: unknown): unknown {
		// Stringification is super slow with this, so skip it
		if (key === 'uniqueWithLocations') {
			return undefined
		}
		return value
	}

	let pretty = $derived(pretty_json(analysis_to_tokens(analysis), replacer, 2))
</script>

<Toolbar
	text={pretty}
	mime_type="application/json"
	filename="projectwallace-css.tokens.json"
	download_label="Download tokens"
	copy_label="Copy tokens"
/>

<JsonView json={pretty} />
