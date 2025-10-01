<script lang="ts">
	import { CssAnalysisError } from '$lib/analyze-css.js'
	import Markdown from '$components/Markdown.svelte'

	interface Props {
		error: CssAnalysisError | Error | unknown | undefined
	}

	let { error }: Props = $props()
</script>

<Markdown>
	<div class="error">
		{#if error instanceof CssAnalysisError}
			<p>
				The CSS you are trying to analyze is giving some big-time syntax errors. Sadly, that's all we know at this time.
			</p>
		{:else}
			<p>Something bad has happened. Here is what you should do:</p>
			<ol class="mt-8 pl-6 list-disc">
				<li>Check that your URL is correct (if using the url input)</li>
				<li>
					Check that the URL you are pointing to is publicly accessible (some websites block scraping tools like Project
					Wallace)
				</li>
				<li>Provide the CSS via the CSS or file input instead of unsing a URL</li>
			</ol>
		{/if}
	</div>
</Markdown>

<style>
	.error {
		padding-block: var(--space-8);
		padding-inline: var(--space-8);
		background-color: var(--error-700);
		color: var(--error-100);
	}
</style>
