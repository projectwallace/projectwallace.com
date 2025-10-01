<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Hero from '$components/Hero.svelte'
	import Container from '$components/Container.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Form from '$components/css-form/Form.svelte'
	import Content from './content.md'
	import CustomPropertyInspector from '$components/custom-property-inspector/CustomPropertyInspector.svelte'
</script>

<Seo
	title="Analyze CSS Custom Property inspector"
	description="Detect potential bugs or find opportunities to lower your total CSS footprint."
/>

<Hero title="Custom Properties">
	<Container size="xl">
		<Form />
	</Container>
</Hero>

<Container>
	<CustomPropertyInspector />
</Container>

<Container size="xl">
	<Markdown class="my-24 max-w-sm mx-auto">
		<Content />
	</Markdown>
</Container>
