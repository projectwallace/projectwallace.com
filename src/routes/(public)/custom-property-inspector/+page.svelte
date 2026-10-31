<script lang="ts">
	import Seo from '#lib/components/Seo.svelte'
	import Hero from '#lib/components/Hero.svelte'
	import Container from '#lib/components/Container.svelte'
	import Markdown from '#lib/components/Markdown.svelte'
	import Form from '#lib/components/css-form/Form.svelte'
	import Content from './content.md'
	import CustomPropertyInspector from '#lib/components/custom-property-inspector/CustomPropertyInspector.svelte'
</script>

<Seo
	title="Analyze CSS Custom Property inspector"
	description="Detect potential bugs or find opportunities to lower your total CSS footprint."
/>

<Hero>
	<Form title="Custom Properties" />
</Hero>

<Container>
	<CustomPropertyInspector />
</Container>

<Container size="xl">
	<Markdown class="my-24 max-w-sm mx-auto">
		<Content />
	</Markdown>
</Container>
