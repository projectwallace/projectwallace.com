function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

type ItemElement = HTMLElement

type OnChange = ({ value, active_index }: { value: string; active_index: number }) => void

function noop() {}

export function create_keyboard_list({ enabled = true }: { enabled?: boolean } = {}) {
	if (!enabled) {
		return {
			elements: { root: noop, item: noop }
		}
	}

	let root: HTMLElement
	let child_count = 0
	let active_index = -1
	let onchange_handler: OnChange = noop

	function on_root_keydown(event: KeyboardEvent) {
		// important: selection does not follow focus
		// https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#decidingwhentomakeselectionautomaticallyfollowfocus

		// Enter or Space: select the focused option
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			let item = root.querySelector('[tabindex="0"]') as HTMLElement | null
			if (item !== null) {
				item.tabIndex = 0
				item.focus()
				onchange_handler({ value: item.dataset.value!, active_index })
			}
			return
		}

		// 1. ArrowDown: move focus and select the next option
		// 2. ArrowUp: move focus and select the previous option
		// 3. Home: move focus and select the first option
		// 4. End: move focus and select the last option
		let new_index = active_index
		let is_meta = event.metaKey || event.ctrlKey

		if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (is_meta) {
				new_index = child_count - 1
			} else {
				new_index = clamp(active_index + 1, 0, child_count - 1)
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (is_meta) {
				new_index = 0
			} else {
				new_index = clamp(active_index - 1, 0, child_count - 1)
			}
		} else if (event.key === 'Home') {
			event.preventDefault()
			new_index = 0
		} else if (event.key === 'End') {
			event.preventDefault()
			new_index = child_count - 1
		}

		if (new_index !== active_index) {
			if (active_index !== -1) {
				let node = root.querySelector('[tabindex="0"]') as HTMLElement | null
				if (node !== null) {
					node.tabIndex = -1
				}
			}
			active_index = new_index
			let node = root.childNodes[new_index] as HTMLElement
			if (node) {
				node.tabIndex = 0
				node.focus()
			}
		}
	}

	function on_root_click(event: MouseEvent) {
		let target = (event.target as HTMLElement)?.closest('tr')
		let index = target?.sectionRowIndex

		if (index === undefined) {
			return
		}

		let old_node = root.childNodes[active_index]
		if (active_index !== -1 && old_node) {
			;(old_node as HTMLElement).tabIndex = -1
		}
		active_index = index
		let node = root.childNodes[active_index] as HTMLElement
		if (node) {
			node.tabIndex = 0
			node.focus()
			onchange_handler({ value: node.dataset.value!, active_index })
		}
	}

	return {
		elements: {
			item: function (
				node: ItemElement,
				{
					value
				}: {
					value: string
				}
			) {
				node.dataset.value = value

				if (node.getAttribute('aria-selected') === 'true' || active_index === -1) {
					active_index = child_count
					node.tabIndex = 0
				} else {
					node.tabIndex = -1
				}
				child_count++

				function on_item_click() {
					if (active_index !== -1) {
						;(root.childNodes[active_index] as HTMLElement).tabIndex = -1
					}
					let i = 0
					for (let item of root.childNodes) {
						if (item === node) {
							active_index = i
							break
						}
						i++
					}
					node.tabIndex = 0
					node.focus()
					onchange_handler({ value, active_index })
				}

				if (node.tagName !== 'TR') {
					node.addEventListener('click', on_item_click)
				}

				return {
					destroy() {
						child_count--
						if (node.tagName !== 'TR') {
							node.removeEventListener('click', on_item_click)
						}
					}
				}
			},
			root: function (
				node: HTMLElement,
				{
					onchange
				}: {
					onchange: OnChange
				}
			) {
				root = node
				root.tabIndex = -1
				onchange_handler = onchange

				root.addEventListener('keydown', on_root_keydown)
				root.addEventListener('click', on_root_click)

				return {
					destroy() {
						child_count = 0
						root.removeEventListener('keydown', on_root_keydown)
						root.removeEventListener('click', on_root_click)
					}
				}
			}
		}
	}
}
