import eslintPluginSvelte from 'eslint-plugin-svelte'

export default [
	...eslintPluginSvelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		rules: {
			// Require keyed {#each} blocks to avoid DOM patching bugs
			'svelte/require-each-key': 'error',
			// Ensure keys reference the loop variable, not external values
			'svelte/valid-each-key': 'error',
			// Clean up stale svelte-ignore directives
			'svelte/no-unused-svelte-ignore': 'error',
			// Turn off noisy recommended rules not relevant here
			'svelte/no-at-html-tags': 'off',
		},
	},
]
