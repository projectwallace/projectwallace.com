import { goto } from '$app/navigation'
import { browser } from '$app/environment'

/**
 * Utilities for storing state in the URL hash using base64 encoding.
 *
 * Using hash instead of query params because:
 * - Hash changes don't trigger server requests or page reloads
 * - Avoids server URL length limits (hashes aren't sent to servers)
 * - Common pattern in playgrounds (TypeScript, postcss-preset-env, etc.)
 */

const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function compress(input: string): Promise<string> {
	const stream = new CompressionStream('deflate-raw')
	const writer = stream.writable.getWriter()
	writer.write(encoder.encode(input))
	writer.close()
	const buffer = await new Response(stream.readable).arrayBuffer()
	let binary = ''
	for (const byte of new Uint8Array(buffer)) {
		binary += String.fromCharCode(byte)
	}
	// URL-safe base64: avoids + and / which need percent-encoding in URLs
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function decompress(input: string): Promise<string> {
	// Restore standard base64 from URL-safe variant
	const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
	const binary = atob(base64)
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
	const stream = new DecompressionStream('deflate-raw')
	const writer = stream.writable.getWriter()
	writer.write(bytes)
	writer.close()
	const buffer = await new Response(stream.readable).arrayBuffer()
	return decoder.decode(buffer)
}

/**
 * Encode a value to a compressed, URL-safe base64 string for use in the URL hash.
 */
export async function encodeHashState<T>(value: T): Promise<string> {
	return compress(JSON.stringify(value))
}

/**
 * Decode a compressed base64 value from the URL hash.
 * Returns undefined if hash is empty or invalid.
 */
export async function decodeHashState<T>(hash: string): Promise<T | undefined> {
	const value = hash.startsWith('#') ? hash.slice(1) : hash
	if (!value) return undefined

	try {
		return JSON.parse(await decompress(value)) as T
	} catch {
		// fail silently
	}
}

function merge_with_defaults<T>(defaultValue: T, decoded: T): T {
	if (typeof decoded === 'object' && decoded !== null && typeof defaultValue === 'object' && defaultValue !== null) {
		return { ...defaultValue, ...decoded } as T
	}
	return decoded
}

/**
 * Reactive state synced with the URL hash.
 * Reads initial value from hash asynchronously on mount, writes back with debounce on change.
 *
 * @example
 * const css = new HashState(defaultCss)
 * // use css.current for reading/writing
 *
 * @example
 * const state = new HashState<{ before: string; after: string }>({ before: '', after: '' })
 * // use state.current.before, state.current.after
 */
export class HashState<T> {
	#value = $state<T>() as T
	#debounceMs: number
	#initialized = $state(false)

	constructor(defaultValue: T, debounceMs = 300) {
		this.#value = defaultValue
		this.#debounceMs = debounceMs

		$effect(() => {
			if (!browser) {
				this.#initialized = true
				return
			}
			decodeHashState<T>(window.location.hash).then((decoded) => {
				if (decoded !== undefined) {
					this.#value = merge_with_defaults(defaultValue, decoded)
				}
				this.#initialized = true
			})
		})

		$effect(() => {
			if (!browser || !this.#initialized) return

			// JSON.stringify forces deep tracking of all nested properties
			const serialized = JSON.stringify(this.#value)
			let cancelled = false
			const timeout = setTimeout(async () => {
				if (cancelled) return
				const encoded = await encodeHashState(JSON.parse(serialized))
				if (!cancelled) {
					void goto(`#${encoded}`, { replaceState: true, noScroll: true, keepFocus: true })
				}
			}, this.#debounceMs)
			return () => {
				cancelled = true
				clearTimeout(timeout)
			}
		})
	}

	get current() {
		return this.#value
	}

	set current(value: T) {
		this.#value = value
	}
}
