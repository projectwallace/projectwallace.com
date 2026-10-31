<script lang="ts">
	import { pretty_json } from '#lib/pretty-json.ts'
	import Toolbar from './Toolbar.svelte'
	import JsonView from './JsonView.svelte'

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

<Toolbar
	text={pretty}
	mime_type="application/json"
	filename="projectwallace-css-analysis.json"
	download_label="Download JSON"
	copy_label="Copy JSON"
/>

<JsonView json={pretty} />
