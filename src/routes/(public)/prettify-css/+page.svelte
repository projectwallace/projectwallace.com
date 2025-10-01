<script>
	import Seo from '$components/Seo.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import PrettifyCss from './PrettifyCss.svelte'
</script>

<Seo title="Online CSS Prettifier" description="Convert minified CSS into readable CSS online" />

<Container>
	<header>
		<Heading element="h1" size={1}>Prettify <em>CSS</em></Heading>
	</header>

	<PrettifyCss />
</Container>

<Container size="xl">
	<div class="content">
		<Markdown>
			<h2>About this CSS prettifier</h2>
			<ul>
				<li>
					<p>
						This prettifier is powered by <a href="https://github.com/projectwallace/format-css" rel="external"
							>@projectwallace/format-css</a
						>. These are the formatting rules:
					</p>
					<ol>
						<li>Every AtRule starts on a new line</li>
						<li>Every Rule starts on a new line</li>
						<li>Every Selector starts on a new line</li>
						<li>A comma is placed after every Selector that’s not the last in the SelectorList</li>
						<li>Every Block is indented with 1 tab more than the previous indentation level</li>
						<li>Every Declaration starts on a new line</li>
						<li>Every Declaration ends with a semicolon (;)</li>
						<li>An empty line is placed after a Block, unless it’s the last in the surrounding Block</li>
						<li>Multiline tokens like Selectors, Values, etc. are rendered on a single line</li>
						<li>Unknown syntax is rendered as-is, with multi-line formatting kept intact</li>
					</ol>
				</li>
				<li>Formatting happens only on your computer, no code is sent to our servers.</li>
			</ul>

			<a href="/minify-css" class="link-to-minifier">Looking for a CSS minifier?</a>
		</Markdown>
	</div>
</Container>

<style>
	header {
		text-align: center;
		margin-block: var(--space-8);
	}

	.link-to-minifier {
		display: block;
		text-align: center;
		margin: var(--space-12);
	}

	.content {
		margin-block: var(--space-24);
	}
</style>
