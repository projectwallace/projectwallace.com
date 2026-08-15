<script lang="ts">
	import { getChartContext } from './Chart.svelte'
	import type { Accessor } from './types'
	import type { Snippet } from 'svelte'

	const ctx = getChartContext()

	let {
		data,
		x = (d: any) => d.x,
		y = (d: any) => d.y,
		children
	}: {
		data: any[]
		x?: Accessor<any>
		y?: Accessor<any>
		children?: Snippet<[{ d: string }]>
	} = $props()

	let d = $derived('M' + data.map((point, i) => `${ctx.x_scale(x(point, i))},${ctx.y_scale(y(point, i))}`).join('L'))
</script>

{@render children?.({ d })}
