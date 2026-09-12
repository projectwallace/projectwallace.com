<script module lang="ts">
	export type IconName =
		| 'arrow-right'
		| 'brush'
		| 'bullhorn'
		| 'check'
		| 'chevron-down'
		| 'chevron-up'
		| 'chevron-right'
		| 'code'
		| 'code-window'
		| 'copy'
		| 'cross'
		| 'cubes'
		| 'external'
		| 'file'
		| 'fold'
		| 'github'
		| 'layers'
		| 'menu'
		| 'minimize'
		| 'moon'
		| 'network'
		| 'rss'
		| 'sun'
		| 'swap'
		| 'target'
		| 'tools'
		| 'warning'
		| 'chrome'
		| 'edge'
		| 'firefox'
		| 'safari'
</script>

<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	type Props = SVGAttributes<SVGSVGElement> & {
		size?: number
		color?: string
		name: IconName
	}

	let { size = 24, color = '', name, class: classname, ...rest }: Props = $props()
</script>

<svg width={size} height={size} class={[color, 'icon', classname]} aria-hidden="true" fill-rule="evenodd" {...rest}>
	<use href="#svg--{name}" />
</svg>

<style>
	.icon {
		display: inline-block;
		fill: currentColor;
		opacity: 0.75;
	}
</style>
