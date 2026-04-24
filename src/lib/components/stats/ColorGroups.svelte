<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import Heading from '$components/Heading.svelte'
	import { group_colors } from '$lib/group-colors'
	import ColorExample from '$components/ColorExample.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { IsInViewport } from 'runed'

	type Colors = CssAnalysis['values']['colors']

	interface Props {
		colors?: Colors
	}

	let { colors = Object.create(null) }: Props = $props()
	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)

	let { uniqueWithLocations } = $derived(colors)
	let unique = $derived(uniqueWithLocations!)
	let color_groups = $derived(group_colors(unique))
	let wrapper = $state<HTMLElement | undefined>(undefined)
	let is_in_viewport = new IsInViewport(() => wrapper, { rootMargin: '200px' })
</script>

<section id="color-groups" bind:this={wrapper}>
	<Heading element="h4">Colors per group</Heading>
	<ol>
		{#each color_groups as [group, items]}
			<li>
				<div class="title">{group}</div>
				<ul>
					{#each items as item}
						{@const is_light = item.lightness <= 48 || item.alpha < 0.6}
						<li class="color">
							<div class={['specimen-wrapper', { 'is-light': is_light || item.alpha < 0.8 }]}>
								{#if is_in_viewport.current === true}
									<ColorExample color={item.authored}>
										{unique[item.authored].length}
									</ColorExample>
								{/if}
							</div>
							<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
							<button
								aria-selected={selected_item?.type === 'grouped-color' && selected_item.value === item.authored
									? 'true'
									: 'false'}
								onclick={(event) => {
									event.preventDefault()
									css_state.select_item({
										type: 'grouped-color',
										node_type: 'value',
										value: item.authored,
										locations: unique[item.authored]
									})
								}}
							>
								<span class="sr-only">Show usage for color {item.authored}</span>
							</button>
							<code class="specimen">{item.authored}</code>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>
</section>

<style>
	section {
		display: grid;
		row-gap: var(--space-5);
	}

	ol {
		display: grid;
		row-gap: var(--space-5);

		& > li {
			display: grid;
			row-gap: var(--space-4);
		}
	}

	ul {
		display: flex;
		row-gap: var(--space-3);
		column-gap: var(--space-2);
		flex-wrap: wrap;
	}

	li.color {
		background-color: light-dark(var(--bg-200), var(--bg-300));
		display: flex;
		align-items: center;
		gap: var(--space-1);
		position: relative;
		border: 1px solid transparent;
		padding-inline-end: var(--space-2);
	}

	.title {
		text-transform: capitalize;
	}

	.specimen-wrapper {
		width: var(--space-6);
		background-color: var(--bg-600);
		color: var(--black);

		&.is-light {
			text-shadow: 1px 2px 0px var(--black);
			color: var(--white);
		}
	}

	button {
		position: absolute;
		inset: 0;
	}
</style>
