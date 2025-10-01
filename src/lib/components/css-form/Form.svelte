<script lang="ts">
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import type { FormSuccessEvent } from './types'
	import FormGroup from '$components/FormGroup.svelte'
	import Label from '$components/Label.svelte'
	import Button from '$components/Button.svelte'
	import CssLoadingProgressBar from '$components/CssLoadingProgressBar.svelte'
	import InputModeSwitcher from './InputModeSwitcher.svelte'
	import Textarea from './Textarea.svelte'
	import UrlInput from './UrlInput.svelte'
	import FileInput from './FileInput.svelte'
	import { get_css, type CssFetchNetworkError, type CssFetchApiError, type CssFetchRemoteError } from '$lib/get-css'
	import { get_css_state } from '$lib/css-state.svelte'
	import { IsOnline } from '$lib/is-online.svelte'

	interface Props {
		on_success?: (result: FormSuccessEvent) => void
		on_error?: (error: Error) => void
	}

	function noop() {}

	let { on_success = noop, on_error = noop }: Props = $props()

	let status: 'idle' | 'fetching' | 'error' = $state('idle')
	let error: Error | undefined = $state()
	let url = $state('')
	let css_state = get_css_state()
	let prettify = $state(page.url.searchParams.has('prettify') ? page.url.searchParams.get('prettify') === '1' : true)
	let is_online = new IsOnline()

	$effect(() => {
		css_state.prettify(prettify)
	})

	function refocus(form: HTMLFormElement) {
		let button = form.querySelector('button[type=submit]') as HTMLElement | null
		if (button !== null) {
			button.focus()
		}
	}

	async function on_submit_raw(event: SubmitEvent) {
		event.preventDefault()
		let form_data = new FormData(event.target as HTMLFormElement)
		let input_val = form_data.get('raw-css')
		let val = String(input_val)

		// Remove ?url= and prettify= query parameters from the URL
		let cleaned_url = page.url
		cleaned_url.searchParams.delete('url')
		cleaned_url.searchParams.delete('prettify')
		cleaned_url.hash = ''
		await goto(cleaned_url, { replaceState: true })

		status = 'idle'

		prettify = form_data.get('prettify') === '1'
		on_success({
			origins: [{ css: val, type: 'raw' }],
			submit_type: 'raw',
			prettify
		})
		refocus(event.target as HTMLFormElement)
		css_state.set_origins([{ css: val, type: 'raw' }])
		css_state.url = undefined
	}

	async function on_submit_url(event: SubmitEvent) {
		event.preventDefault()
		if (status === 'fetching') return
		status = 'fetching'

		let form_data = new FormData(event.target as HTMLFormElement)
		let url = String(form_data.get('url'))
		if (!url) return

		// Always update the URL, so people can share the URL
		let page_url = page.url
		page_url.searchParams.set('url', url)
		page_url.searchParams.set('prettify', form_data.get('prettify') === '1' ? '1' : '0')
		page_url.hash = ''
		await goto(page_url, { replaceState: true })

		try {
			let origins = await get_css(url)
			status = 'idle'

			prettify = form_data.get('prettify') === '1'
			css_state.prettify(prettify)
			css_state.set_origins(origins)
			css_state.url = url
			on_success({
				origins,
				submit_type: 'url',
				prettify
			})
		} catch (err: unknown) {
			status = 'error'
			error = err as CssFetchNetworkError | CssFetchApiError | CssFetchRemoteError
			on_error(error)
		}
		refocus(event.target as HTMLFormElement)
	}

	async function on_submit_file(event: SubmitEvent) {
		event.preventDefault()
		let form_data = new FormData(event.target as HTMLFormElement)
		let input_json = form_data.get('file-css-rendered')
		let input_files = JSON.parse(String(input_json))
		let origins = []

		try {
			origins = input_files.map((file: { name: string; css: string }) => {
				return { css: file.css, type: 'local-file', name: file.name }
			})
		} catch (err) {
			// fail silently
		}

		// Remove ?url= and prettify= query parameters from the URL
		let cleaned_url = page.url
		cleaned_url.searchParams.delete('url')
		cleaned_url.searchParams.delete('prettify')
		cleaned_url.hash = ''
		await goto(cleaned_url, { replaceState: true })

		status = 'idle'

		prettify = form_data.get('prettify') === '1'
		on_success({
			origins,
			submit_type: 'file',
			prettify
		})
		css_state.set_origins(origins)
		css_state.url = undefined
		refocus(event.target as HTMLFormElement)
	}

	$effect(() => {
		let url_settings = page.url.searchParams
		let preload_url = url_settings.get('url')

		if (preload_url) {
			url = preload_url
		}

		let preload_prettify = url_settings.get('prettify')
		if (preload_prettify !== null) {
			prettify = preload_prettify === '1'
		}
	})

	async function on_prettify_change(event: Event) {
		prettify = (event.target as HTMLInputElement).checked
		page.url.searchParams.set('prettify', prettify ? '1' : '0')
		await goto(page.url, { replaceState: true })
	}
</script>

<InputModeSwitcher>
	{#snippet url_tab()}
		<form method="GET" class="form url-form" onsubmit={on_submit_url}>
			<FormGroup>
				<Label for="url">URL to analyze</Label>
				<UrlInput
					name="url"
					id="url"
					valid={status === 'error'}
					described_by={status === 'error' ? 'invalid-url-error-msg' : undefined}
					bind:url
				/>
				{#if status === 'fetching'}
					<div class="loader">
						<CssLoadingProgressBar />
					</div>
				{/if}
			</FormGroup>
			{#if status === 'error' && error}
				<p data-testid="form-url-error" id="invalid-url-error-msg" class="error-msg">{error.message}</p>
			{/if}
			<div class="option">
				<input
					type="checkbox"
					name="prettify"
					id="prettify-raw"
					value="1"
					onchange={on_prettify_change}
					checked={prettify}
				/>
				<Label for="prettify-raw" size="sm">Prettify CSS?</Label>
				<p>Prettifying makes inspecting the CSS easier, but very slighty changes the numbers.</p>
			</div>
			<div class="submit">
				<Button type="submit" size="lg">
					{#if status === 'fetching'}
						Fetching CSS&hellip;
					{:else}
						Analyze URL
					{/if}
				</Button>
			</div>
			{#if !is_online.current}
				<p class="error-msg" data-testid="offline-message">You are offline. Analyzing a URL will not work, but you can still analyze files or input directly.</p>
			{/if}
		</form>
	{/snippet}

	{#snippet file_tab()}
		<form method="POST" onsubmit={on_submit_file}>
			<FormGroup>
				<Label for="file-css">File to analyze</Label>
				<FileInput name="file-css" id="file-css" />
			</FormGroup>
			<div class="option">
				<input
					type="checkbox"
					name="prettify"
					id="prettify-raw"
					value="1"
					onchange={on_prettify_change}
					checked={prettify}
				/>
				<Label for="prettify-raw" size="sm">Prettify CSS?</Label>
				<p>Prettifying makes inspecting the CSS easier, but very slighty changes the numbers.</p>
			</div>
			<Button type="submit" size="lg">Analyze CSS</Button>
		</form>
	{/snippet}

	{#snippet raw_tab()}
		<form method="POST" onsubmit={on_submit_raw}>
			<FormGroup>
				<Label for="raw-css">CSS to analyze</Label>
				<Textarea name="raw-css" id="raw-css" wrap_lines required />
			</FormGroup>
			<div class="option">
				<input
					type="checkbox"
					name="prettify"
					id="prettify-raw"
					value="1"
					onchange={on_prettify_change}
					checked={prettify}
				/>
				<Label for="prettify-raw" size="sm">Prettify CSS?</Label>
				<p>Prettifying makes inspecting the CSS easier, but very slighty changes the numbers.</p>
			</div>
			<Button type="submit" size="lg">Analyze CSS</Button>
		</form>
	{/snippet}
</InputModeSwitcher>

<style>
	form {
		display: grid;
		gap: var(--space-4);
		font-size: var(--size-base);
	}

	.form {
		display: grid;
		gap: var(--space-4);
	}

	.url-form {
		grid-template-columns: 1fr max-content;
	}

	.url-form .submit {
		grid-row: 1;
		grid-column: 2;
		align-self: end;
	}

	.url-form .option {
		grid-row: 2;
		grid-column: 1 / -1;
	}

	.error-msg {
		color: var(--error-300);
		font-weight: var(--font-medium);
		grid-column: 1 / -1;
	}

	.loader {
		position: absolute;
		bottom: -0.75rem; /* Arbitrary length that just looks good */
		left: 0px; /* Accomodate for 1px border of the input */
		right: 0px;
	}
</style>
