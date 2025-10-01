<script lang="ts">
	interface Props {
		json: string
		class?: string
	}

	let { json, class: classname = '' }: Props = $props()

	function* tokenize_json(input: string) {
		let i = 0
		const length = input.length

		while (i < length) {
			const char = input.charCodeAt(i)

			// Skip whitespace (char codes: 9 = \t, 10 = \n, 13 = \r, 32 = space)
			if (char === 9 || char === 10 || char === 13 || char === 32) {
				i++
				continue
			}

			// Single-character tokens
			if (char === 123) {
				// '{'
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			if (char === 125) {
				// '}'
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			if (char === 91) {
				// '['
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			if (char === 93) {
				// ']'
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			if (char === 58) {
				// ':'
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			if (char === 44) {
				// ','
				// yield { type: 'punct', start: i }
				i++
				continue
			}

			// Strings
			if (char === 34) {
				// '"'
				let start = i + 1
				i = start

				while (i < length && input.charCodeAt(i) !== 34) {
					// not '"'
					if (input.charCodeAt(i) === 92) i++ // Skip escaped character (92 = '\\')
					i++
				}

				yield { type: 'string', start, value: input.slice(start, i) }
				i++ // Skip closing quote
				continue
			}

			// Numbers (negative sign or digit)
			if (char === 45 || (char >= 48 && char <= 57)) {
				// '-' or '0-9'
				let start = i
				i++

				while (i < length) {
					const next_char = input.charCodeAt(i)
					if (
						!(
							(next_char >= 48 && next_char <= 57) ||
							next_char === 46 ||
							next_char === 101 ||
							next_char === 69 ||
							next_char === 43 ||
							next_char === 45
						)
					) {
						break
					}
					i++
				}

				yield { type: 'number', start, value: input.slice(start, i) }
				continue
			}

			// Booleans and null
			if (char === 116 && input.slice(i, i + 4) === 'true') {
				// 'true'
				yield { type: 'boolean', start: i, value: 'true' }
				i += 4
				continue
			}

			if (char === 102 && input.slice(i, i + 5) === 'false') {
				// 'false'
				yield { type: 'boolean', start: i, value: 'false' }
				i += 5
				continue
			}

			if (char === 110 && input.slice(i, i + 4) === 'null') {
				// 'null'
				yield { type: 'null', start: i, value: 'null' }
				i += 4
				continue
			}

			throw new Error(`Unexpected character: ${String.fromCharCode(char)} at position ${i}`)
		}
	}

	const token_types = ['punct', 'string', 'number', 'boolean', 'null']

	function highlight_json(node: HTMLElement, { json = '' }: { json: string }) {
		let supports_highlights = 'highlights' in window.CSS
		if (!supports_highlights) {
			console.warn('CSS highlights are not supported in this browser')
			return
		}

		let highlights = window.CSS.highlights
		let text_node = node.firstChild!

		for (let type of token_types) {
			highlights.set(type, new Highlight())
		}

		for (let token of tokenize_json(json)) {
			let { type, start, value } = token
			let range = new StaticRange({
				startContainer: text_node,
				startOffset: start,
				endContainer: text_node,
				endOffset: type === 'punct' ? start + 1 : start + value!.length
			})
			requestAnimationFrame(() => {
				highlights.get(type)?.add(range)
			})
		}

		function cleanup() {
			if (supports_highlights) {
				for (let token_type of token_types) {
					highlights.get(token_type)?.clear()
				}
			}
		}

		return {
			destroy: () => {
				if ('requestIdleCallback' in window) {
					requestIdleCallback(cleanup)
				} else {
					cleanup()
				}
			}
		}
	}
</script>

<pre class={['scroll-container', classname]} dir="ltr" translate="no"><code
		use:highlight_json={{ json }}
		class="language-json">{json}</code
	></pre>

<style>
	pre {
		/* default color for punctuations */
		color: var(--fg-300);
	}

	::highlight(number),
	::highlight(boolean) {
		color: var(--highlight-number);
	}

	::highlight(string) {
		color: var(--fg-100);
	}
</style>
