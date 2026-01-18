<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { parse_selector } from '@projectwallace/css-parser'
	import { calculateSpecificity, type Specificity } from '@projectwallace/css-analyzer'
	import Seo from '$components/Seo.svelte'
	import Panel from '$components/Panel.svelte'
	import Label from '$components/Label.svelte'
	import Markdown from '$components/Markdown.svelte'
	import FormGroup from '$components/FormGroup.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import SpecificityItem from './SpecificityItem.svelte'
	// @ts-expect-error No type definitions for importing images
	import Image from './og-image.png?w=1200'

	let input_ref: HTMLInputElement
	let has_error = $state(false)
	let result: { selector: string; specificity: Specificity }[] | undefined = $state()

	const DEFAULT_INPUT = '.kid :has(.friend) ~ :where(.treehouse) :is(#gross)'
	const PARAM = 'selectors'

	function calculate(value: string) {
		try {
			let ast = parse_selector(value)
			let specificities = calculateSpecificity(ast)
			let calculated: typeof result = []

			for (let i = 0; i < specificities.length; i++) {
				let specificity = specificities[i]
				let selector = ast.children[i]
				if (selector?.type_name === 'Selector' && specificity) {
					calculated.push({ selector: selector.text, specificity })
				}
			}

			// Only re-assign when the calculation was successful,
			// to avoid empty screens in between valid results
			result = calculated
			has_error = false
		} catch (error) {
			// fail silently, we expect errors on incomplete/incorrect selectors
			has_error = true
		}
	}

	/**
	 * Opposed to calculating the specificity, we *always* want to update the URL
	 * with the current input value because the analyzer might be outdated and not
	 * be able to calculate the specificity of the input but we still want to share
	 * the URL.
	 */
	async function update_url(value: string) {
		let new_params = new URLSearchParams(page.url.searchParams)
		if (value.trim() === '') {
			new_params.delete(PARAM)
		} else {
			new_params.set(PARAM, value)
		}
		await goto(`?${new_params.toString()}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		})
	}

	async function on_input() {
		let input = input_ref.value

		calculate(input)
		await update_url(input)
	}

	onMount(async () => {
		let param_input = new URLSearchParams(page.url.searchParams).get(PARAM)

		if (param_input) {
			input_ref.value = param_input
		} else {
			input_ref.value = DEFAULT_INPUT
		}

		calculate(input_ref.value)
		await update_url(input_ref.value)
	})
</script>

<Seo
	title="CSS Specificity Calculator"
	description="Quickly calculate the specifity of your selectors, including :where(), :has(), :is() and friends!"
	image={Image}
/>

<header>
	<Heading element="h1">CSS <em>Specificity</em> Calculator</Heading>
</header>

<Container size="2xl">
	<div class="content">
		<form onsubmit={(event) => event.preventDefault()}>
			<FormGroup>
				<Label for="selector-input">Selectors to analyze</Label>
				<!-- This is actually a good use case for autofocus -->
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					name="selectors"
					id="selector-input"
					placeholder=".my-selector, #another"
					required
					class="input"
					autofocus
					aria-describedby="specificity-explainer"
					oninput={on_input}
					bind:this={input_ref}
					defaultValue={DEFAULT_INPUT}
					aria-invalid={has_error ? 'true' : undefined}
					aria-errormessage="specificity-error"
				/>
				<p id="specificity-explainer">
					Use a comma to separate multiple selectors:
					<code>#selector1, .selector2</code>
				</p>
			</FormGroup>
		</form>

		{#if has_error}
			<p class="error" id="specificity-error" aria-live="assertive">
				Your selector specificity cannot be calculated. Please check your selector carefully for mistakes.
			</p>
		{/if}

		{#if result}
			<ol>
				{#each result as item}
					<Panel element="li">
						<SpecificityItem specificity={item.specificity} />
						<code class="language-css selector-string">{item.selector}</code>
					</Panel>
				{/each}
			</ol>

			<hr />
		{/if}

		<Container size="xl">
			<Markdown>
				<p>
					This analyzer is powered by <a rel="external" href="https://github.com/bramus/specificity"
						>@bramus/specificity</a
					>.
				</p>
				<p>
					There are other specificity calculators available that offer explanations, like
					<a href="https://polypane.app/css-specificity-calculator/" rel="external">the one from Polypane</a>. You
					should use that one if you want to know more about <em>how</em> specificity is calculated.
				</p>
			</Markdown>
		</Container>
	</div>
</Container>

<style>
	header {
		margin-block: var(--space-8);
		text-align: center;
	}

	.content {
		display: grid;
		gap: var(--space-12);
		margin-block-end: var(--space-16);
	}

	input {
		font-family: var(--font-mono);
	}

	.error {
		background-color: var(--red-600);
		padding-block: var(--space-4);
		padding-inline: var(--space-6);
		text-align: center;
	}

	ol {
		display: grid;
		gap: var(--space-4);
	}

	code.selector-string {
		display: block;
		padding: var(--space-4) var(--space-2);
		background-color: var(--bg-400);
		margin-top: var(--space-4);
		line-height: var(--leading-none);
	}

	hr {
		border-top: 1px solid var(--gray-600);
	}
</style>
