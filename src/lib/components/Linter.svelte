<script lang="ts">
	import Empty from './Empty.svelte'
	import Table from './Table.svelte'
	import LintPre from './LintPre.svelte'
	import { create_keyboard_list, type OnChange } from './use-keyboard-list.svelte'
	import type { Warning } from 'stylelint'
	import Button from './Button.svelte'
	import CopyButton from '$components/CopyButton.svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { format_number } from '$lib/format-number'
	import { presets, type Preset, DEFAULT_PRESET } from '$lib/lint-preset'
	import PanedLayout from './PanedLayout.svelte'
	import Pane from './Pane.svelte'

	let {
		elements: { root, item }
	} = create_keyboard_list({
		scroll_selected_item_into_view: false
	})

	type LintResult = {
		result: {
			errored: boolean
			parse_error: Warning | undefined
			warnings: Warning[]
		}
		duration: number
		css?: string
		rules?: Record<string, unknown>
	}

	type Props = {
		css?: string
		url?: string
		prettify?: boolean
		onloading?: (loading: boolean) => void
	}

	type Status =
		// Nothing happened yet
		| 'idle'
		// Fetching CSS and lint result from server
		| 'loading'
		// Fetching and linting worked
		| 'success'
		// Fetch worked, but linting gave an error
		| 'lint_error'
		// Fetch may have failed, or some other generic error
		| 'error'

	let { css = '', url = undefined, prettify = true, onloading = undefined }: Props = $props()

	const preset_param = browser ? (page.url.searchParams.get('preset') as Preset | null) : null
	let preset = $state<Preset>(
		preset_param && (presets as readonly string[]).includes(preset_param) ? preset_param : DEFAULT_PRESET
	)
	let lint_result = $state<LintResult | undefined>()
	let api_css = $state<string | undefined>()
	let display_css = $derived(url && api_css ? api_css : css)
	let status = $state<Status>('idle')
	let active_item = $state<number | undefined>()

	async function run_lint() {
		lint_result = undefined
		active_item = undefined
		status = 'loading'
		onloading?.(true)
		try {
			const body = url ? { url, preset, prettify } : { css, preset }
			const response = await fetch('/api/lint-css', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
			if (response.ok) {
				lint_result = await response.json()
				if (lint_result?.css) {
					api_css = lint_result.css
				}
				status = lint_result?.result.parse_error ? 'lint_error' : 'success'
			} else {
				status = 'error'
			}
		} catch {
			status = 'error'
		} finally {
			onloading?.(false)
		}
	}

	$effect(() => {
		if (url || css.length > 0) {
			run_lint()
		}
	})

	const on_change: OnChange = ({ active_index }) => {
		active_item = active_index
	}

	function on_preset_change() {
		const updated_url = new URL(page.url)
		updated_url.searchParams.set('preset', preset)
		goto(updated_url, { replaceState: true, noScroll: true })
		run_lint()
	}
</script>

<PanedLayout columns="max-content minmax(auto, 60ch) minmax(2rem, 1fr)" pane_block_size="calc(100vb - 24rem)">
	<Pane>
		{#snippet pane_header()}
			<div class="pane-title">Options</div>
		{/snippet}
		<fieldset onchange={on_preset_change}>
			<legend>Preset</legend>
			<div class="radio-field">
				<input type="radio" id="preset-recommended" name="preset" value="recommended" bind:group={preset} />
				<label for="preset-recommended">Recommended</label>
			</div>
			<div>
				<input type="radio" id="preset-correctness" name="preset" value="correctness" bind:group={preset} />
				<label for="preset-correctness">Correctness</label>
			</div>
			<div>
				<input type="radio" id="preset-performance" name="preset" value="performance" bind:group={preset} />
				<label for="preset-performance">Performance</label>
			</div>
			<div>
				<input type="radio" id="preset-maintainability" name="preset" value="maintainability" bind:group={preset} />
				<label for="preset-maintainability">Maintainability</label>
			</div>
			<div>
				<input type="radio" id="preset-design-tokens" name="preset" value="designtokens" bind:group={preset} />
				<label for="preset-design-tokens">Design tokens</label>
			</div>
			<div>
				<input type="radio" id="preset-holistic" name="preset" value="holistic" bind:group={preset} />
				<label for="preset-holistic">Holistic</label>
			</div>
		</fieldset>
	</Pane>
	<Pane flush>
		{#snippet pane_header()}
			<div class="pane-title">CSS input</div>
			{#if status === 'success' || status === 'lint_error'}
				<Button
					element="a"
					variant="secondary"
					size="sm"
					icon="file"
					href={`data:text/css;charset=utf-8,${encodeURIComponent(display_css)}`}
					download="projectwallace-stylelint-css.css"
				>
					Download CSS
				</Button>
				<CopyButton variant="secondary" text={() => display_css}>Copy CSS</CopyButton>
			{/if}
		{/snippet}
		<LintPre
			css={display_css}
			warnings={lint_result?.result.warnings ?? []}
			selected_warning={active_item !== undefined ? lint_result?.result.warnings?.at(active_item) : undefined}
		/>
	</Pane>
	<Pane flush={status === 'success'}>
		{#snippet pane_header()}
			<label for="lint-output" class="pane-title">Stylelint output</label>
			{#if status === 'success' || status === 'lint_error'}
				<Button
					element="a"
					variant="secondary"
					size="sm"
					icon="file"
					href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lint_result?.result, undefined, 2))}`}
					download="projectwallace-stylelint-result.json"
				>
					Download JSON
				</Button>
				<CopyButton variant="secondary" text={() => JSON.stringify(lint_result?.result, undefined, 2)}>
					Copy JSON
				</CopyButton>
			{/if}
		{/snippet}
		<output id="lint-output">
			{#if status === 'loading'}
				<Empty aria-live="polite">Linting, please wait&hellip;</Empty>
			{:else if status === 'error'}
				<Empty aria-live="assertive">
					Something went wrong. Check if the CSS you're analyzing is correct and maybe try again.
				</Empty>
			{:else if status === 'lint_error'}
				<Empty aria-live="assertive">
					Could not lint CSS: {lint_result?.result.parse_error?.text} (line {format_number(
						lint_result?.result.parse_error?.line ?? 0
					)})
				</Empty>
			{:else if Array.isArray(lint_result?.result.warnings)}
				{#if lint_result.result.warnings.length === 0}
					<Empty>No stylelint issues found! 🎉</Empty>
				{:else}
					<Table>
						<caption class="sr-only">Stylelint errors</caption>
						<thead>
							<tr>
								<th class="numeric">Location</th>
								<th>Message</th>
								<th>Rule</th>
							</tr>
						</thead>
						<tbody use:root={{ onchange: on_change }}>
							{#each lint_result?.result.warnings as issue, index}
								<tr use:item={{ value: index }} aria-selected={active_item === index}>
									<td class="numeric">{issue.line}:{issue.column}</td>
									<td>{issue.text.slice(0, issue.text.lastIndexOf('('))}</td>
									<td>{issue.rule.slice('projectwallace/'.length)}</td>
								</tr>
							{/each}
						</tbody>
					</Table>
				{/if}
			{/if}
		</output>
	</Pane>
</PanedLayout>

<style>
	legend {
		font-weight: var(--font-bold);
	}

	th {
		background-color: var(--bg-200);
	}
</style>
