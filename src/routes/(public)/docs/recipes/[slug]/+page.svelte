<script>
	import Seo from '$components/Seo.svelte'
	import MarkdownContent from '$components/MarkdownContent.svelte'

	let { data } = $props()
</script>

<Seo title="{data.title} - Docs" />

<article>
	<MarkdownContent>
		<h1>{data.title}</h1>

		{@html data.html}
	</MarkdownContent>
</article>
