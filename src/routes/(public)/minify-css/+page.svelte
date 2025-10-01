<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Container from '$components/Container.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Heading from '$components/Heading.svelte'
	import MinifyCss from './MinifyCss.svelte'
</script>

<Seo title="Online CSS Minifier" description="Minify your CSS online" />

<Container>
	<header>
		<Heading element="h1" size={1}>Minify <em>CSS</em></Heading>
	</header>

	<MinifyCss />
</Container>

<div class="content">
	<Container size="xl">
		<Markdown>
			<h2>About this CSS minifier</h2>
			<ul>
				<li>
					This minifier is powered by <a href="https://github.com/projectwallace/format-css" rel="external"
						>@projectwallace/format-css</a
					>.
				</li>
				<li>
					This is a very naive minifier which only removes whitespace, newlines and comments. If you need a more
					thorough minifier, please consider using <a href="https://github.com/css/csso" rel="external">CSSO</a>,
					<a href="https://lightningcss.dev/" rel="external">LightningCSS</a>
					or
					<a href="https://github.com/cssnano/cssnano" rel="external">cssnano</a>.
				</li>
				<li>Minification happens only on your computer, no code is sent to our servers.</li>
				<li>
					This minifier is most useful if you quickly need to compress your CSS without having to setup an asset
					pipeline and install dozens of dependencies.
				</li>
			</ul>

			<a href="/prettify-css" class="link-to-prettifier">Looking for a CSS prettifier?</a>
		</Markdown>
	</Container>
</div>

<style>
	header {
		text-align: center;
		margin-block: var(--space-8);
	}

	.content {
		margin-block: var(--space-24);
	}

	.link-to-prettifier {
		display: block;
		text-align: center;
		margin: var(--space-12);
	}
</style>
