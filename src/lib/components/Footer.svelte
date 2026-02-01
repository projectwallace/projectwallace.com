<script lang="ts">
	let footer = [
		{
			title: 'Website CSS analysis',
			items: [
				{ title: 'CSS Analyzer', href: '/analyze-css' },
				{ title: 'CSS Code Quality Calculator', href: '/css-code-quality' },
				{ title: 'CSS Design Tokens', href: '/design-tokens' },
				{ title: 'CSS Layers Visualizer', href: '/css-layers-visualizer' },
				{ title: 'CSS Custom Property inspector', href: '/custom-property-inspector' },
				{ title: 'CSS Scraper', href: '/get-css' }
			]
		},
		{
			title: 'One-off CSS tools',
			items: [
				{ title: 'CSS Specificity Calculator', href: '/specificity-calculator' },
				{ title: 'CSS Selector Complexity Calculator', href: '/selector-complexity' },
				{ title: 'CSS Prettifier', href: '/prettify-css' },
				{ title: 'CSS Minifier', href: '/minify-css' },
				{ title: 'CSS Diff viewer', href: '/css-diff' },
				{ title: 'CSS Coverage inspector', href: '/css-coverage' },
				{ title: 'CSS AST Explorer', href: '/ast-explorer' }
			]
		},
		{
			title: 'CSS Games',
			items: [{ title: 'CSS Units memory', href: '/css-units-game' }]
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
				{ title: 'About', href: '/about' },
				{ title: 'Become a sponsor', href: '/funding' },
				{ title: 'Open Source Software', href: '/oss' },
				{ href: '/about/terms-of-service', title: 'Terms of Service' },
				{ href: '/about/privacy-policy', title: 'Privacy Policy' },
				{
					title: 'Code of Conduct',
					href: 'https://github.com/projectwallace/projectwallace.com/blob/main/CODE_OF_CONDUCT.md',
					rel: 'external'
				},
				{ title: 'Bluesky', href: 'https://bsky.app/profile/projectwallace.com', rel: 'external' },
				{ title: 'GitHub', href: 'https://github.com/projectwallace', rel: 'external' }
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

	<p>This site is powered by <a href="https://www.netlify.com/" rel="external">Netlify</a></p>
</footer>

<style>
	.footer {
		display: grid;
		gap: var(--space-4);
		margin-top: var(--space-8);
		margin-bottom: var(--space-4);
		padding-block: var(--space-8);
		padding-inline: var(--space-3);
		border-top: 1px solid var(--fg-600);
		color: var(--fg-300);

		@media (min-width: 66rem) {
			gap: var(--space-12);
			grid-template-columns: repeat(4, fit-content(100%)) 1fr;
			padding-inline: var(--space-8);
		}

		@media print {
			display: none;
		}
	}

	.section {
		display: grid;
		gap: var(--space-1);
		align-content: start;
	}

	.footer-title {
		font-weight: var(--font-medium);
	}

	.footer-list {
		display: grid;
		gap: var(--space-1);
	}

	.footer-link {
		display: block;
		padding-block: var(--space-1);
	}

	p {
		grid-column: 1 / -1;
		padding-block: var(--space-4);
		text-align: center;

		& a {
			--netlify: #32e6e2;
			text-decoration: underline;
			text-decoration-color: var(--netlify);
		}
	}
</style>
