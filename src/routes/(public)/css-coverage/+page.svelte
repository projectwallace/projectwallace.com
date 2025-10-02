<script lang="ts">
	import CoverageReport from '$components/coverage/Coverage.svelte'
	import type { Coverage } from '$components/coverage/types'
	import Label from '$components/Label.svelte'
	import Icon from '$components/Icon.svelte'
	import Seo from '$components/Seo.svelte'
	import * as v from 'valibot'
	import Content from './content.md'
	import Markdown from '$components/Markdown.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'

	let CoverageSchema = v.array(
		v.object({
			text: v.undefinedable(v.string()),
			url: v.string(),
			ranges: v.array(
				v.object({
					start: v.number(),
					end: v.number()
				})
			)
		})
	)

	let data: Coverage[] = $state([])

	function parse_json(input: string) {
		try {
			let parse_result = JSON.parse(input)
			v.parse(CoverageSchema, parse_result)
			return parse_result as Coverage[]
		} catch (error) {
			return [] as Coverage[]
		}
	}

	async function onchange(event: Event) {
		let files = (event.target as HTMLInputElement)?.files
		let new_data: Coverage[] = []

		if (!files) return

		for (let file of files) {
			// Skip non-JSON files
			if (file.type !== 'application/json') {
				continue
			}
			let text = await file.text()
			let parsed = parse_json(text)
			new_data = new_data.concat(parsed)
		}

		// only update state once to prevent hundreds of re-renders
		data = new_data
	}

	let drag_state: 'idle' | 'dragging' = $state('idle')

	async function load_example() {
		let { default: example_data } = await import('./example-coverage.json?raw')
		data = parse_json(example_data)
	}
</script>

<Seo
	title="CSS Coverage inspector"
	description="View CSS Coverage with prettified CSS, highlighting of uncovered lines, combining multiple files"
/>

<div class="app">
	<form method="POST" onsubmit={(e) => e.preventDefault()}>
		<Label for="coverage-file">Browser coverage export</Label>
		<input
			type="file"
			id="coverage-file"
			name="coverage-file"
			accept=".json"
			multiple
			{onchange}
			ondragenter={() => (drag_state = 'dragging')}
			ondragleave={() => (drag_state = 'idle')}
			ondragend={() => (drag_state = 'idle')}
			ondrop={() => (drag_state = 'idle')}
			data-drag-state={drag_state}
		/>
		<Container size="2xl">
			<Markdown>
				<p>
					How to <a
						href="https://developer.chrome.com/docs/devtools/coverage/"
						rel="noreferrer external"
						target="_blank">record CSS coverage</a
					>
					<Icon name="external" size={16} /> in your browser. After that, export the data as JSON and select or drop the
					file here. Or
					<button type="button" class="example" onclick={load_example}>load an example file</button>.
				</p>
			</Markdown>
		</Container>
	</form>

	{#if data.length > 0}
		<hr />
		<CoverageReport browser_coverage={data} />
	{/if}

	<Container size="2xl" class="text-center">
		<Heading element="h1">CSS Code Coverage inspector</Heading>
	</Container>
	<Container size="md">
		<Markdown>
			<Content />
		</Markdown>
	</Container>
</div>

<style>
	.app {
		padding: var(--space-4) var(--space-8);
		display: grid;
		gap: var(--space-8);
	}

	form {
		display: grid;
		gap: var(--space-3);
	}

	p {
		text-wrap: balance;
		max-width: none;
		text-align: center;
	}

	input[type='file'] {
		display: flex;
		width: 100%;
		padding: var(--space-8);
		border: 2px dashed var(--fg-700);
		text-align: center;
		background-color: var(--bg-200);
		transition: border-color 0.1s ease-out;

		&:hover {
			border-color: var(--bg-400);
		}

		&[data-drag-state='dragging'] {
			border-color: var(--accent);
		}
	}

	hr {
		border-top: 1px solid var(--fg-450);
	}

	.example {
		text-decoration: underline;
		color: var(--accent);
	}
</style>
