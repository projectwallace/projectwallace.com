<script lang="ts">
	import Seo from '$lib/components/Seo.svelte'
	import Container from '$lib/components/Container.svelte'
	import Form from '$components/css-form/Form.svelte'
	import LayersVisualizer from '$components/css-layers-visualizer/LayersVisualizer.svelte'
	import Content from './content.md'
	import Markdown from '$components/Markdown.svelte'
	import Hero from '$components/Hero.svelte'
	import { get_css_state } from '$lib/css-state.svelte'

	let css_state = get_css_state()
</script>

<Seo title="CSS Cascade Layers Visualizer" description="See how your Cascade Layers are composed." />

<Hero title="CSS @layer Visualizer" github_link="https://github.com/projectwallace/css-layer-tree">
	<Container size="xl">
		<Form />
	</Container>
</Hero>

<LayersVisualizer origins={css_state.origins} prettify_css_before_analyze={css_state.should_prettify} />

<Container size="lg">
	<Markdown class="my-16">
		<Content />
	</Markdown>
</Container>
