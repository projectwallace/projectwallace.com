<script lang="ts">
	import { format_number } from '$lib/format-number'
	import type { CssAnalysis } from '$lib/analyze-css'
	import { Panel } from '$lib/components/Panel/index'
	import Heading from '$lib/components/Heading.svelte'
	import { StatsList, Item } from '$lib/components/stats-list/index'

	interface Props {
		declarations?: CssAnalysis['declarations']
	}

	let { declarations = Object.create(null) }: Props = $props()

	let { total, uniquenessRatio, totalUnique, importants } = $derived(declarations)
</script>

<div id="declarations">
	<Heading element="h2">Declarations</Heading>

	<div class="report-section">
		<Panel>
			<Heading element="h3">Declarations</Heading>
			<StatsList>
				<Item key="Total" value={format_number(total)} />
				<Item
					key="Unique"
					value={format_number(totalUnique)}
					secondary_value="{format_number(uniquenessRatio * 100, { decimals: 2 })}%"
				/>
			</StatsList>
		</Panel>

		<Panel id="importants">
			<Heading element="h3">!important</Heading>
			<StatsList>
				<Item
					key="Total"
					value={format_number(importants.total)}
					secondary_value="{format_number(importants.ratio * 100, {
						decimals: 2
					})}% of all declarations"
				/>
			</StatsList>
		</Panel>
	</div>
</div>
