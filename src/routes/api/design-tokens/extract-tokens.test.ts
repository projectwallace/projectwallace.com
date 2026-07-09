import { test, expect } from 'vitest'
import { parseHTML } from 'linkedom'
import { extract_design_tokens, group_suggestions } from './extract-tokens'

function make_document(html: string) {
	return parseHTML(html).document
}

test('only design-token properties are extracted, not spacing', () => {
	let document = make_document('<button class="btn">Buy</button>')
	let css = '.btn { background: red; padding: 8px; margin: 4px; }'

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base).toEqual({ background: 'red' })
})

test('higher specificity wins regardless of source order', () => {
	let document = make_document('<button id="save" class="btn">Save</button>')
	let css = `
		#save.btn { background: green; }
		.btn { background: blue; }
	`

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base.background).toBe('green')
})

test('equal specificity: later rule in source order wins', () => {
	let document = make_document('<button class="btn">Save</button>')
	let css = `
		.btn { background: blue; }
		.btn { background: green; }
	`

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base.background).toBe('green')
})

test('!important beats higher specificity', () => {
	let document = make_document('<button id="save" class="btn">Save</button>')
	let css = `
		#save.btn { background: green; }
		.btn { background: blue !important; }
	`

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base.background).toBe('blue')
})

test(':hover and :disabled produce separate state buckets layered on top of base', () => {
	let document = make_document('<button class="btn">Save</button>')
	let css = `
		.btn { background: blue; }
		.btn:hover { background: darkblue; }
		.btn:disabled { background: grey; }
	`

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base.background).toBe('blue')
	expect(result.tokens.hover.background).toBe('darkblue')
	expect(result.tokens.disabled.background).toBe('grey')
})

test('pseudo-element rules are excluded entirely', () => {
	let document = make_document('<button class="btn">Save</button>')
	let css = '.btn::before { background: red; } .btn { color: black; }'

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base).toEqual({ color: 'black' })
})

test('finds button-like elements via the button/.button/.btn/[role=button] preset', () => {
	let document = make_document(`
		<button>Native</button>
		<div class="button">Div button</div>
		<span class="btn">Span btn</span>
		<a role="button">Link button</a>
		<div>Not a button</div>
	`)
	let css = 'button, .button, .btn, [role="button"] { color: black; }'

	let results = extract_design_tokens(document, css, 'button')

	expect(results).toHaveLength(4)
})

test('group_suggestions dedupes structurally identical buttons', () => {
	let document = make_document(`
		<button class="btn">One</button>
		<button class="btn">Two</button>
	`)
	let css = '.btn { background: blue; }'

	let results = extract_design_tokens(document, css, 'button')
	let suggestions = group_suggestions(results)

	expect(results).toHaveLength(2)
	expect(suggestions).toHaveLength(1)
	expect(suggestions[0].count).toBe(2)
})
