export const presets = ['recommended', 'performance', 'maintainability', 'correctness', 'designtokens', 'holistic'] as const
export type Preset = (typeof presets)[number]
export const DEFAULT_PRESET: Preset = presets[0]
