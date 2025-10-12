<script module lang="ts">
	export type IconName =
		| 'brush'
		| 'bullhorn'
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
		| 'twitter' // TODO: remove
		| 'warning'
</script>

<script lang="ts">
	interface Props {
		size?: number
		color?: string
		name: IconName
		class?: string
	}

	let { size = 24, color = '', name, class: classname }: Props = $props()
</script>

<svg width={size} height={size} class={[color, 'icon', classname]} aria-hidden="true" fill-rule="evenodd">
	<use href="#svg--{name}" />
</svg>

<style>
	.icon {
		display: inline-block;
		fill: currentColor;
		opacity: 0.75;
	}
</style>
