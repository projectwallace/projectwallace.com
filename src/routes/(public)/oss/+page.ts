type Project = {
	title: string
	description: string
	url: string | URL
	icon?: string
}

let projects = [
	{
		title: 'CSS Analyzer',
		description: 'Analytics for CSS.',
		url: 'https://github.com/projectwallace/css-analyzer',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Analyzer</title>
				<rect fill="#29c87d" width="6" height="1" y="3" x="3"></rect>
				<rect fill="#29c87d" width="3" height="1" y="5" x="3"></rect>
				<rect fill="#da2b2b" width="9" height="1" y="7" x="3"></rect>
				<rect fill="#29c87d" width="5" height="1" y="9" x="3"></rect>
				<rect fill="#29c87d" width="7" height="1" y="11" x="3"></rect>
			</svg>
		`,
	},
	{
		title: 'CSS Code Quality analyzer',
		description: 'Calculate the Code Quality score of your CSS based on a range of different quality guards.',
		url: 'https://github.com/projectwallace/css-code-quality',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Code Quality</title>
				<rect fill="#29c87d" width="4" height="1" x="3" y="3"></rect>
				<rect fill="#da2b2b" width="4" height="1" x="3" y="5"></rect>
				<rect fill="#29c87d" width="4" height="1" x="3" y="7"></rect>
				<rect fill="#da2b2b" width="4" height="1" x="3" y="11"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="3"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="7"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="9"></rect>
			</svg>
		`,
	},
	{
		title: 'Wallace CLI',
		description: 'Pretty CSS analytics on the CLI',
		url: 'https://github.com/projectwallace/wallace-cli',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Wallace CLI</title>
				<g fill="#29c87d">
					<rect fill="#da2b2b" width="4.5" height="1" y="10.5" x="7.5"></rect>
					<rect width="5" height="1" transform="rotate(45) translate(6, 0)"></rect>
					<rect width="5" height="1" transform="rotate(-45) translate(-5, 10)"></rect>
				</g>
			</svg>
		`,
	},
	{
		title: 'Color Sorter',
		description: 'Sort CSS colors by hue, then by saturation.',
		url: 'https://github.com/projectwallace/color-sorter',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Color sorter</title>
				<rect width="2" height="9" x="3" y="3" fill="#da2b2b"></rect>
				<rect width="2" height="9" x="5" y="3" fill="#ffba1a"></rect>
				<rect width="3" height="9" x="7" y="3" fill="#29c87d"></rect>
				<rect width="2" height="9" x="10" y="3" fill="#24ad6d"></rect>
			</svg>
		`,
	},
	{
		title: 'Format CSS',
		description: 'Fast, small, zero-config library to format (or minify) CSS using basic rules.',
		url: 'https://github.com/projectwallace/format-css',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Format CSS</title>
				<rect fill="#29c87d" width="1" height="1" y="10" x="3"></rect>
				<rect fill="#29c87d" width="1" height="1" y="10" x="6"></rect>
				<rect fill="#29c87d" width="1" height="1" y="10" x="9"></rect>
			</svg>
		`,
	},
	{
		title: 'CSS Design Tokens',
		description:
			'Create Design Tokens by going through CSS to find colors, font-sizes, gradients etcetera and turn them into a Design Tokens spec-compliant token format.',
		url: 'https://github.com/projectwallace/css-design-tokens',
	},
	{
		title: 'CSS Code Coverage',
		description: 'Generate useful CSS Code Coverage report from browser/Playwright/Puppeteer-reported coverage',
		url: 'https://github.com/projectwallace/css-code-coverage',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Coverage</title>
				<rect fill="#29c87d" width="8" height="1" y="3" x="3"></rect>
				<rect fill="#da2b2b" width="8" height="1" y="5" x="3"></rect>
				<rect fill="#29c87d" width="8" height="1" y="7" x="3"></rect>
				<rect fill="#da2b2b" width="8" height="1" y="9" x="3"></rect>
				<rect fill="#29c87d" width="8" height="1" y="11" x="3"></rect>
			</svg>
		`,
	},
	{
		title: 'CSS time sort',
		description: 'Sort an array of CSS <time> values',
		url: 'https://github.com/projectwallace/css-time-sort',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Time sort</title>
				<rect fill="#29c87d" width="2" height="1" y="3" x="3"></rect>
				<rect fill="#29c87d" width="4" height="1" y="5" x="3"></rect>
				<rect fill="#29c87d" width="7" height="1" y="7" x="3"></rect>
				<rect fill="#29c87d" width="8" height="1" y="9" x="3"></rect>
				<rect fill="#29c87d" width="9" height="1" y="11" x="3"></rect>
			</svg>
		`,
	},
	{
		title: 'CSS @layer tree',
		description: 'Discover the composition of your CSS @layers',
		url: 'https://github.com/projectwallace/css-layer-tree',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Layer Tree</title>
				<rect fill="#29c87d" width="1" height="1" y="3" x="7"></rect>
				<rect fill="#29c87d" width="3" height="1" y="5" x="6"></rect>
				<rect fill="#29c87d" width="5" height="1" y="7" x="5"></rect>
				<rect fill="#29c87d" width="7" height="1" y="9" x="4"></rect>
				<rect fill="#29c87d" width="9" height="1" y="11" x="3"></rect>
			</svg>
		`,
	},
	{
		title: 'CSS Parser',
		description: 'High-performance CSS parser optimized for static analysis and formatting ',
		url: 'https://github.com/projectwallace/css-parser',
	},
	{
		title: 'Stylelint plugin',
		description: 'A Stylelint plugin that warns you about opinionated code quality issues',
		url: 'https://github.com/projectwallace/stylelint-plugin',
	},
] satisfies Project[]

export function load() {
	return { projects }
}
