<script lang="ts">
	import CopyButton from '#lib/components/CopyButton.svelte'
	import Textarea from '#lib/components/css-form/Textarea.svelte'
	import Label from '#lib/components/Label.svelte'
	import Button from '#lib/components/Button.svelte'
	import { format_filesize } from '#lib/format-filesize.ts'
	import { minify } from '@projectwallace/format-css'
	import { highlight_css } from '#lib/components/use-css-highlight.ts'
	import { HashState } from '#lib/url-hash-state.svelte.ts'
	import { format_percentage } from '#lib/format-number.ts'

	let state = new HashState<string>('')
	let css = $derived(state.current)
	let result = $derived(minify(css))
	let filesize_diff_bytes = $derived(result.length - css.length)
	let filesize_diff_ratio = $derived(result.length / css.length - 1)
</script>

<div class="page">
	<form method="POST" onsubmit={(event) => event.preventDefault()}>
		<div class="header">
			<Label for="css-input">CSS input</Label>
			{#if css.length > 0}
				<span class="sr-only">Input size:</span>
				<span class="css-size">{format_filesize(css.length)}</span>
				<CopyButton text={css}>Copy <span class="sr-only">input</span> CSS</CopyButton>
			{/if}
		</div>
		<Textarea name="css-input" id="css-input" bind:value={state.current} required auto_grow />
		<Button size="lg" type="submit">Minify CSS</Button>
	</form>

	<div class="output">
		<div class="header">
			<Label for="css-output">Minified CSS</Label>
			{#if result.length > 0}
				<span class="sr-only">Output size:</span>
				<span class="css-size">{format_filesize(result.length)}</span>
				{#if result.length >= css.length}
					<span>
						(+{format_filesize(filesize_diff_bytes)} | +{format_percentage(filesize_diff_ratio)})
					</span>
				{:else}
					<span>
						({format_filesize(filesize_diff_bytes)} | {format_percentage(filesize_diff_ratio)})
					</span>
				{/if}
				<CopyButton text={result}>Copy <span class="sr-only">minified</span> CSS</CopyButton>
			{/if}
		</div>
		<div class="css-output scroll-container" aria-label="Minified CSS">
			{#key result}
				<code use:highlight_css={{ css: result }}>{result}</code>
			{/key}
		</div>
	</div>
</div>

<style>
	.page {
		--pre-overflow-behavior: auto;
		display: grid;
		gap: var(--space-8);
		align-items: start;

		@media (min-width: 33rem) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	form,
	.output {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		align-items: stretch;
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-2);
		row-gap: var(--space-1);
		align-items: baseline;

		:global(> :last-child:not(:only-child)) {
			margin-inline-start: auto;
		}
	}

	.css-size {
		margin-inline-start: var(--space-2);
		display: inline-block;
	}

	.css-output {
		min-block-size: var(--space-64);
		max-block-size: 66vb;
		border-width: var(--border-width-1);
		border-style: var(--border-style-solid);
		border-color: var(--fg-450);
		background-color: var(--bg-200);
		overflow-y: auto;
	}

	code {
		display: block;
		padding: var(--space-2);
		white-space: pre-wrap;
		word-break: break-all;
		font-size: var(--size-specimen);
		font-family: var(--font-mono);
	}
</style>
