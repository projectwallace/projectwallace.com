/**
 * The browsers Baseline tracks support across, keyed by web-features browser
 * id. Small and stable enough to hand-write rather than generate.
 */
export const browsers: Record<string, string> = {
	chrome: 'Chrome',
	chrome_android: 'Chrome Android',
	edge: 'Edge',
	firefox: 'Firefox',
	firefox_android: 'Firefox Android',
	safari: 'Safari',
	safari_ios: 'Safari iOS'
}

export type BrowserFamily = 'chrome' | 'edge' | 'firefox' | 'safari'

/**
 * One entry per browser logo. Desktop and mobile variants of the same
 * vendor (Chrome/Chrome Android, etc.) share a single icon and support
 * indicator, matching the original Baseline status web component.
 */
export const browser_families: Record<BrowserFamily, { name: string; ids: string[] }> = {
	chrome: { name: 'Chrome', ids: ['chrome', 'chrome_android'] },
	edge: { name: 'Edge', ids: ['edge'] },
	firefox: { name: 'Firefox', ids: ['firefox', 'firefox_android'] },
	safari: { name: 'Safari', ids: ['safari', 'safari_ios'] }
}
