import { basename } from 'node:path'
import { render } from 'svelte/server'
import type { Component } from 'svelte'

/** The shape of a markdown module as returned by mdsvex + `import.meta.glob`. */
export type MdsvexDocument<Metadata> = {
	metadata: Metadata
	default: {
		render: () => unknown
	}
}

/** Render a markdown module to an HTML string. */
export function render_md(mod: MdsvexDocument<unknown>): string {
	return render(mod.default as unknown as Component, { props: {} }).body
}

/** Throw a descriptive error when required frontmatter keys are missing. */
export function require_frontmatter<Metadata extends object, Key extends keyof Metadata>(
	label: string,
	file_path: string,
	metadata: Metadata,
	keys: Key[]
): asserts metadata is Metadata & { [K in Key]-?: NonNullable<Metadata[K]> } {
	if (keys.some((key) => !metadata[key])) {
		throw new Error(`${label} at ${file_path} is missing required frontmatter (${keys.map(String).join(', ')})`)
	}
}

/** `/content/docs/recipes/Foo.Bar.md` -> `foo-bar` */
export function to_slug(file_path: string): string {
	return basename(file_path, '.md').toLowerCase().replaceAll('.', '-')
}
