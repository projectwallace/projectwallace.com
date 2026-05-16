<script lang="ts">
	import CopyButton from '$lib/components/CopyButton.svelte'
	import Textarea from '$components/css-form/Textarea.svelte'
	import Label from '$lib/components/Label.svelte'
	import Button from '$lib/components/Button.svelte'
	import { format_filesize } from '$lib/format-filesize'
	import { format } from '@projectwallace/format-css'
	import Pre from '$components/Pre.svelte'
	import { HashState } from '$lib/url-hash-state.svelte'

	let state = new HashState<{ css: string; use_spaces: boolean; indent_size: number }>({
		css: '',
		use_spaces: false,
		indent_size: 2
	})
	let { css, use_spaces } = $derived(state.current)
	let result = $derived(
		format(css, {
			tab_size: use_spaces ? 2 : undefined
		})
	)
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
		<Textarea
			name="css-input"
			id="css-input"
			bind:value={state.current.css}
			required
			wrap_lines
			auto_grow
			rows={16}
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

		<Button size="lg">Prettify CSS</Button>
	</form>

	<div class="output">
		<div>
			<Label for="css-output">Prettified CSS</Label>
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
		<div class="css-output" aria-label="Prettified CSS">
			<Pre css={result} />
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
		height: var(--space-96);
		border: 1px solid var(--fg-450);
		overflow-y: auto;
		background-color: var(--bg-200);
	}

	.indent-size {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: space-between;
		align-items: center;
	}
</style>
