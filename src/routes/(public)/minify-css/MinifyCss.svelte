<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte'
	import Textarea from '$components/css-form/Textarea.svelte'
	import Label from '$lib/components/Label.svelte'
	import Button from '$lib/components/Button.svelte'
	import { format_filesize } from '$lib/format-filesize'
	import { minify } from '@projectwallace/format-css'
	import { highlight_css } from '$components/use-css-highlight'

	let css = $state('')
	let result = $derived(minify(css))
	let filesize_diff = $derived(format_filesize(result.length - css.length))
</script>

<div class="page">
	<form method="POST" onsubmit={(event) => event.preventDefault()}>
		<div>
			<Label for="css-input">CSS input</Label>
			{#if css.length > 0}
				<span class="sr-only">Input size:</span>
				<span class="ml-2">{format_filesize(css.length)}</span>
			{/if}
		</div>
		<Textarea name="css-input" id="css-input" bind:value={css} required />
		<Button size="lg">Minify CSS</Button>
	</form>

	<div class="output">
		<div>
			<Label for="css-output">Minified CSS</Label>
			{#if result.length > 0}
				<span class="sr-only">Output size:</span>
				<span class="ml-2">{format_filesize(result.length)}</span>
				{#if result.length > css.length}
					<span>(+{filesize_diff})</span>
				{:else}
					<span>({filesize_diff})</span>
				{/if}
			{/if}
		</div>
		<div class="css-output scroll-container" aria-label="Minified CSS">
			{#key result}
				<code use:highlight_css={{ css: result }}>{result}</code>
			{/key}
		</div>
		{#if result.length > 0}
			<div class="toolbar">
				<CopyButton text={result}>Copy CSS</CopyButton>
			</div>
		{/if}
	</div>
</div>

<style>
	.page {
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
		gap: var(--space-4);
		align-items: stretch;
	}

	.toolbar {
		text-align: right;
	}

	.css-output {
		height: var(--space-64);
		border: 1px solid var(--fg-450);
		background-color: var(--bg-200);
		overflow-y: auto;
	}

	code {
		display: block;
		padding: var(--space-2);
		white-space: pre-wrap;
		word-break: break-all;
		font-size: var(--size-xs);
		font-family: var(--font-mono);
	}
</style>
