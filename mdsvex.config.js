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
import { defineMDSveXConfig as defineConfig, escapeSvelte } from 'mdsvex'
import autolinkHeadings from 'rehype-autolink-headings'
import slugPlugin from 'rehype-slug'

// mdsvex's own highlighter is unreliable here: it loads prismjs language grammars
// via a dynamic import that never reconciles with the Prism instance it does its
// highlighting with, so code blocks silently end up unhighlighted (and log
// "failed to load language ..." for every block). Highlighting directly against a
// single, statically-imported Prism instance sidesteps that entirely.
const LANGUAGE_ALIASES = {
	sh: 'bash',
	jsonc: 'json'
}

function escapeHtml(code) {
	return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlighter(code, lang) {
	let language = LANGUAGE_ALIASES[lang] ?? lang
	let grammar = language ? Prism.languages[language] : undefined
	let html = grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code)
	let className = `language-${language ?? 'none'}`

	return `<pre class="${className}">{@html \`<code class="${className}">${escapeSvelte(html)}</code>\`}</pre>`
}

const config = defineConfig({
	extensions: ['.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	highlight: { highlighter },

	remarkPlugins: [],
	rehypePlugins: [
		slugPlugin,
		[
			autolinkHeadings,
			{
				behavior: 'wrap'
			}
		]
	]
})

export default config
