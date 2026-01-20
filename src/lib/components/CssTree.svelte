<script module lang="ts">
	const IGNORED_KEYS = new Set(['type_name', 'children', 'text', 'start', 'end', 'line', 'column', 'length'])
</script>

<script lang="ts">
	import type { CSSNode, PlainCSSNode } from '@projectwallace/css-parser'
	import { MediaQuery } from 'svelte/reactivity'

	// Brute force type definition for CssNode so we can iterate over its keys
	type Node = CSSNode & {
		[key: string]: any
	}

	import CssTree from './CssTree.svelte'

	type Props = {
		node: Node
		depth?: number
		show_locations: boolean
		highlighted_node?: PlainCSSNode
		scroll_container?: HTMLElement
	}

	let { node, depth = 0, show_locations = false, highlighted_node, scroll_container }: Props = $props()

	// Convert the node to a plain object for easier iteration
	let plain_node = $derived(node.clone({ locations: true, deep: false }) as Node)

	let node_element: HTMLElement | undefined = undefined
	let prefers_reduced_motion = new MediaQuery('(prefers-reduced-motion: reduced)')

	function compare_nodes(a: Node, b: PlainCSSNode | undefined): boolean {
		if (!b) return false
		return a.start === b.start && a.end === b.end && a.type === b.type
	}

	function filter_properties(obj: Node): string[] {
		return Object.keys(obj).filter((key) => {
			if (IGNORED_KEYS.has(key)) return false
			if (obj[key] === false) return false
			return true
		})
	}

	$effect(() => {
		// Keeping track of show_locations and highlighted_node to scroll to the highlighted node
		// when either of them change
		if (
			highlighted_node &&
			node_element !== undefined &&
			show_locations !== undefined &&
			scroll_container !== undefined &&
			compare_nodes(node, highlighted_node)
		) {
			const container_rect = scroll_container.getBoundingClientRect()
			const element_rect = node_element.getBoundingClientRect()

			// Only scroll if the element is not fully visible within the scrollable container
			if (element_rect.top < container_rect.top || element_rect.bottom > container_rect.bottom) {
				const scroll_offset =
					element_rect.top - container_rect.top - container_rect.height / 2 + element_rect.height / 2
				scroll_container.scrollTo({
					top: scroll_container.scrollTop + scroll_offset,
					behavior: prefers_reduced_motion.current ? 'auto' : 'smooth'
				})
			}
		}
	})
</script>

<li bind:this={node_element} role="treeitem" aria-selected={compare_nodes(node, highlighted_node) ? 'true' : 'false'}>
	<div class="name">{node.type_name}</div>
	<ol role="group">
		{#if show_locations}
			{#each ['line', 'column', 'start', 'end', 'length'] as prop}
				<li>
					<span class="property">{prop}</span>: <span class="number">{node[prop]}</span>
				</li>
			{/each}
		{/if}
		{#each filter_properties(plain_node) as key}
			{@const value = plain_node[key]}
			{@const expandable = typeof value === 'object' && value !== null}
			<li>
				<span class="property">{key}</span>:
				{#if expandable}
					<ol role="group">
						<CssTree node={value} depth={depth + 1} {show_locations} {highlighted_node} {scroll_container} />
					</ol>
				{:else if Number.isFinite(value)}
					<span class="number">{value}</span>
				{:else}
					<span class="string">{JSON.stringify(value)}</span>
				{/if}
			</li>
		{/each}
		{#if node.children && node.children.length > 0}
			<li>
				<span class="property">children</span>:
				<ol role="group">
					{#each node.children as child}
						<CssTree node={child} depth={depth + 1} {show_locations} {highlighted_node} {scroll_container} />
					{/each}
				</ol>
			</li>
		{/if}
	</ol>
</li>

<style>
	[role='treeitem'] {
		font-family: var(--font-mono);
		transition: background-color 0.1s;
		scroll-margin: var(--space-12);

		&[aria-selected='true'] {
			background-color: var(--bg-100);
		}
	}

	ol {
		padding-left: 2ch;
	}

	.property,
	.name {
		color: var(--highlight-property);
	}

	.number {
		color: var(--highlight-number);
	}

	.string {
		color: var(--highlight-string);
	}
</style>
