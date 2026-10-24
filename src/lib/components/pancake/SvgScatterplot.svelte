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

	let d = $derived(
		data
			.map((point, i) => {
				const _x = ctx.x_scale(x(point, i))
				const _y = ctx.y_scale(y(point, i))
				return `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`
			})
			.join(' ')
	)
</script>

{@render children?.({ d })}
