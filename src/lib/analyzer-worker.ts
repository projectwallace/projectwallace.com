import { analyze } from '@projectwallace/css-analyzer'

self.onmessage = function (event) {
	try {
		const result = analyze(event.data, { useLocations: true })
		postMessage(result)
	} catch (error: unknown) {
		if (error instanceof Error) {
			if ('message' in error || 'stack' in error) {
				console.error(error.stack || error.message)
			} else {
				console.error(error)
			}
			postMessage({ error: error.message })
		}
	}
}
