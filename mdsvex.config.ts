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
import { type MdsvexOptions } from 'mdsvex'
import { anchors } from '@mdsvex/plugin-anchors'

const LANGUAGE_ALIASES: Record<string, string> = {
	sh: 'bash',
	jsonc: 'json'
}

function escapeHtml(code: string) {
	return code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function highlighter(code: string, { lang }: { lang: string }) {
	let language = LANGUAGE_ALIASES[lang] ?? lang
	let grammar = language ? Prism.languages[language] : undefined
	let html = language && grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code)
	let className = `language-${language || 'none'}`

	return `<pre class="${className}"><code class="${className}">${html}</code></pre>`
}

const config: MdsvexOptions = {
	extensions: ['.md', '.svx'],
	smart_punctuation: { dashes: true },
	highlight: highlighter,
	heading_ids: true,
	plugins: [anchors({ position: 'wrap' })]
}

export default config
