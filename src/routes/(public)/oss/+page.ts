let projects = [
	{
		title: 'CSS Analyzer',
		description: 'Analytics for CSS.',
		url: 'https://github.com/projectwallace/css-analyzer',
		repository: '@projectwallace/css-analyzer',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Analyzer</title>
				<rect fill="#29c87d" width="6" height="1" y="3" x="3"></rect>
				<rect fill="#29c87d" width="3" height="1" y="5" x="3"></rect>
				<rect fill="#da2b2b" width="9" height="1" y="7" x="3"></rect>
				<rect fill="#29c87d" width="5" height="1" y="9" x="3"></rect>
				<rect fill="#29c87d" width="7" height="1" y="11" x="3"></rect>
			</svg>
		`
	},
	{
		title: 'CSS Code Quality analyzer',
		description: 'Calculate the Code Quality score of your CSS based on a range of different quality guards.',
		url: 'https://github.com/projectwallace/css-code-quality',
		repository: 'projectwallace/css-code-quality',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Github Diff Action</title>
				<rect fill="#29c87d" width="4" height="1" x="3" y="3"></rect>
				<rect fill="#da2b2b" width="4" height="1" x="3" y="5"></rect>
				<rect fill="#29c87d" width="4" height="1" x="3" y="7"></rect>
				<rect fill="#da2b2b" width="4" height="1" x="3" y="11"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="3"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="7"></rect>
				<rect fill="#29c87d" width="4" height="1" x="8" y="9"></rect>
			</svg>
		`
	},
	{
		title: 'Wallace CLI',
		description: 'Pretty CSS analytics on the CLI',
		url: 'https://github.com/projectwallace/wallace-cli',
		repository: 'projectwallace/wallace-cli',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Wallace CLI</title>
				<g fill="#29c87d">
					<rect fill="#da2b2b" width="4.5" height="1" y="10.5" x="7.5"></rect>
					<rect width="5" height="1" transform="rotate(45) translate(6, 0)"></rect>
					<rect width="5" height="1" transform="rotate(-45) translate(-5, 10)"></rect>
				</g>
			</svg>
		`
	},
	{
		title: 'Color Sorter',
		description: 'Sort CSS colors by hue, then by saturation.',
		url: 'https://github.com/projectwallace/color-sorter',
		repository: 'projectwallace/color-sorter',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Color sorter</title>
				<rect width="2" height="9" x="3" y="3" fill="#da2b2b"></rect>
				<rect width="2" height="9" x="5" y="3" fill="#ffba1a"></rect>
				<rect width="3" height="9" x="7" y="3" fill="#29c87d"></rect>
				<rect width="2" height="9" x="10" y="3" fill="#24ad6d"></rect>
			</svg>
		`
	},
	{
		title: 'Format CSS',
		description: 'Fast, small, zero-config library to format (or minify) CSS using basic rules',
		url: 'https://github.com/projectwallace/format-css',
		repository: 'projectwallace/format-css',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Analyzer</title>
				<rect fill="#29c87d" width="1" height="1" y="10" x="3"></rect>
				<rect fill="#29c87d" width="1" height="1" y="10" x="6"></rect>
				<rect fill="#29c87d" width="1" height="1" y="10" x="9"></rect>
			</svg>
		`
	},

	{
		title: 'CSS time sort',
		description: 'Sort an array of CSS <time> values',
		url: 'https://github.com/projectwallace/css-time-sort',
		repository: 'projectwallace/css-time-sort',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>CSS Analyzer</title>
				<rect fill="#29c87d" width="2" height="1" y="3" x="3"></rect>
				<rect fill="#29c87d" width="4" height="1" y="5" x="3"></rect>
				<rect fill="#29c87d" width="7" height="1" y="7" x="3"></rect>
				<rect fill="#29c87d" width="8" height="1" y="9" x="3"></rect>
				<rect fill="#29c87d" width="9" height="1" y="11" x="3"></rect>
			</svg>
		`
	},
	{
		title: 'Constyble',
		description: 'CSS complexity linter',
		url: 'https://github.com/projectwallace/constyble',
		repository: 'projectwallace/constyble',
		icon: `
			<svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
				<title>Constyble</title>
				<path fill="#29c87d" d="M4 3h2v2H4zM9 3h2v2H9zM5 7h6v4H5z"></path>
			</svg>
		`
	},
]

export function load() {
	return { projects }
}
