<script>
	import { getChartContext } from './Chart.svelte'

	const ctx = getChartContext()

	let { data, x = (d) => d.x, y = (d) => d.y, children } = $props()

	let d = $derived('M' + data.map((point, i) => `${ctx.x_scale(x(point, i))},${ctx.y_scale(y(point, i))}`).join('L'))
</script>

{@render children?.({ d })}
