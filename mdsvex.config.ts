import Prism from 'prismjs'
import 'prismjs/components/prism-markup.js'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-css.js'
import 'prismjs/components/prism-scss.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-bash.js'
import 'prism-svelte' // extends markup/css/javascript, must load after them
import { defineMDSveXConfig as defineConfig, escapeSvelte, type MdsvexOptions } from 'mdsvex'
import autolinkHeadings from 'rehype-autolink-headings'
import slugPlugin from 'rehype-slug'

// mdsvex's own highlighter is unreliable here: it loads prismjs language grammars
// via a dynamic import that never reconciles with the Prism instance it does its
// highlighting with, so code blocks silently end up unhighlighted (and log
// "failed to load language ..." for every block). Highlighting directly against a
// single, statically-imported Prism instance sidesteps that entirely.
const LANGUAGE_ALIASES: Record<string, string> = {
	sh: 'bash',
	jsonc: 'json'
}

function escapeHtml(code: string) {
	return code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function highlighter(code: string, lang: string | null | undefined) {
	let language = typeof lang === 'string' ? (LANGUAGE_ALIASES[lang] ?? lang) : undefined
	let grammar = language ? Prism.languages[language] : undefined
	let html = language && grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code)
	let className = `language-${language ?? 'none'}`

	return `<pre class="${className}">{@html \`<code class="${className}">${escapeSvelte(html)}</code>\`}</pre>`
}

type RehypePlugins = NonNullable<MdsvexOptions['rehypePlugins']>

const config = defineConfig({
	extensions: ['.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	highlight: { highlighter },

	remarkPlugins: [],
	// mdsvex types plugins against unified v9, while these rehype plugins are typed against
	// current unified. They work fine at runtime, so cast past the mismatch.
	rehypePlugins: [
		slugPlugin,
		[
			autolinkHeadings,
			{
				behavior: 'wrap'
			}
		]
	] as unknown as RehypePlugins
})

export default config
