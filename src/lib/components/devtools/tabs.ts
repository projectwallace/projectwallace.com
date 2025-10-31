import type { IconName } from '$components/Icon.svelte'

export type TabId = 'inspector' | 'network' | 'report' | 'css' | 'design_tokens' | 'layers' | 'properties'

export type DevtoolsTab = {
	id: TabId
	name: string
	icon: IconName
}

const inspector: DevtoolsTab = {
	id: 'inspector',
	name: 'Inspector',
	icon: 'target'
}

export const network: DevtoolsTab = {
	id: 'network',
	name: 'Network',
	icon: 'network'
}

const report: DevtoolsTab = {
	id: 'report',
	name: 'Report Data',
	icon: 'file'
}

const css: DevtoolsTab = {
	id: 'css',
	name: 'All CSS',
	icon: 'code'
}

const design_tokens: DevtoolsTab = {
	id: 'design_tokens',
	name: 'Design Tokens',
	icon: 'brush'
}

const layers: DevtoolsTab = {
	id: 'layers',
	name: 'Layers',
	icon: 'layers'
}

export const properties: DevtoolsTab = {
	id: 'properties',
	name: 'Properties',
	icon: 'cubes'
}

export const analyzer_tabs = [inspector, network, report, css]

export const design_token_tabs = [inspector, network, report, css, design_tokens]

export const layers_tabs = [inspector, network, css, layers]
