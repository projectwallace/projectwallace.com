/**
 * Lets content reference images with plain, relative paths (no Svelte, no imports):
 *
 *   ![alt](./hero.png)
 *   <img src="./hero.png" alt="..." loading="lazy">
 *   <a href="./hero.png">...</a>
 *
 * and turns them into the Vite asset imports mdsvex/Svelte need:
 *
 * - PNG/JPEG `<img>`s become `<BlogImage>` (build-time AVIF/WebP + srcset via `?enhanced`)
 * - other `<img>`s (gif, svg, webp, ...) and `href`s to image files in raw HTML become plain hashed asset URLs
 *
 * Everything outside this file stays plain markdown + HTML, so any other renderer only has to
 * implement "relative image paths resolve to the file next to the document".
 */

type HastNode = {
	type: string
	value?: string
	tagName?: string
	properties?: Record<string, unknown>
	children?: HastNode[]
}

const IMAGE_EXT = 'png|jpe?g|gif|webp|avif|svg'
const OPTIMIZABLE = /\.(?:png|jpe?g)$/i
const IMG_TAG = new RegExp(`<img\\b([^>]*?)\\s*/?>`, 'g')
const SRC_ATTR = new RegExp(`\\bsrc=(["'])(\\.{1,2}/[^"']+\\.(?:${IMAGE_EXT}))\\1`, 'i')
const HREF_ATTR = new RegExp(`\\bhref=(["'])(\\.{1,2}/[^"']+\\.(?:${IMAGE_EXT}))\\1`, 'gi')

const BLOG_IMAGE_IMPORT = "import BlogImage from '#lib/components/BlogImage.svelte'"

function escape_attribute(value: string) {
	return value.replaceAll('"', '&quot;').replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

export function rehypeContentImages() {
	return function (tree: HastNode, file?: { path?: string }) {
		let imports: string[] = []
		let identifiers = new Map<string, string>()
		let uses_blog_image = false
		let has_own_script = false

		function asset(path: string, enhanced: boolean) {
			let specifier = enhanced ? `${path}?enhanced` : path
			let identifier = identifiers.get(specifier)
			if (!identifier) {
				identifier = `__asset_${identifiers.size}`
				identifiers.set(specifier, identifier)
				imports.push(`import ${identifier} from '${specifier}'`)
			}
			return identifier
		}

		function rewrite_raw(html: string): string {
			if (/<script[\s>]/.test(html)) {
				has_own_script = true
			}

			let result = html.replaceAll(IMG_TAG, (tag, attributes: string) => {
				let match = SRC_ATTR.exec(attributes)
				if (!match) {
					return tag
				}
				let [source, , path] = match
				let optimize = OPTIMIZABLE.test(path)
				let identifier = asset(path, optimize)
				let rest = attributes.replace(source, `src={${identifier}}`).trim()
				if (optimize) {
					uses_blog_image = true
					return `<BlogImage ${rest} />`
				}
				return `<img ${rest} />`
			})

			return result.replaceAll(HREF_ATTR, (_match, _quote, path: string) => `href={${asset(path, false)}}`)
		}

		function walk(node: HastNode, parent?: HastNode, index?: number) {
			if (node.type === 'raw' && typeof node.value === 'string') {
				node.value = rewrite_raw(node.value)
			} else if (node.type === 'element' && node.tagName === 'img') {
				let src = node.properties?.src
				if (typeof src === 'string' && new RegExp(`^\\.{1,2}/.+\\.(?:${IMAGE_EXT})$`, 'i').test(src) && parent) {
					let alt = typeof node.properties?.alt === 'string' ? node.properties.alt : ''
					parent.children![index!] = {
						type: 'raw',
						value: rewrite_raw(`<img src="${src}" alt="${escape_attribute(alt)}" loading="lazy">`)
					}
				}
				return
			}
			node.children?.forEach((child, i) => walk(child, node, i))
		}

		walk(tree)

		if (imports.length === 0) {
			return
		}
		if (has_own_script) {
			throw new Error(
				`${file?.path ?? 'A document'} uses relative image paths and has its own <script>. Remove the script, relative images are imported automatically.`
			)
		}
		if (uses_blog_image) {
			imports.unshift(BLOG_IMAGE_IMPORT)
		}
		tree.children = [{ type: 'raw', value: `<script>\n${imports.join('\n')}\n</script>\n` }, ...(tree.children ?? [])]
	}
}
