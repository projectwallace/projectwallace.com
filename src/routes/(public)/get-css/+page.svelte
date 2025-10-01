<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import Hero from '$lib/components/Hero.svelte'
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Button from '$lib/components/Button.svelte'
	import CopyButton from '$lib/components/CopyButton.svelte'
	import Pre from '$components/Pre.svelte'
	import Label from '$lib/components/Label.svelte'
	import UrlInput from '$components/css-form/UrlInput.svelte'
	import FormGroup from '$lib/components/FormGroup.svelte'
	import { get_css } from '$lib/get-css'
	import { get_css_state } from '$lib/css-state.svelte'
	import NetworkPanel from '$components/NetworkPanel.svelte'
	import Markdown from '$components/Markdown.svelte'
	import { IsOnline } from '$lib/is-online.svelte'

	const STATUS = {
		INITIAL: 'initial',
		PENDING: 'pending',
		DONE: 'done',
		ERROR: 'error',
		REMOTE_ERROR: 'remoteError'
	}

	let css_state = get_css_state()
	let errorMessage = ''
	let value = $state('')
	let status = $state(css_state.css.length > 0 ? STATUS.DONE : STATUS.INITIAL)
	let is_online = new IsOnline()

	onMount(() => {
		let url_settings = page.url.searchParams
		let preload_url = url_settings.get('url')

		if (preload_url) {
			value = preload_url
		}

		let prettify = url_settings.get('prettify')
		if (prettify !== null) {
			css_state.should_prettify = prettify !== '0'
		}
	})

	async function on_submit(event: SubmitEvent) {
		event.preventDefault()

		if (value.trim().length === 0) {
			return
		}

		if (status === STATUS.PENDING) return

		status = STATUS.PENDING

		// Update URL
		let new_url = page.url
		new_url.searchParams.set('url', value)
		await goto(new_url, {
			replaceState: true
		})

		try {
			let result = await get_css(value)
			css_state.set_origins(result)
			css_state.url = value
			status = STATUS.DONE
		} catch (err: unknown) {
			status = STATUS.ERROR
		}
	}

	async function on_prettify_change(event: Event) {
		let prettify = (event.target as HTMLInputElement).checked
		css_state.prettify(prettify)
		page.url.searchParams.set('prettify', prettify ? '1' : '0')
		await goto(page.url, { replaceState: true })
	}
</script>

<Seo title="Scrape CSS" description="Online CSS scraper that also shows all the types of CSS and their origins." />

<Hero title="CSS Scraper">
	<Container size="xl">
		<form onsubmit={on_submit} class="form">
			<FormGroup>
				<Label for="url-input">URL to crawl</Label>
				<UrlInput name="url" id="url-input" bind:url={value} />
			</FormGroup>

			<div class="option">
				<input
					type="checkbox"
					name="prettify"
					id="prettify-url"
					value="1"
					onchange={on_prettify_change}
					checked={css_state.should_prettify}
				/>
				<Label for="prettify-url" size="sm">Prettify CSS?</Label>
				<p>Prettifying makes inspecting the CSS easier.</p>
			</div>

			<Button size="lg">
				{#if status === STATUS.PENDING}
					Fetching&hellip;
				{:else}
					Crawl URL
				{/if}
			</Button>

			{#if !is_online.current}
				<p class="error-msg" data-testid="offline-message">You are offline.</p>
			{/if}
		</form>
	</Container>
</Hero>

<Container>
	<div class="output">
		<header>
			<Label for="scraped-css">Scraped CSS</Label>
			{#if status === STATUS.DONE}
				<CopyButton text={css_state.css}>Copy CSS</CopyButton>
			{/if}
		</header>
		<div class="result">
			<div class="pre-wrapper">
				<Pre css={css_state.css} line_numbers />
			</div>
			{#if css_state.origins.length > 0}
				<div class="network-wrapper">
					<NetworkPanel />
				</div>
			{/if}
		</div>
	</div>

	{#if status === STATUS.ERROR || status === STATUS.REMOTE_ERROR}
		<p class="error">
			{#if status === STATUS.ERROR}
				Something went wrong
			{:else if status === STATUS.REMOTE_ERROR}
				{errorMessage}
			{/if}
		</p>
	{/if}
</Container>

<Container size="md">
	<Markdown>
		<p>This CSS scraper loads the HTML of your website and goes through all the <code>&lt;link&gt;</code> and <code>&lt;style&gt;</code> tags to (recursively) find CSS.</p>

		<ol>
			<li>Load the HTML for the URL you fill in</li>
			<li>Find all <code>&lt;link rel="stylesheet"&gt;</code> tags and load the CSS from the <code>href</code> URL</li>
			<li>Find all <code>&lt;style&gt;</code> tags and extract the CSS from it's contents</li>
			<li>Find all CSS <code>@import</code> statements in the CSS we just loaded and load the CSS from the <code>@import</code>'s URL</li>
			<li>Go through all the DOM elements that have a non-empty <code>style="&hellip;"</code> attribute. Create a CSS Ruleset for each DOM node and add it to 1 single origin that contains all inline styles.</li>
			<li>Combine all the CSS</li>
		</ol>

		<p>Once it's on the page here you can inspect each separate CSS origin in the Network Panel. From there you can see what we found and where it originated from. It also shows the <code>media</code> type in case of a <code>&lt;link&gt;</code> tag, as well as the <code>rel="&hellip;"</code>. For all origins it shows the total filesize.</p>

		<hr>

		<p>If you want to learn more about CSS scraping you can read it in our blog post <a href="/blog/ways-to-scrape-css">3 ways to scrape CSS from a website</a>. Here we explain the possible angles and the pros and cons of each approach.</p>
	</Markdown>
</Container>

<style>
	.form {
		display: grid;
		grid-template-columns: 1fr max-content;
		grid-template-rows: repeat(2, auto);
		gap: var(--space-2) var(--space-3);
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		text-align: left;
	}

	.form :global(button) {
		grid-row: 1;
		grid-column: 2;
		align-self: end;
	}

	.form .option {
		grid-row: 2;
		grid-column: 1 / -1;
		font-size: var(--size-base);
	}

	.error-msg {
		text-align: start;
		color: var(--error-300);
		font-weight: var(--font-medium);
	}

	.output {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-8);

		header {
			display: flex;
			gap: var(--space-4);
			justify-content: space-between;
		}
	}

	.result {
		position: relative;
		display: grid;
		gap: var(--space-4);
	}

	.pre-wrapper {
		overflow: auto;
		min-height: var(--space-24);
		height: var(--space-96);
		border: 1px solid var(--gray-450);
		resize: vertical;
	}

	.network-wrapper {
		min-height: var(--space-96);
		border: 1px solid var(--gray-450);
	}

	.error {
		background-color: var(--red-900);
		color: var(--white);
		padding: var(--space-4);
		margin-top: var(--space-4);
		text-align: center;
	}
</style>
