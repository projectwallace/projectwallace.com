<script lang="ts">
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Diff from '$lib/components/diff/CssDiff.svelte'
	import FormGroup from '$components/FormGroup.svelte'
	import Label from '$components/Label.svelte'
	import Textarea from '$components/css-form/Textarea.svelte'
	import Empty from '$lib/components/Empty.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Button from '$components/Button.svelte'
	import Icon from '$components/Icon.svelte'
	import { format } from '@projectwallace/format-css'
	import { HashState } from '$lib/url-hash-state.svelte'

	const PLACEHOLDER_OLD = format(`
		first {
			color: red;
		}

		#second {
			color: green;
		}
	`)
	const PLACEHOLDER_NEW = format(`
		first {
			color: blue;
		}

		.second {
			color: green;
		}
	`)

	let css_state = new HashState<{ old_css: string; new_css: string }>({
		old_css: PLACEHOLDER_OLD,
		new_css: PLACEHOLDER_NEW
	})

	function swap() {
		css_state.current = {
			old_css: css_state.current.new_css,
			new_css: css_state.current.old_css
		}
	}
</script>

<Seo
	title="CSS Diff viewer"
	description="Quickly compare two CSS files and see the line-by-line differences between them"
/>

<Container>
	<header>
		<Heading element="h1">
			<em>CSS</em> Diff
		</Heading>
	</header>

	<form action="" onsubmit={(event) => event.preventDefault()}>
		<div class="before">
			<FormGroup>
				<Label for="old_css">CSS Before</Label>
				<Textarea resize="none" name="old_css" id="old_css" bind:value={css_state.current.old_css} />
			</FormGroup>
		</div>
		<div class="after">
			<FormGroup>
				<Label for="new_css">CSS After</Label>
				<Textarea resize="none" name="new_css" id="new_css" bind:value={css_state.current.new_css} />
			</FormGroup>
		</div>
		<div class="swap">
			<Button type="button" variant="secondary" onclick={swap}>
				<span class="sr-only">Swap before/after</span>
				<Icon name="swap" size={16} />
			</Button>
		</div>
		<output>
			{#if css_state.current.old_css.length > 0 && css_state.current.new_css.length > 0}
				<Diff old_css={css_state.current.old_css} new_css={css_state.current.new_css} />
			{:else}
				<div data-testid="empty-diff">
					<Empty>Fill in before and after CSS to view the diff</Empty>
				</div>
			{/if}
		</output>
	</form>

	<section class="[ markdown ] max-w-md my-24 mx-auto" data-testid="explainer">
		<Markdown>
			<h2>About this CSS diff</h2>
			<ul>
				<li>
					Both CSS inputs are <a href="https://github.com/projectwallace/format-css">formatted</a> before comparing them.
					This is necessary because only then you can be sure that there is only a single selector or declaration on a line.
					This makes comparing lines a lot easier.
				</li>
				<li>Only full lines are diff&rsquo;ed.</li>
				<li>Diffing happens 100% in your browser, no data is sent to our servers.</li>
				<li>Because diffing happens 100% in your browser it might stall if you give it loads of data.</li>
			</ul>
		</Markdown>
	</section>
</Container>

<style>
	header {
		text-align: center;
		margin-block: var(--space-8);
	}

	form {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		gap: var(--space-6);
		align-items: center;
	}

	.before {
		grid-column: 1 / 2;
		grid-row: 1 / 2;
	}

	.after {
		grid-column: 3 / 4;
		grid-row: 1 / 2;
	}

	.swap {
		grid-column: 2 / 3;
		grid-row: 1 / 2;
	}

	output {
		grid-column: 1 / -1;
	}
</style>
