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
	<strong class="title">CSS AST Explorer</strong>
	<a href={pkg.homepage} target="_blank" rel="external">
		CSS Parser: {pkg.version}
	</a>
</header>

<div class="ast-explorer">
	<div class="panes">
		<div class="pane">
			<div class="pane-header">
				<label for="input-css">CSS input</label>
				<Button size="sm" variant="secondary" icon="brush" on_click={prettify}>Prettify CSS</Button>
			</div>
			<div class="pane-content">
				<HighlightedTextarea id="input-css" name="input-css" bind:value={css.current} {on_cursor_move} />
			</div>
		</div>
		<div class="pane">
			<div class="pane-header">
				<label for="ast-output">AST output</label>
				<div class="split"></div>
				<div>
					<input type="checkbox" name="show-locations" id="show-locations" bind:checked={show_locations.current} />
					<label for="show-locations">
						<span class="sr-only">Show locations</span>
						<span aria-hidden="true">Locations</span>
					</label>
				</div>
				<div>
					<input type="checkbox" name="show-types" id="show-types" bind:checked={show_types.current} />
					<label for="show-types">
						<span class="sr-only">Show types</span>
						<span aria-hidden="true">Types</span>
					</label>
				</div>
				<div>
					<label for="autofocus-node">
						<div class="sr-only">Autofocus selected node</div>
						<span aria-hidden="true">Autofocus</span>
					</label>
					<input type="checkbox" name="autofocus-node" id="autofocus-node" bind:checked={autofocus.current} />
				</div>
			</div>
			<div class="pane-content">
				{#if ast !== undefined}
					<output id="ast-output">
						<ol bind:this={scroll_container} class="pane scroller scroll-container" role="tree">
							<CssTree
								node={ast}
								{highlighted_node}
								show_locations={show_locations.current}
								show_types={show_types.current}
								{scroll_container}
							/>
						</ol>
					</output>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.ast-explorer {
		--wallace-ast-explorer-border-color: var(--bg-300);
		--wallace-ast-explorer-border-width: var(--space-px);
		--wallace-ast-explorer-pane-block-size: calc(100vh - 16rem);
		container-type: inline-size;
		container-name: --ast-explorer;
		border-width: var(--wallace-ast-explorer-border-width);
		border-color: var(--wallace-ast-explorer-border-color);
	}

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

	.panes {
		display: grid;
		align-items: stretch;

		@container --ast-explorer (min-width: 33rem) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.pane {
		background-color: light-dark(transparent, var(--bg-200));
		line-height: 2;
		block-size: 100%;
		display: grid;
		grid-template-rows: auto 1fr;
		row-gap: var(--space-2);

		&:not(:first-child) {
			border-inline-start-width: var(--wallace-ast-explorer-border-width);
			border-inline-start-color: var(--wallace-ast-explorer-border-color);
		}
	}

	.pane.scroller {
		overflow: auto;
	}

	.pane-header,
	.pane-content {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
	}

	.pane-header {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-3);
		row-gap: var(--space-2);
		justify-content: space-between;
		border-block-end-width: var(--wallace-ast-explorer-border-width);
		border-block-end-color: var(--wallace-ast-explorer-border-color);

		& .split {
			margin-inline-start: auto;
		}
	}

	.pane-content {
		block-size: var(--wallace-ast-explorer-pane-block-size);
		font-size: var(--size-specimen);
		overflow-x: auto;
	}
</style>
