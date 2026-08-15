<script lang="ts">
	import Rulesets from '#lib/components/stats/Rulesets.svelte'
	import Properties from '#lib/components/stats/Properties.svelte'
	import Selectors from '#lib/components/stats/Selectors.svelte'
	import Stylesheet from '#lib/components/stats/Stylesheet.svelte'
	import AtRules from '#lib/components/stats/AtRules.svelte'
	import Declarations from '#lib/components/stats/Declarations.svelte'
	import Values from '#lib/components/stats/Values.svelte'
	import type { CssAnalysis } from '#lib/analyze-css.js'

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
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);
		container-type: inline-size;

		@media (min-width: 66rem) {
			gap: var(--space-16);
		}
	}
</style>
