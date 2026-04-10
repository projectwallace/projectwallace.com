<script lang="ts">
	import { walk, parse, type CSSNode, type PlainCSSNode } from '@projectwallace/css-parser'
	import pkg from '@projectwallace/css-parser/package.json' with { type: 'json' }
	import { PersistedState } from 'runed'
	import CssTree from './CssTree.svelte'
	import { format } from '@projectwallace/format-css'
	import HighlightedTextarea from './HighlightedTextarea.svelte'
	import { HashState } from '$lib/url-hash-state.svelte'
	import Button from './Button.svelte'
	import CopyButton from './CopyButton.svelte'

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

	type UrlState = {
		css: string
		parse_atrule_preludes: boolean
		parse_selectors: boolean
		parse_values: boolean
	}

	let url_state = new HashState<UrlState>({
		css: DEFAULT_CSS,
		parse_atrule_preludes: true,
		parse_selectors: true,
		parse_values: true
	})

	let ast = $derived.by(() => {
		try {
			return parse(url_state.current.css, {
				parse_atrule_preludes: url_state.current.parse_atrule_preludes,
				parse_selectors: url_state.current.parse_selectors,
				parse_values: url_state.current.parse_values
			})
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
		url_state.current = {
			...url_state.current,
			css: format(url_state.current.css)
		}
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
		<div class="pane options">
			<div class="pane-header">
				<div class="pane-title">Options</div>
			</div>
			<div class="pane-content">
				<div>
					<input
						type="checkbox"
						name="parse-atrule-preludes"
						id="parse-atrule-preludes"
						bind:checked={url_state.current.parse_atrule_preludes}
					/>
					<label for="parse-atrule-preludes">Parse atrule preludes</label>
				</div>
				<div>
					<input
						type="checkbox"
						name="parse-selectors"
						id="parse-selectors"
						bind:checked={url_state.current.parse_selectors}
					/>
					<label for="parse-selectors">Parse selectors</label>
				</div>
				<div>
					<input type="checkbox" name="parse-values" id="parse-values" bind:checked={url_state.current.parse_values} />
					<label for="parse-values">Parse values</label>
				</div>
				<div>
					<input type="checkbox" name="show-locations" id="show-locations" bind:checked={show_locations.current} />
					<label for="show-locations">Show locations</label>
				</div>
				<div>
					<input type="checkbox" name="show-types" id="show-types" bind:checked={show_types.current} />
					<label for="show-types">Show types</label>
				</div>
				<div>
					<input type="checkbox" name="autofocus-node" id="autofocus-node" bind:checked={autofocus.current} />
					<label for="autofocus-node">Autofocus selected node</label>
				</div>
			</div>
		</div>
		<div class="pane">
			<div class="pane-header">
				<label for="input-css" class="pane-title">CSS input</label>
				<Button size="sm" variant="secondary" icon="brush" on_click={prettify}>Prettify CSS</Button>
			</div>
			<div class="pane-content">
				<HighlightedTextarea id="input-css" name="input-css" bind:value={url_state.current.css} {on_cursor_move} />
			</div>
		</div>
		<div class="pane">
			<div class="pane-header">
				<label for="ast-output" class="pane-title">AST output</label>
				<CopyButton variant="secondary" text={() => JSON.stringify(ast?.clone(), null, 2)}>Copy JSON</CopyButton>
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

		@container --ast-explorer (min-width: 50rem) {
			grid-template-columns: max-content 1fr 1fr;
		}
	}

	.pane {
		background-color: light-dark(transparent, var(--bg-200));
		line-height: 2;
		block-size: 100%;
		display: grid;
		grid-template-rows: auto 1fr;

		&:not(:first-child) {
			border-inline-start-width: var(--wallace-ast-explorer-border-width);
			border-inline-start-color: var(--wallace-ast-explorer-border-color);
		}
	}

	.pane.scroller {
		overflow: auto;

		@media (prefers-reduced-motion: no-preference) {
			scroll-behavior: smooth;
		}
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
		border-color: var(--wallace-ast-explorer-border-color);

		&:not(.pane:first-child &) {
			@container --ast-explorer (max-width: 50rem) {
				border-block-start-width: var(--wallace-ast-explorer-border-width);
			}
		}
	}

	.pane-title {
		font-weight: var(--font-bold);
	}

	.pane-content {
		overflow-x: auto;

		&:not(.options &) {
			font-size: var(--size-specimen);

			@container --ast-explorer (min-width: 50rem) {
				block-size: var(--wallace-ast-explorer-pane-block-size);
			}
		}
	}
</style>
