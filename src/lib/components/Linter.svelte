<script lang="ts">
	import { format } from '@projectwallace/format-css'
	import HighlightedTextarea from '$components/HighlightedTextarea.svelte'
	import CopyButton from '$components/CopyButton.svelte'
	import { enhance } from '$app/forms'
	import { onMount } from 'svelte'
	import type { actions } from '../../routes/(public)/lint-css/+page.server'
	import { debounce } from '$lib/debounce'
	import Empty from './Empty.svelte'
	import Table from './Table.svelte'
	import Pre from './Pre.svelte'
	import { create_keyboard_list, type OnChange } from './use-keyboard-list.svelte'
	import type { Warning } from 'stylelint'

	let {
		elements: { root, item }
	} = create_keyboard_list({
		scroll_selected_item_into_view: false
	})

	type LintResult = Awaited<ReturnType<(typeof actions)['default']>>

	type Props = {
		css?: string
	}

	const DEFAULT_CSS = format(`
		@layer reset, components;

		@layer components {
			.my-component {
				-webkit-mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
				mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
			}

			.nav-desktop .nav-list:has(.nav-link:hover) .nav-link.active:not(:hover) {
				anchor-name: none;
			}

			.my-dialog {
				z-index: 2147483648;
			}

			@media (min-width: 1000px) and (max-width: 500px) {
				/* ... */
			}

			@media (width: 300px) {
				/* ... */
			}
		}
	`)

	let { css = DEFAULT_CSS }: Props = $props()

	let form = $state<HTMLFormElement>()
	let lint_result = $state<LintResult | null>(null)
	let active_item = $state<number | undefined>()

	const oninput = debounce(() => {
		form?.requestSubmit()
		active_item = undefined
	}, 150)

	$effect(() => {
		if (css.length > 0) {
			form?.requestSubmit()
			active_item = undefined
		}
	})

	function warning_to_css_location(source: string, warning: Warning) {
		const lines = source.split('\n')
		function line_offset(line: number, column: number) {
			let offset = 0
			for (let i = 0; i < line - 1; i++) offset += lines[i].length + 1
			return offset + column - 1
		}
		const start = line_offset(warning.line, warning.column)
		let length = 1
		if (typeof warning.endLine === 'number' && typeof warning.endColumn === 'number') {
			length = line_offset(warning.endLine, warning.endColumn) - start
		}
		return { line: warning.line, column: warning.column, offset: start, length }
	}

	const on_change: OnChange = ({ value, active_index }) => {
		active_item = active_index
	}
</script>

<form
	method="POST"
	action="/lint-css"
	bind:this={form}
	{oninput}
	use:enhance={() =>
		async ({ result }) => {
			if (result.type === 'success') {
				lint_result = result.data as LintResult
			}
		}}
>
	<div class="ast-explorer">
		<div class="panes">
			<div class="pane options">
				<div class="pane-header">
					<div class="pane-title">Options</div>
				</div>
				<div class="pane-content">
					<fieldset>
						<legend>Preset</legend>
						<div>
							<input type="radio" id="preset-recommended" name="preset" value="recommended" checked />
							<label for="preset-recommended">Recommended</label>
						</div>
						<div>
							<input type="radio" id="preset-correctness" name="preset" value="correctness" />
							<label for="preset-correctness">Correctness</label>
						</div>
						<div>
							<input type="radio" id="preset-performance" name="preset" value="performance" />
							<label for="preset-performance">Performance</label>
						</div>
						<div>
							<input type="radio" id="preset-maintainability" name="preset" value="maintainability" />
							<label for="preset-maintainability">Maintainability</label>
						</div>
					</fieldset>
				</div>
			</div>
			<div class="pane">
				<div class="pane-header">
					<label for="input-css" class="pane-title">CSS input</label>
				</div>
				<div class="pane-content">
					<input type="hidden" name="input-css" id="input-css" value={css} />
					<Pre
						{css}
						selected_location={active_item === undefined
							? undefined
							: warning_to_css_location(css, lint_result?.result.warnings.at(active_item))}
						locations={lint_result?.result.warnings
							.filter((warning) => {
								if (
									warning.column === 1 &&
									warning.line === 1 &&
									typeof warning.endLine === 'number' &&
									warning.endLine > 1
								) {
									return false
								}
								return true
							})
							.map((warning) => warning_to_css_location(css, warning))}
					/>
				</div>
			</div>
			<div class="pane">
				<div class="pane-header">
					<label for="ast-output" class="pane-title">Stylelint output</label>
					<CopyButton variant="secondary" text={() => JSON.stringify(lint_result?.result, null, 2)}>
						Copy JSON
					</CopyButton>
				</div>
				<div class="pane-content">
					<output>
						{#if Array.isArray(lint_result?.result.warnings)}
							{#if lint_result.result.warnings.length === 0}
								<Empty>No stylelint issues found! 🎉</Empty>
							{:else}
								<Table>
									<caption class="sr-only">Stylelint errors</caption>
									<thead>
										<tr>
											<th class="numeric">Location</th>
											<!-- <th>Severity</th> -->
											<th>Message</th>
											<th>Rule</th>
										</tr>
									</thead>
									<tbody
										use:root={{
											onchange: on_change
										}}
									>
										{#each lint_result?.result.warnings as issue, index}
											<tr use:item={{ value: index }} aria-selected={active_item === index}>
												<td class="numeric">{issue.line}:{issue.column}</td>
												<!-- <td>
													<span class="severity">{issue.severity}</span>
												</td> -->
												<td>{issue.text.slice(0, issue.text.lastIndexOf('('))}</td>
												<td>{issue.rule}</td>
											</tr>
										{/each}
									</tbody>
								</Table>
							{/if}
						{/if}
					</output>
				</div>
			</div>
		</div>
	</div>
</form>

<p>
	active_item: {JSON.stringify(active_item)}
</p>

<style>
	/*
		Changes:
		- Spacing inside panel header
		- Margin in between panel header to decide where to split
		- added type=button to prettify css
	*/
	.ast-explorer {
		--wallace-pane-background-color: var(--bg-200);
		--wallace-ast-explorer-border-color: var(--bg-300);
		--wallace-ast-explorer-border-width: var(--space-px);
		--wallace-ast-explorer-pane-block-size: calc(100vh - 24rem);
		container-type: inline-size;
		container-name: --ast-explorer;
		border-width: var(--wallace-ast-explorer-border-width);
		border-color: var(--wallace-ast-explorer-border-color);
	}

	.panes {
		display: grid;
		align-items: stretch;

		@container --ast-explorer (min-width: 50rem) {
			grid-template-columns: max-content 1fr 1fr;
		}
	}

	.pane {
		background-color: light-dark(transparent, var(--wallace-pane-background-color));
		line-height: 2;
		block-size: 100%;
		display: grid;
		grid-template-rows: auto 1fr;

		&:not(:first-child) {
			border-inline-start-width: var(--wallace-ast-explorer-border-width);
			border-inline-start-color: var(--wallace-ast-explorer-border-color);
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

		@container --ast-explorer (min-width: 50rem) {
			block-size: var(--wallace-ast-explorer-pane-block-size);
		}
	}

	@layer linter {
		th {
			background-color: var(--wallace-pane-background-color);
		}

		td {
			white-space: nowrap;
			font-family: var(--font-mono);
			font-size: var(--size-specimen);
		}

		.severity {
			background-color: var(--error);
			color: var(--white);
			padding-inline: 1ch;
			padding-block: var(--space-1);
		}
	}
</style>
