type Shortcut = {
	title: string;
	href: `/${string}`;
	keywords?: string;
}

type ShortcutsSection = {
	title: string;
	items: Shortcut[]
}

type Shortcuts = ShortcutsSection[]

export const shortcuts: Shortcuts = [
	{
		title: 'Website CSS analysis',
		items: [
			{ title: 'CSS Analyzer', href: '/analyze-css', keywords: 'complexity sonar quality' },
			{ title: 'CSS Code Quality Calculator', href: '/css-code-quality', keywords: 'lighthouse' },
			{ title: 'CSS Design Tokens', href: '/design-tokens', keywords: 'dtcg color' },
			{ title: 'CSS Layers Visualizer', href: '/css-layers-visualizer', keywords: 'nesting cascade' },
			{ title: 'CSS Custom Property inspector', href: '/custom-property-inspector', keywords: 'variables' },
			{ title: 'CSS Scraper', href: '/get-css', keywords: 'extract' }
		]
	},
	{
		title: 'One-off CSS tools',
		items: [
			{ title: 'CSS Specificity Calculator', href: '/specificity-calculator', keywords: 'selector' },
			{ title: 'CSS Selector Complexity Calculator', href: '/selector-complexity', keywords: 'cyclomatic' },
			{ title: 'CSS Prettifier', href: '/prettify-css', keywords: 'prettier format beautify print' },
			{ title: 'CSS Minifier', href: '/minify-css', keywords: 'compress optimize' },
			{ title: 'CSS Diff viewer', href: '/css-diff', keywords: 'git' },
			{ title: 'CSS Coverage inspector', href: '/css-coverage', keywords: 'code coverage' },
			{ title: 'CSS AST Explorer', href: '/ast-explorer', keywords: 'csstree' }
		]
	},
	{
		title: 'Other',
		items: [
			{ title: 'Blog', href: '/blog' },
			{ title: 'Docs', href: '/docs' },
		]
	}
]