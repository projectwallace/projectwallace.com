<script lang="ts">
	import { pretty_json } from '#lib/pretty-json.ts'
	import Toolbar from './Toolbar.svelte'
	import JsonView from './JsonView.svelte'

	let { json }: { json: unknown } = $props()

	function replacer(key: string, value: unknown): unknown {
		// Maps of unique items are written as { item: count }, without their locations
		if (value instanceof Map) {
			return Object.fromEntries(
				[...value].map(([k, v]) => [k, typeof v === 'object' && v !== null && 'count' in v ? v.count : v])
			)
		}
		if (key === 'locations') {
			return undefined
		}
		return value
	}

	let pretty = $derived(pretty_json(json, replacer, 2))
</script>

<Toolbar
	text={pretty}
	mime_type="application/json"
	filename="projectwallace-css-analysis.json"
	download_label="Download JSON"
	copy_label="Copy JSON"
/>

<JsonView json={pretty} />
