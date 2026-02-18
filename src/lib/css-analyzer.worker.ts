import { analyze } from '@projectwallace/css-analyzer'

self.onmessage = (event: MessageEvent<string>) => {
	const result = analyze(event.data, { useLocations: true })
	self.postMessage(result)
}
