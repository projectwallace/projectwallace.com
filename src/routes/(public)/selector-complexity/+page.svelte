<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import parse from 'css-tree/parser'
	import { selectorComplexity } from '@projectwallace/css-analyzer'
	import Seo from '$components/Seo.svelte'
	import Panel from '$components/Panel.svelte'
	import Label from '$components/Label.svelte'
	import FormGroup from '$components/FormGroup.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import { page } from '$app/state'
	import type { SelectorList } from 'css-tree'

	let result: { value: string; complexity: number }[] | undefined = $state()
	let input_ref: HTMLInputElement
	let has_error = $state(false)

	const DEFAULT_INPUT = '.kid :has(.friend) ~ :where(.treehouse) :is(#gross)'
	const PARAM = 'selector'

	function calculate(value: string) {
		if (!value) {
			result = []
			has_error = false
			return
		}

		try {
			let ast = parse(value, {
				context: 'selectorList',
				positions: true
			}) as SelectorList

			if (ast.children?.size > 0) {
				result = []

				for (let node of ast.children) {
					if (node.type === 'Selector') {
						let complexity = selectorComplexity(node)
						result.push({
							value: value.substring(node.loc!.start.offset, node.loc!.end.offset),
							complexity: complexity
						})
					}
				}
				has_error = false
			}
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
	title="CSS Selector Complexity Calculator"
	description="Quickly calculate the complexity of your selectors, including :where(), :has(), :is() and friends!"
/>

<header>
	<Heading element="h1">CSS <em>Complexity</em> Calculator</Heading>
</header>

<Container size="2xl">
	<div class="content">
		<form onsubmit={(event) => event.preventDefault()}>
			<FormGroup>
				<Label for="selector-input">Selector to analyze</Label>
				<!-- This is actually a good use case for autofocus -->
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					name="selectors"
					id="selector-input"
					placeholder=".my-selector"
					required
					class="input"
					autofocus
					oninput={on_input}
					bind:this={input_ref}
					defaultValue={DEFAULT_INPUT}
					aria-invalid={has_error ? 'true' : undefined}
					aria-errormessage="complexity-error"
				/>
			</FormGroup>
		</form>

		{#if has_error}
			<p class="error" id="complexity-error" aria-live="assertive">
				Your selector complexity cannot be calculated. Please check your selector carefully for mistakes.
			</p>
		{/if}

		{#if !has_error && result}
			<ol>
				{#each result as { value, complexity }}
					<Panel element="li">
						<output>
							<span class="number" data-testid="complexity-result">
								{complexity}
							</span>
							<code>{value}</code>
						</output>
					</Panel>
				{/each}
			</ol>
		{/if}
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
		text-align: center;
		display: grid;
		gap: var(--space-4);
	}

	.number {
		font-size: var(--size-6xl);
		line-height: var(--leading-relaxed);
		font-weight: var(--font-ultrabold);
		display: block;
		text-align: center;
	}
</style>
