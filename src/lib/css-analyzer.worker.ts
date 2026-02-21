import { analyze } from '@projectwallace/css-analyzer'
import { format } from '@projectwallace/format-css'

type WorkerInput = {
	css: string
	prettify: boolean
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
	const { css: raw_css, prettify } = event.data
	const css = prettify ? format(raw_css) : raw_css
	const analysis = analyze(css, { useLocations: true })
	self.postMessage({ css, analysis })
}
