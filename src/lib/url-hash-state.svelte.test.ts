import { test, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('$app/navigation', () => ({ goto: () => Promise.resolve() }))
vi.mock('$app/env', () => ({ browser: true }))

import { decode_hash_state, encode_hash_state, HashState } from './url-hash-state.svelte.ts'

const location = { hash: '' }

beforeEach(() => {
	vi.useFakeTimers()
	location.hash = ''
	vi.stubGlobal('window', { location })
})

afterEach(() => {
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('encode/decode round-trip', () => {
	const value = { css: 'a { content: "ü€" }', n: 1 }
	expect(decode_hash_state(encode_hash_state(value))).toEqual(value)
})

test('decode strips a leading #', () => {
	expect(decode_hash_state('#' + encode_hash_state('hello'))).toBe('hello')
})

test('decode returns undefined for empty or invalid input', () => {
	expect.soft(decode_hash_state('')).toBeUndefined()
	expect.soft(decode_hash_state('#')).toBeUndefined()
	expect.soft(decode_hash_state('%%%not-base64')).toBeUndefined()
	expect.soft(decode_hash_state(btoa('not json'))).toBeUndefined()
})

// Note: vitest resolves Svelte's server build, where `$effect` is a no-op, so the
// debounced write-back to the hash is not covered here. Only initial state is.
test('HashState uses the default when the hash is empty', () => {
	const state = new HashState({ a: 1, b: 2 })
	expect(state.current).toEqual({ a: 1, b: 2 })
})

test('HashState merges the decoded hash over object defaults', () => {
	location.hash = encode_hash_state({ a: 5 })
	const state = new HashState<{ a: number; b: number }>({ a: 1, b: 2 })
	expect(state.current).toEqual({ a: 5, b: 2 })
})

test('HashState uses a decoded primitive over the default', () => {
	location.hash = encode_hash_state('from-hash')
	const state = new HashState('default')
	expect(state.current).toBe('from-hash')
})

test('HashState current is settable', () => {
	const state = new HashState('a')
	state.current = 'b'
	expect(state.current).toBe('b')
})
