import { test, expect } from 'vitest'
import { rehypeContentImages } from './rehype-content-images.ts'

type Node = { type: string; value?: string; tagName?: string; properties?: Record<string, unknown>; children?: Node[] }

function run(children: Node[], path = 'post.md') {
	let tree: Node = { type: 'root', children }
	rehypeContentImages()(tree, { path })
	return tree.children!.map((child) => child.value).join('')
}

const raw = (value: string): Node => ({ type: 'raw', value })

test('turns relative PNG/JPEG <img> into optimized BlogImage imports', () => {
	let output = run([raw('<img src="./hero.png" alt="Hero" loading="lazy">')])
	expect(output).toContain("import BlogImage from '#lib/components/BlogImage.svelte'")
	expect(output).toContain("import __asset_0 from './hero.png?enhanced'")
	expect(output).toContain('<BlogImage src={__asset_0} alt="Hero" loading="lazy" />')
	expect(output).not.toContain('src="./hero.png"')
})

test('keeps non-optimizable images as plain <img> with a plain asset import', () => {
	let output = run([raw('<img alt="Logo" src="../logo.svg" />')])
	expect(output).not.toContain('BlogImage')
	expect(output).toContain("import __asset_0 from '../logo.svg'")
	expect(output).toContain('<img alt="Logo" src={__asset_0} />')
})

test('rewrites hrefs to image files and shares one import per asset', () => {
	let output = run([raw('<a href="./hero.png"><img src="./hero.png" alt=""></a>')])
	expect(output).toContain("import __asset_0 from './hero.png?enhanced'")
	expect(output).toContain("import __asset_1 from './hero.png'")
	expect(output).toContain('<a href={__asset_1}>')
})

test('handles markdown image syntax', () => {
	let tree: Node = {
		type: 'root',
		children: [
			{
				type: 'element',
				tagName: 'p',
				children: [{ type: 'element', tagName: 'img', properties: { src: './a.jpg', alt: 'A "quoted" {alt}' } }]
			}
		]
	}
	rehypeContentImages()(tree, { path: 'post.md' })
	let image = tree.children![1]!.children![0]!
	expect(image.type).toBe('raw')
	expect(image.value).toContain('alt="A &quot;quoted&quot; &#123;alt&#125;"')
	expect(image.value).toContain('src={__asset_0}')
})

test('leaves remote images and documents without images untouched', () => {
	let tree: Node = { type: 'root', children: [raw('<img src="https://example.com/a.png" alt="">'), raw('<p>text</p>')] }
	rehypeContentImages()(tree, { path: 'post.md' })
	expect(tree.children).toHaveLength(2)
	expect(tree.children![0]!.value).toBe('<img src="https://example.com/a.png" alt="">')
})

test('refuses documents that mix relative images with their own <script>', () => {
	expect(() => run([raw('<script>let a = 1</script>'), raw('<img src="./a.png" alt="">')], 'post.md')).toThrow(
		/post\.md.*own <script>/
	)
})
