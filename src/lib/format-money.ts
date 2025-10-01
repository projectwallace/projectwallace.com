export function format_money(centAmount: number) {
	return (centAmount / 100).toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD'
	})
}