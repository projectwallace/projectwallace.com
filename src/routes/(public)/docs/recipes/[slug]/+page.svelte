<script>
	import Seo from '#lib/components/Seo.svelte'
	import MarkdownContent from '#lib/components/MarkdownContent.svelte'

	let { data } = $props()
</script>

<Seo
	title="{data.title} - Docs"
	description="{data.title.replaceAll(
		'`',
		''
	)}: a Project Wallace recipe that shows you how to integrate with one of our tools."
/>

<article>
	<MarkdownContent>
		<h1>{data.title}</h1>

		{@html data.html}
	</MarkdownContent>
</article>
