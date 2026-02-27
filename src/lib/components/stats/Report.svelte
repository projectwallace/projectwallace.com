<script lang="ts">
	import Rulesets from '$components/stats/Rulesets.svelte'
	import Properties from '$components/stats/Properties.svelte'
	import Selectors from '$components/stats/Selectors.svelte'
	import Stylesheet from '$components/stats/Stylesheet.svelte'
	import AtRules from '$components/stats/AtRules.svelte'
	import Declarations from '$components/stats/Declarations.svelte'
	import Values from '$components/stats/Values.svelte'
	import type { CssAnalysis } from '$lib/analyze-css'

	interface Props {
		result?: CssAnalysis
	}

	let { result = Object.create(null) }: Props = $props()

	let { rules, selectors, declarations, atrules, properties, values } = $derived(result)
</script>

<div class="group">
	<Stylesheet {result} />
	<Rulesets {rules} {atrules} {selectors} {declarations} />
	<Selectors {selectors} />
	<AtRules {atrules} />
	<Declarations {declarations} />
	<Properties {properties} />
	<Values {values} />
</div>

<style>
	.group {
		display: grid;
		gap: var(--space-8);
		container-type: inline-size;

		@media (min-width: 66rem) {
			gap: var(--space-16);
		}
	}
</style>
