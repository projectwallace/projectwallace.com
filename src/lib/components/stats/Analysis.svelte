<script lang="ts">
	import { type Snippet, onDestroy } from 'svelte'
	import Report from './Report.svelte'
	import Nav from './Nav.svelte'
	import Devtools from '$components/DevTools.svelte'
	import type { CSSOrigin } from '$lib/css-origins'
	import type { CssAnalysis } from '$lib/analyze-css'
	import NetworkPanel from '$components/NetworkPanel.svelte'
	import ItemUsage from '$components/ItemUsage.svelte'
	import JsonPanel from '$components/devtools/JsonPanel.svelte'
	import CssPanel from '$components/devtools/CssPanel.svelte'
	import { analyzer_tabs, type TabId } from '$components/devtools/tabs'
	import { get_css_state } from '$lib/css-state.svelte'
	import { PersistedState } from 'runed'
	import AnalyzerWorker from '$lib/css-analyzer.worker?worker'

	interface Props {
		prettify_css_before_analyze?: boolean
		origins?: CSSOrigin[]
		nav?: Snippet<[]>
		children?: Snippet<[{ analysis: CssAnalysis; css: string }]>
		devtools?: Snippet<[{ analysis: CssAnalysis; css: string }]>
	}

	let { nav, children, devtools }: Props = $props()
	let css_state = get_css_state()
	let analysis: CssAnalysis | undefined = $state(undefined)
	let nav_visible = new PersistedState<boolean>('analyzer-nav-visible', true)

	const worker = new AnalyzerWorker()
	worker.onmessage = (event: MessageEvent<{ css: string; analysis: CssAnalysis }>) => {
		css_state.css = event.data.css
		analysis = event.data.analysis
	}

	$effect(() => {
		if (css_state.raw_css) {
			worker.postMessage({ css: css_state.raw_css, prettify: css_state.should_prettify })
		}
	})

	onDestroy(() => {
		worker.terminate()
	})

	function on_keydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
			nav_visible.current = !nav_visible.current
		}
	}
</script>

<svelte:window onkeydown={on_keydown} />

{#if analysis}
	<div data-testid="css-report" class="analysis" data-nav-visible={nav_visible.current}>
		<div class="nav print:hidden scroll-container">
			{#if nav}
				{@render nav()}
			{:else}
				<Nav />
			{/if}
		</div>
		<div class="report" data-testid="report">
			{#if children}
				{@render children({ analysis, css: css_state.css })}
			{:else}
				<Report result={analysis} />
			{/if}
		</div>
		<div class="devtools print:hidden">
			{#if devtools}
				{@render devtools({ analysis, css: css_state.css })}
			{:else}
				<Devtools tabs={analyzer_tabs}>
					{#snippet children({ tab_id }: { tab_id: TabId })}
						{#if tab_id === 'network'}
							<NetworkPanel />
						{:else if tab_id === 'inspector'}
							<ItemUsage />
						{:else if tab_id === 'report'}
							<JsonPanel json={analysis} />
						{:else if tab_id === 'css'}
							<CssPanel css={css_state.css} />
						{/if}
					{/snippet}
				</Devtools>
			{/if}
		</div>
	</div>
{/if}

<style>
	.analysis {
		display: grid;
		grid-template-areas: 'nav' 'report' 'devtools';
		position: relative;
		contain: layout style;
	}

	.nav {
		grid-area: nav;
	}

	.report {
		grid-area: report;
		padding: var(--space-2);
	}

	.report :global(section) {
		content-visibility: auto;
		contain-intrinsic-size: auto 500px;
	}

	.devtools {
		grid-area: devtools;
		position: sticky;
		right: 0;
		bottom: 0;
		left: 0;
	}

	@media (min-width: 48rem) {
		.analysis {
			grid-template-rows: 1fr auto;
			column-gap: var(--space-8);

			&[data-nav-visible='true'] {
				grid-template-columns: minmax(0, 1fr) clamp(12rem, 20%, 18rem);
				grid-template-areas:
					'report nav'
					'devtools devtools';
			}

			&[data-nav-visible='false'] {
				grid-template-columns: 1fr;
				grid-template-areas: 'report' 'devtools';

				& .nav {
					display: none;
				}
			}
		}

		.nav {
			position: sticky;
			top: 0;
			right: 0;
			bottom: 0;
			padding-top: var(--space-8);
			max-height: 100vh;
			overflow-y: auto;
			padding-bottom: 4rem;
		}

		.report {
			padding-top: var(--space-8);
			padding-left: var(--space-8);
		}
	}

	@media print {
		.analysis {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		:global(html) {
			scroll-behavior: smooth;
		}
	}
</style>
