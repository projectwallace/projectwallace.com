export const themes = ['dark', 'light', 'system', 'naked'] as const

export type Theme = (typeof themes)[number]

export function validate_theme(theme?: string): theme is Theme {
	return themes.includes(theme as Theme)
}
