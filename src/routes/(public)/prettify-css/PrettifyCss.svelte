<script lang="ts">
	import CopyButton from '#lib/components/CopyButton.svelte'
	import Textarea from '#lib/components/css-form/Textarea.svelte'
	import Label from '#lib/components/Label.svelte'
	import Button from '#lib/components/Button.svelte'
	import { format_filesize } from '#lib/format-filesize.ts'
	import { format } from '@projectwallace/format-css'
	import Pre from '#lib/components/Pre.svelte'
	import { HashState } from '#lib/url-hash-state.svelte.ts'
	import { format_percentage } from '#lib/format-number.ts'

	let state = new HashState<{
		css: string
		use_spaces: boolean
		indent_size: number
	}>({
		css: '',
		use_spaces: false,
		indent_size: 2
	})
	let { css, use_spaces, indent_size } = $derived(state.current)
	let result = $derived(
		format(css, {
			tab_size: use_spaces ? Math.max(indent_size, 1) : undefined
		})
	)
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
		<Textarea
			name="css-input"
			id="css-input"
			bind:value={state.current.css}
			required
			wrap_lines
			auto_grow
			rows={14}
			placeholder={`html{font-size:100%}`}
		/>

		<div class="indent-size">
			<div class="indent-size-toggle">
				<input type="checkbox" id="use-spaces" bind:checked={state.current.use_spaces} />
				<label for="use-spaces">Use spaces for indentation</label>
			</div>

			<div class="indent-size-input">
				<label for="indent-size">Indent size</label>
				<input
					disabled={!use_spaces}
					class="input"
					type="number"
					id="indent-size"
					bind:value={state.current.indent_size}
					min="1"
				/>
			</div>
		</div>

		<Button size="lg" type="submit">Prettify CSS</Button>
	</form>

	<div class="output">
		<div class="header">
			<Label for="css-output">Prettified CSS</Label>
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
				<CopyButton text={result}>Copy <span class="sr-only">prettified</span> CSS</CopyButton>
			{/if}
		</div>
		<div class="css-output" aria-label="Prettified CSS">
			<Pre css={result} line_numbers />
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
		min-block-size: var(--space-96);
		border-width: var(--border-width-1);
		border-style: var(--border-style-solid);
		border-color: var(--fg-450);
		background-color: var(--bg-200);
		field-sizing: content;
	}

	.indent-size {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: space-between;
		align-items: center;
	}
</style>
