<script lang="ts">
	import { walk, parse, type CSSNode, type PlainCSSNode } from '@projectwallace/css-parser'
	import pkg from '@projectwallace/css-parser/package.json' with { type: 'json' }
	import { PersistedState } from 'runed'
	import CssTree from './CssTree.svelte'
	import { format } from '@projectwallace/format-css'
	import HighlightedTextarea from './HighlightedTextarea.svelte'
	import { HashState } from '$lib/url-hash-state.svelte'
	import Button from './Button.svelte'

	let highlighted_node: PlainCSSNode | undefined = $state.raw(undefined)
	let show_locations = new PersistedState('ast-show-locations', false)
	let autofocus = new PersistedState('ast-autofocus-node', true)
	let show_types = new PersistedState('ast-show-types', false)
	let scroll_container: HTMLElement | undefined = $state(undefined)

	$effect(() => {
		if (!autofocus.current) {
			highlighted_node = undefined
		}
	})

	const DEFAULT_CSS = format(
		'a { color: red; background: blue !important; #test-nested { color: green; } } c + b[aria-selected^="true" i] { border: 3px solid rgb(0 30% 0 / 50%) } @media (min-width: 600px) or print { test { color: blue !ie; } }'
	)

	let css = new HashState<string>(DEFAULT_CSS)

	let ast = $derived.by(() => {
		try {
			return parse(css.current)
		} catch (error) {
			return undefined
		}
	})

	function on_cursor_move({ start, end }: { start: number; end: number }) {
		if (autofocus.current) {
			let node = find_node_at_cursor(start, end)
			if (node === undefined) {
				highlighted_node = undefined
			} else {
				highlighted_node = node.clone({ deep: false, locations: true })
			}
		}
	}

	function find_node_at_cursor(start: number, end: number): CSSNode | undefined {
		if (!ast) return
		let found = undefined
		walk(ast, (node) => {
			if (node.start <= start && node.end >= end) {
				found = node
			}
		})
		return found
	}

	function prettify() {
		css.current = format(css.current)
	}
</script>

<header class="header">
	<h1 class="title">CSS AST Explorer</h1>
	<Button size="sm" variant="secondary" icon="brush" onclick={prettify}>Prettify CSS</Button>

	<a href={pkg.homepage} target="_blank" rel="external">
		CSS Parser: {pkg.version}
	</a>
	<div>
		<label for="show-locations">Show location data</label>
		<input type="checkbox" name="show-locations" id="show-locations" bind:checked={show_locations.current} />
	</div>
	<div>
		<label for="show-types">Show types</label>
		<input type="checkbox" name="show-types" id="show-types" bind:checked={show_types.current} />
	</div>
	<div>
		<label for="autofocus-node">Autofocus</label>
		<input type="checkbox" name="autofocus-node" id="autofocus-node" bind:checked={autofocus.current} />
	</div>
</header>

<div class="panes">
	<div class="pane">
		<label for="input-css" class="sr-only">CSS to analyze</label>
		<HighlightedTextarea id="input-css" name="input-css" bind:value={css.current} {on_cursor_move} />
	</div>
	{#if ast !== undefined}
		<ol bind:this={scroll_container} class="pane scroll-container" role="tree">
			<CssTree
				node={ast}
				{highlighted_node}
				show_locations={show_locations.current}
				show_types={show_types.current}
				{scroll_container}
			/>
		</ol>
	{/if}
</div>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-6);
		padding-block: var(--space-2);

		a[rel='external' i] {
			margin-inline-start: auto;
		}
	}

	.title {
		font-weight: var(--font-bold);
	}

	.scroll-container {
		max-height: 100%;
		overflow: auto;
		overscroll-behavior: contain;
	}

	.panes {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: stretch;
		height: calc(100vh - 12rem);
	}

	.pane {
		border: 1px solid var(--fg-600);
		background-color: var(--bg-0);
		font-size: var(--size-specimen);
		line-height: 2;
		padding: var(--space-2) var(--space-3);
		height: 100%;
	}
</style>
