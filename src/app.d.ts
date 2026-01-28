declare class Highlight extends Set<Range | StaticRange> {}

interface Window {
	CSS: {
		highlights: Map<string, Highlight>
	}
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
namespace App {
	// interface Error {}
	interface Locals {
		theme: 'dark' | 'light' | 'system' | 'naked' | undefined
	}
	// interface PageData {}
	// interface Platform {}

	interface MdsvexFile {
		default: import('svelte/internal').SvelteComponent
		metadata: Record<string, string>
	}
}

declare module '*.md' {
	import type { SvelteComponent } from 'svelte'

	export default class Comp extends SvelteComponent {}

	export const metadata: Record<string, unknown>
}

declare module '*.svx' {
	import type { SvelteComponent } from 'svelte'

	export default class Comp extends SvelteComponent {}

	export const metadata: Record<string, unknown>
}
