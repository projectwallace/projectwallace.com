import recommendedConfig from '@projectwallace/stylelint-plugin/configs/recommended'
import performanceConfig from '@projectwallace/stylelint-plugin/configs/performance'
import maintainabilityConfig from '@projectwallace/stylelint-plugin/configs/maintainability'
import correctnessConfig from '@projectwallace/stylelint-plugin/configs/correctness'
import designTokensConfig from '@projectwallace/stylelint-plugin/configs/design-tokens'
import holisticConfig from '@projectwallace/stylelint-plugin/configs/holistic'
import type { Config } from 'stylelint'
import { type Preset } from '$lib/lint-preset'

export const PRESET_MAP: Record<Preset, NonNullable<Config['rules']> | undefined> = {
	recommended: recommendedConfig.rules,
	performance: performanceConfig.rules,
	maintainability: maintainabilityConfig.rules,
	correctness: correctnessConfig.rules,
	designtokens: designTokensConfig.rules,
	holistic: holisticConfig.rules
}
