<script>
	import Seo from '$lib/components/Seo.svelte'
	import MarkdownContent from '$lib/components/MarkdownContent.svelte'

	let { data } = $props()
</script>

<Seo title="{data.title} - Docs" />

<article>
	<MarkdownContent>
		<h1>{data.title}</h1>
		<code>{data.id}</code>

		{@html data.html}

		{#if data.meta}
			{#if data.meta.deprecated || data.meta.introduced || data.meta.removed}
				<aside>
					<h2>
						<a id="versioning" href={`${data.path}#versioning`}>Versioning</a>
					</h2>
					<dl>
						{#if data.meta.introduced}
							<dt>Introduced in</dt>
							<dd>{data.meta.introduced}</dd>
						{/if}
						{#if data.meta.deprecated}
							<dt>Deprecated in</dt>
							<dd>{data.meta.deprecated}</dd>
						{/if}
						{#if data.meta.removed}
							<dt>Removed in</dt>
							<dd>{data.meta.removed}</dd>
						{/if}
					</dl>
				</aside>
			{/if}
		{/if}
	</MarkdownContent>
</article>
