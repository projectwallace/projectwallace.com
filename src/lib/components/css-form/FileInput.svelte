<script lang="ts">
	import { format_filesize } from '$lib/format-filesize'

	interface Props {
		name: string
		id: string
	}

	let { name, id }: Props = $props()

	type File = {
		name: string
		css: string
		size: number
	}

	function slice(str: string, maxLen: number, maxLines: number) {
		let new_str = ''
		for (let char of str) {
			if (char === '\n' || char === '\r') {
				maxLines--
				if (maxLines === 0) {
					break
				}
			}
			if (new_str.length >= maxLen) {
				break
			}
			new_str += char
		}
		return new_str
	}

	let input: HTMLInputElement | undefined = $state()
	let files: File[] = $state([])
	let serialized_files = $state('')

	$effect(() => {
		try {
			serialized_files = JSON.stringify(files)
		} catch (error) {
			console.error('Error serializing files:', error)
		}
	})

	async function update_file_list(event: Event) {
		let input = event.target as HTMLInputElement
		files = []

		if (input.files) {
			for (let file of input.files) {
				if (!file.type.includes('css')) {
					console.warn('File is not a CSS file:', file.type, file.name, file.size)
					continue
				}

				let css = await file.text()

				files.push({
					name: file.name,
					css,
					size: file.size
				})
			}
		}
	}
</script>

<div class="group">
	<div>
		<input type="file" multiple required accept=".css" bind:this={input} {name} {id} onchange={update_file_list} />
		<input type="hidden" name={`${name}-rendered`} value={serialized_files} />
	</div>

	{#if files.length > 0}
		<ul class="scroll-container">
			{#each files as file (file.name)}
				<li data-testid="file-preview">
					<div class="file-details">
						<div class="file-name">{file.name}</div>
						<b class="file-size">({format_filesize(file.size)})</b>
					</div>
					<pre dir="ltr" translate="no"><code class="language-css specimen">{slice(file.css, 200, 3)}</code></pre>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.group {
		display: grid;
		gap: var(--space-4);
	}

	input[type='file'] {
		display: flex;
		width: 100%;
		padding: var(--space-8);
		border: 2px dashed var(--bg-400);
		text-align: center;
		background-color: var(--bg-100);
		transition: border-color 0.1s ease-out;

		&:hover {
			border-color: var(--bg-500);
		}
	}

	ul {
		display: grid;
		gap: var(--space-3);
		max-height: var(--space-72);
		overflow: auto;
		overscroll-behavior: contain;
	}

	li {
		display: grid;
		gap: var(--space-2);
		background-color: var(--bg-100);
	}

	.file-details {
		display: flex;
		flex-wrap: nowrap;
		gap: var(--space-3);
		justify-content: space-between;
		background-color: var(--bg-200);
		padding: var(--space-1) var(--space-2);
	}

	.file-name {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: var(--font-bold);
	}

	.file-size {
		font-weight: var(--font-medium);
	}

	pre {
		white-space: pre;
		overflow: hidden;
		padding: var(--space-1) var(--space-2);
	}
</style>
