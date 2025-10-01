<script module lang="ts">
	const IGNORED_KEYS = new Set(['loc', 'type', 'children'])
</script>

<script lang="ts">
	import type { CssNode } from 'css-tree'
	import { MediaQuery } from 'svelte/reactivity'

	// Brute force type definition for CssNode so we can iterate over its keys
	type Node = CssNode & {
		[key: string]: any
	}

	import CssTree from './CssTree.svelte'

	type Props = {
		node: Node
		depth?: number
		show_locations: boolean
		highlighted_node: Node | undefined
	}

	let { node, depth = 0, show_locations = false, highlighted_node }: Props = $props()

	let node_element: HTMLElement | undefined = undefined
	let prefers_reduced_motion = new MediaQuery('(prefers-reduced-motion: reduced)')

	function has_children(n: Node) {
		return 'children' in n && n.children !== null && n.children.size > 0
	}

	$effect(() => {
		// Keeping track of show_locations and highlighted_node to scroll to the highlighted node
		// when either of them change
		if (node === highlighted_node && node_element !== undefined && show_locations !== undefined) {
			node_element.scrollIntoView({
				block: 'nearest',
				inline: 'nearest',
				behavior: prefers_reduced_motion.current ? 'auto' : 'smooth'
			})
		}
	})
</script>

<li bind:this={node_element} role="treeitem" aria-selected={node === highlighted_node ? 'true' : 'false'}>
	<div class="name">{node.type}</div>
	<ol role="group">
		{#if show_locations && node.loc}
			<li>
				loc:
				<ol role="group" aria-label="locations">
					<li>
						<span class="property">start</span>:
						<ol>
							<li>
								<span class="property">line</span>: <span class="number">{node.loc.start.line}</span>
							</li>
							<li>
								<span class="property">column</span>: <span class="number">{node.loc.start.column}</span>
							</li>
							<li>
								<span class="property">offset</span>: <span class="number">{node.loc.start.offset}</span>
							</li>
						</ol>
					</li>
					<li>
						<span class="property">end</span>:
						<ol>
							<li>
								<span class="property">line</span>: <span class="number">{node.loc.end.line}</span>
							</li>
							<li>
								<span class="property">column</span>: <span class="number">{node.loc.end.column}</span>
							</li>
							<li>
								<span class="property">offset</span>: <span class="number">{node.loc.end.offset}</span>
							</li>
						</ol>
					</li>
				</ol>
			</li>
		{/if}
		{#each Object.keys(node).filter((k) => !IGNORED_KEYS.has(k)) as key}
			{@const expandable = typeof node[key] === 'object' && node[key] !== null}
			<li>
				<span class="property">{key}</span>:
				{#if expandable}
					<ol role="group">
						<CssTree node={node[key]} depth={depth + 1} {show_locations} {highlighted_node} />
					</ol>
				{:else}
					<span class="string">{JSON.stringify(node[key])}</span>
				{/if}
			</li>
		{/each}
		{#if has_children(node)}
			<li>
				<span class="property">children</span>:
				<ol role="group">
					{#each node.children as child}
						<CssTree node={child} depth={depth + 1} {show_locations} {highlighted_node} />
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
