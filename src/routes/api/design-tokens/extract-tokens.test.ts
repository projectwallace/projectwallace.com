import { test, expect } from 'vitest'
import { parseHTML } from 'linkedom'
import { extract_design_tokens, extract_all_design_tokens, group_suggestions } from './extract-tokens'

function make_document(html: string) {
	return parseHTML(html).document
}

test('design-token properties are extracted, layout properties like margin are not', () => {
	let document = make_document('<button class="btn">Buy</button>')
	let css = '.btn { background: red; padding: 8px; margin: 4px; }'

	let [result] = extract_design_tokens(document, css, 'button')

	expect(result.tokens.base).toEqual({ background: 'red', padding: '8px' })
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

test('finds button-like elements via the button preset, but not a plain <button>', () => {
	let document = make_document(`
		<button>Native, no type attribute</button>
		<button type="submit">Submit</button>
		<input type="button" value="Click" />
		<div class="button">Div button</div>
		<span class="btn">Span btn</span>
		<a role="button">Link button</a>
		<div class="primary-button">Primary</div>
		<div class="cta-btn">CTA</div>
		<div>Not a button</div>
	`)
	let css = `
		button[type="submit"], input[type="button"], .button, .btn, [role="button"],
		[class*="-button"], [class*="-btn"] { color: black; }
	`

	let results = extract_design_tokens(document, css, 'button')

	expect(results).toHaveLength(7)
})

test('excludes elements whose class also says "link", even if it also looks like a button', () => {
	let document = make_document(`
		<div class="primary-button">Real button</div>
		<a class="cta-button nav-link">Link styled as a button</a>
		<div class="primary-btn footer-link">Also a link</div>
	`)
	let css = '[class*="-button"], [class*="-btn"] { color: black; }'

	let results = extract_design_tokens(document, css, 'button')

	expect(results).toHaveLength(1)
	expect(results[0].class_name).toBe('primary-button')
})

test('finds heading-like elements via the h1/.h1/.heading-1 preset', () => {
	let document = make_document(`
		<h1>Native</h1>
		<div class="h1">Div heading</div>
		<span class="heading-1">Span heading</span>
		<h2>Not an h1</h2>
	`)
	let css = 'h1, .h1, .heading-1 { color: black; }'

	let results = extract_design_tokens(document, css, 'heading')

	expect(results).toHaveLength(3)
})

test('extract_all_design_tokens reports every component preset in a single pass', () => {
	let document = make_document(`
		<h1 class="h1">Title</h1>
		<button class="btn">Buy</button>
		<button class="btn">Sell</button>
	`)
	let css = '.h1 { color: black; } .btn { background: blue; }'

	let report = extract_all_design_tokens(document, css)

	expect(Object.keys(report)).toEqual(['button', 'heading'])
	expect(report.button.elements).toBe(2)
	expect(report.button.suggestions[0].tokens.base).toEqual({ background: 'blue' })
	expect(report.heading.elements).toBe(1)
	expect(report.heading.suggestions[0].tokens.base).toEqual({ color: 'black' })
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
