import { analyze, type ResultOf } from '@projectwallace/css-analyzer'
import {
	atrules,
	border_radiuses,
	box_shadows,
	colors,
	declarations,
	displays,
	durations,
	font_families,
	font_sizes,
	gradients,
	line_heights,
	properties,
	resets,
	rules,
	selectors,
	specificity,
	stylesheet,
	text_shadows,
	timing_functions,
	units,
	value_browserhacks,
	value_complexity,
	value_prefixes,
	z_indexes
} from '@projectwallace/css-analyzer/collectors'

export class CssAnalysisError extends Error {}

function create_collectors() {
	return {
		stylesheet: stylesheet({ locations: true }),
		atrules: atrules({ locations: true, sequence: true }),
		rules: rules({ locations: true, sequence: true }),
		selectors: selectors({ locations: true, sequence: true }),
		specificity: specificity({ locations: true }),
		declarations: declarations({ locations: true, sequence: true }),
		properties: properties({ locations: true }),
		colors: colors({ locations: true, contexts: true }),
		font_sizes: font_sizes({ locations: true }),
		font_families: font_families({ locations: true }),
		line_heights: line_heights({ locations: true }),
		gradients: gradients({ locations: true }),
		box_shadows: box_shadows({ locations: true }),
		text_shadows: text_shadows({ locations: true }),
		border_radiuses: border_radiuses({ locations: true, contexts: true }),
		durations: durations({ locations: true }),
		timing_functions: timing_functions({ locations: true }),
		units: units({ locations: true }),
		z_indexes: z_indexes({ locations: true }),
		displays: displays({ locations: true }),
		resets: resets({ locations: true }),
		value_prefixes: value_prefixes({ locations: true }),
		value_browserhacks: value_browserhacks({ locations: true }),
		value_complexity: value_complexity({ sequence: true })
	}
}

export type CssAnalysis = ResultOf<ReturnType<typeof create_collectors>>

export function analyze_css(css: string): CssAnalysis {
	return analyze(css, create_collectors())
}

function create_code_quality_collectors() {
	return {
		stylesheet: stylesheet({ locations: true }),
		atrules: atrules({ locations: true }),
		rules: rules({ locations: true, sequence: true }),
		selectors: selectors({ locations: true, sequence: true }),
		specificity: specificity({ locations: true }),
		declarations: declarations({ locations: true })
	}
}

export type CodeQualityAnalysis = ResultOf<ReturnType<typeof create_code_quality_collectors>>

export function analyze_code_quality(css: string): CodeQualityAnalysis {
	return analyze(css, create_code_quality_collectors())
}
