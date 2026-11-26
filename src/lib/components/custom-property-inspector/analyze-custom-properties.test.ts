import { test, expect } from 'vitest'
import { analyze } from './analyze-custom-properties.ts'

test('unused property', () => {
	let actual = analyze(`
	x {
		--unused: 1;
	}`)

	expect(actual.unused).toEqual(new Set(['--unused']))
	expect(actual.all.size).toBe(1)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
})

test('undeclared property', () => {
	let actual = analyze(`
	x {
		color: var(--undeclared);
	}`)
	expect(actual.undeclared).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared_with_fallback.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--undeclared')).toEqual([{ column: 10, length: 17, line: 3, offset: 15 }])
})

test('undeclared property with fallback', () => {
	let actual = analyze(`
	x {
		color: var(--undeclared, red);
	}`)
	expect(actual.undeclared_with_fallback).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--undeclared')).toEqual([{ column: 10, length: 22, line: 3, offset: 15 }])
})

test('undeclared property with undefined custom property as fallback', () => {
	let actual = analyze(`
	x {
		color: var(--undeclared, var(--undeclared-2));
	}`)
	expect(actual.undeclared_with_fallback).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared.size).toBe(1)
	expect(actual.unused.size).toBe(0)
	expect(actual.all.size).toBe(2)
	expect(actual.all.get('--undeclared')).toEqual([{ column: 10, length: 38, line: 3, offset: 15 }])
	expect(actual.all.get('--undeclared-2')).toEqual([{ column: 28, length: 19, line: 3, offset: 33 }])
})

test('undeclared property with defined custom property as fallback', () => {
	let actual = analyze(`
	x {
		--declared: 1;
		color: var(--undeclared, var(--declared));
	}`)
	expect(actual.undeclared_with_fallback).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.all.size).toBe(2)
	expect(actual.all.get('--undeclared')).toEqual([{ column: 10, length: 34, line: 4, offset: 32 }])
})

test('undeclared property with empty fallback', () => {
	let actual = analyze(`
	x {
		color: var(--undeclared, );
	}`)
	expect(actual.undeclared_with_fallback).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--undeclared')).toEqual([{ column: 10, length: 19, line: 3, offset: 15 }])
})

test('unused @property', () => {
	let actual = analyze(`
	@property --unused {
		initial-value: 1;
		syntax: '<integer>';
	}`)
	expect(actual.unused).toEqual(new Set(['--unused']))
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--unused')).toEqual([{ column: 2, length: 66, line: 2, offset: 2 }])
})

test('used @property', () => {
	let actual = analyze(`
	@property --used {
		initial-value: 1;
		syntax: '<integer>';
	}
	x {
		x: var(--used);
	}`)
	expect(actual.unused.size).toBe(0)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--used')).toEqual([
		{ column: 2, length: 64, line: 2, offset: 2 },
		{ column: 6, length: 11, line: 7, offset: 77 }
	])
})

test('declared and used property is not flagged', () => {
	let actual = analyze(`
	x {
		--used: 1;
		color: var(--used);
	}`)
	expect(actual.unused.size).toBe(0)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
	expect(actual.all.size).toBe(1)
	expect(actual.all.get('--used')).toHaveLength(2)
})

test('collects every declaration and usage of a property', () => {
	let actual = analyze(`
	a {
		--x: 1;
		color: var(--x);
	}
	b {
		--x: 2;
		background: var(--x);
	}`)
	expect(actual.all.size).toBe(1)
	let locations = actual.all.get('--x')!
	expect(locations).toHaveLength(4)
	// in source order
	expect(locations.map((loc) => loc.line)).toEqual([3, 4, 7, 8])
})

test('ignores regular declarations and var() without a custom property', () => {
	let actual = analyze(`
	x {
		color: red;
		width: calc(1px + 2px);
		margin: var(invalid);
	}`)
	expect(actual.all.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
})

test('finds properties inside at-rules and nested rules', () => {
	let actual = analyze(`
	@media (min-width: 10px) {
		@layer base {
			x {
				--in-media: 1;
				& y {
					color: var(--in-media);
					background: var(--nested-undeclared);
				}
			}
		}
	}`)
	expect(actual.all.size).toBe(2)
	expect(actual.unused.size).toBe(0)
	expect(actual.undeclared).toEqual(new Set(['--nested-undeclared']))
})

test('custom properties are case-sensitive', () => {
	let actual = analyze(`
	x {
		--Color: red;
		color: var(--color);
	}`)
	expect(actual.all.size).toBe(2)
	expect(actual.unused).toEqual(new Set(['--Color']))
	expect(actual.undeclared).toEqual(new Set(['--color']))
})

test('a property used with and without a fallback counts as having a fallback', () => {
	let actual = analyze(`
	x {
		color: var(--undeclared);
		background: var(--undeclared, red);
	}`)
	expect(actual.undeclared_with_fallback).toEqual(new Set(['--undeclared']))
	expect(actual.undeclared.size).toBe(0)
	expect(actual.all.get('--undeclared')).toHaveLength(2)
})

test('declared property with a fallback is not flagged as undeclared', () => {
	let actual = analyze(`
	x {
		--declared: 1;
		color: var(--declared, red);
	}`)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
	expect(actual.unused.size).toBe(0)
})

test('empty input', () => {
	let actual = analyze('')
	expect(actual.all.size).toBe(0)
	expect(actual.unused.size).toBe(0)
	expect(actual.undeclared.size).toBe(0)
	expect(actual.undeclared_with_fallback.size).toBe(0)
})
