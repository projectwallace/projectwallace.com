import type { analyze as AnalyzeCss } from '@projectwallace/css-analyzer'

export class CssAnalysisError extends Error { }

export type CssAnalysis = ReturnType<typeof AnalyzeCss>
