<script lang="ts" module>
	export type Sizing = 'relative' | 'evenly'
</script>

<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'

	type Colors = CssAnalysis['values']['colors']

	type Props = Pick<Colors, 'total' | 'totalUnique'> & {
		colors?: {
			converted: { authored: string }
			locations: { length: number }
		}[]
		sizing?: Sizing
	}

	let { colors = [], total = 0, totalUnique = 0, sizing = 'relative' }: Props = $props()

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D | null

	$effect(() => {
		if (!canvas) return

		// Multiplier to make sure numbers are large enough to provide
		// crisp edges between the colors
		let MULTIPLIER = 1
		let TARGET = 2000

		if (totalUnique < TARGET) {
			MULTIPLIER = Math.floor(TARGET / totalUnique)
		}

		canvas.width = sizing === 'relative' ? total * MULTIPLIER : totalUnique * MULTIPLIER
		ctx = canvas.getContext('2d')

		if (ctx === null) return

		let offset = 0
		let height = canvas.height

		for (let value of colors) {
			let color = value.converted.authored
			let itemWidth = sizing === 'relative' ? value.locations.length * MULTIPLIER : MULTIPLIER
			// We cannot calculate the computed color, so we just set it to transparent. The checkered background will show through.
			if (color.includes('var(')) {
				ctx.fillStyle = 'transparent'
			} else {
				ctx.fillStyle = color
			}
			ctx.fillRect(offset, 0, itemWidth, height)
			offset += itemWidth
		}
	})
</script>

<canvas bind:this={canvas} height="200" class="color-example"></canvas>

<style>
	canvas {
		width: 100%;
		height: var(--color-bar-height, 6em);
		contain: strict;
	}
</style>
