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
	import PanedLayout from './PanedLayout.svelte'
	import Pane from './Pane.svelte'

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
	<PanedLayout columns="max-content 1fr 1fr" pane_block_size="calc(100vb - 16rem)">
		<Pane fixed_height={false}>
			{#snippet pane_header()}
				<div class="pane-title">Options</div>
			{/snippet}
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
		</Pane>
		<Pane>
			{#snippet pane_header()}
				<label for="input-css" class="pane-title">CSS input</label>
				<Button size="sm" variant="secondary" icon="brush" on_click={prettify}>Prettify CSS</Button>
			{/snippet}
			<HighlightedTextarea id="input-css" name="input-css" bind:value={url_state.current.css} {on_cursor_move} />
		</Pane>
		<Pane>
			{#snippet pane_header()}
				<label for="ast-output" class="pane-title">AST output</label>
				<CopyButton variant="secondary" text={() => JSON.stringify(ast?.clone(), null, 2)}>Copy JSON</CopyButton>
			{/snippet}
			{#if ast !== undefined}
				<output id="ast-output" class="ast-output">
					<ol bind:this={scroll_container} class="scroller scroll-container" role="tree">
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
		</Pane>
	</PanedLayout>
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

	.ast-output {
		display: block;
		block-size: 100%;
	}

	.scroller {
		overflow: auto;
		block-size: 100%;

		@media (prefers-reduced-motion: no-preference) {
			scroll-behavior: smooth;
		}
	}

	.ast-explorer :global(.pane:not(:first-child) .pane-content) {
		font-size: var(--size-specimen);
	}
</style>
