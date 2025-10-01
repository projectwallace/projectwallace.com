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
			items: [{ title: 'CSS Units memory game', href: '/css-units-game' }]
		},
		{
			title: 'Documentation',
			items: [
				{ href: '/docs', title: 'Docs' },
				{ href: '/blog', title: 'Blog' }
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
				{ title: 'Bluesky', href: 'https://bsky.app/profile/projectwallace.com' },
				{ title: 'GitHub', href: 'https://github.com/projectwallace' }
			]
		}
	]
</script>

<footer id="footer" class="footer">
	{#each footer as { title, items }}
		<div class="section">
			<div class="footer-title">{title}</div>
			<ul class="footer-list" role="list">
				{#each items as { title, href }}
					<li>
						<a class="footer-link" {href}>{title}</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
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
		color: var(--fg-300);
		padding-block: var(--space-1);
	}
</style>
