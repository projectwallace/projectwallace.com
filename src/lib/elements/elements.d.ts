// Lets Svelte and TypeScript accept the custom elements in markup (<pw-meter value={0.5}>)
declare namespace svelteHTML {
	interface IntrinsicElements {
		'pw-container': import('svelte/elements').HTMLAttributes<HTMLElement> & {
			size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl'
		}
		'pw-file-size': import('svelte/elements').HTMLAttributes<HTMLElement>
		'pw-meter': import('svelte/elements').HTMLAttributes<HTMLElement>
	}
}
