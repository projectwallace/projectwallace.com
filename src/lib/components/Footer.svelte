<script lang="ts">
	let footer = [
		{
			title: 'Website CSS analysis',
			items: [
				{ href: '/analyze-css', title: 'CSS Analyzer' },
				{ href: '/css-code-quality', title: 'CSS Code Quality Calculator' },
				{ href: '/design-tokens', title: 'CSS Design Tokens' },
				{ href: '/css-layers-visualizer', title: 'CSS Layers Visualizer' },
				{ href: '/custom-property-inspector', title: 'CSS Custom Property inspector' },
				{ href: '/get-css', title: 'CSS Scraper' },
				{ href: '/lint-css', title: 'CSS Linter' }
			]
		},
		{
			title: 'One-off CSS tools',
			items: [
				{ href: '/specificity-calculator', title: 'CSS Specificity Calculator' },
				{ href: '/selector-complexity', title: 'CSS Selector Complexity Calculator' },
				{ href: '/prettify-css', title: 'CSS Prettifier' },
				{ href: '/minify-css', title: 'CSS Minifier' },
				{ href: '/css-diff', title: 'CSS Diff viewer' },
				{ href: '/css-coverage', title: 'CSS Coverage inspector' },
				{ href: '/ast-explorer', title: 'CSS AST Explorer' }
			]
		},
		{
			title: 'CSS Games',
			items: [{ href: '/css-units-game', title: 'CSS Units memory' }]
		},
		{
			title: 'Documentation',
			items: [
				{ href: '/docs', title: 'Docs' },
				{ href: '/blog', title: 'Blog' },
				{ href: '/the-css-selection', title: 'The CSS Selection' }
			]
		},
		{
			title: 'About Project Wallace',
			items: [
				{ href: '/about', title: 'About' },
				{ href: '/oss', title: 'Open Source Software' },
				{ href: '/about/terms-of-service', title: 'Terms of Service' },
				{ href: '/about/privacy-policy', title: 'Privacy Policy' },
				{
					href: 'https://github.com/projectwallace/projectwallace.com/blob/main/CODE_OF_CONDUCT.md',
					title: 'Code of Conduct',
					rel: 'external'
				},
				{
					href: 'https://bsky.app/profile/projectwallace.com',
					title: 'Bluesky',
					rel: 'external'
				},
				{
					href: 'https://github.com/projectwallace',
					title: 'GitHub',
					rel: 'external'
				}
			]
		}
	]
</script>

<footer id="footer" class="footer">
	{#each footer as { title, items }}
		<div class="section">
			<div class="footer-title">{title}</div>
			<ul class="footer-list" role="list">
				{#each items as { title, href, rel }}
					<li>
						<a class="footer-link" {href} {rel}>{title}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}

	<p>
		This site is powered by <a href="https://www.netlify.com/" rel="external">Netlify</a>
	</p>
</footer>

<style>
	.footer {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-12);
		row-gap: var(--space-8);
		margin-top: var(--space-8);
		margin-bottom: var(--space-4);
		padding-block: var(--space-8);
		padding-inline: var(--space-3);
		border-block-start: 1px solid var(--fg-800);
		color: var(--fg-300);

		@media (min-width: 66rem) {
			padding-inline: var(--space-8);
		}

		@media print {
			display: none;
		}
	}

	.section {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1);
		align-content: start;
	}

	.footer-title {
		font-weight: var(--font-medium);
		color: var(--fg-200);
	}

	.footer-list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1);
	}

	.footer-link {
		display: block;
		padding-block: var(--space-1);
	}

	p {
		flex-basis: 100%;
		/* padding-block: var(--space-4); */
		text-align: center;

		& a {
			--netlify: #32e6e2;
			text-decoration-line: underline;
			text-decoration-color: var(--netlify);
		}
	}
</style>
