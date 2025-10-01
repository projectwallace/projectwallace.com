import type { analyze as AnalyzeCss } from '@projectwallace/css-analyzer'

let worker: Worker

export class CssAnalysisError extends Error { }

export type CssAnalysis = ReturnType<typeof AnalyzeCss>

export function analyze(css: string) {
	return new Promise((resolve, reject) => {
		// setup the worker
		if (!worker) {
			worker = new Worker(new URL('$lib/analyzer-worker.js', import.meta.url), {
				type: 'module'
			})
		}

		// Respond to worker callbacks
		worker.onmessage = (event) => {
			if ('error' in event.data) {
				reject(new CssAnalysisError(event.data.error))
			}
			resolve(event.data as CssAnalysis)
		}

		worker.onerror = (error) => reject(error)

		// Send CSS to the worker
		worker.postMessage(css)
	})
}
