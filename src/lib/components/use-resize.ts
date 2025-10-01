export function resize(node: HTMLButtonElement) {
	let drag_status: 'resizing' | 'off' = 'off'
	let drag_method: 'pointer' | 'keyboard'
	let drag_offset = 0

	node.addEventListener('pointerdown', on_pointerdown)
	document.addEventListener('pointermove', on_pointermove)
	document.addEventListener('pointerup', on_pointerup)
	node.addEventListener('focus', on_focus)
	node.addEventListener('blur', on_blur)
	document.addEventListener('keydown', on_keypress)

	function on_pointerdown(event: PointerEvent) {
		drag_status = 'resizing'
		drag_method = 'pointer'
		// prevent event becoming a .focus() as well
		event.preventDefault()
	}

	function on_pointermove(event: PointerEvent) {
		if (drag_status === 'resizing' && drag_method === 'pointer') {
			event.preventDefault()
			drag_offset -= event.movementY
			node.dispatchEvent(new CustomEvent('resize', {
				detail: drag_offset
			}))
		}
	}

	function on_pointerup() {
		if (drag_status === 'resizing' && drag_method === 'pointer') {
			drag_status = 'off'
		}
	}

	function on_focus() {
		drag_status = 'resizing'
		drag_method = 'keyboard'
	}

	function on_blur() {
		if (drag_status === 'resizing' && drag_method === 'keyboard') {
			drag_status = 'off'
		}
	}

	function on_keypress(event: KeyboardEvent) {
		if (drag_status === 'resizing') {
			if (event.key === 'Escape') {
				event.preventDefault()
				node.blur()
				return
			}

			if (drag_method === 'keyboard') {
				if (event.key === 'ArrowUp') {
					event.preventDefault()
					drag_offset += 5
					node.dispatchEvent(new CustomEvent('resize', {
						detail: drag_offset
					}))
				} else if (event.key === 'ArrowDown') {
					event.preventDefault()
					drag_offset -= 5
					node.dispatchEvent(new CustomEvent('resize', {
						detail: drag_offset
					}))
				}
			}
		}
	}

	return {
		destroy: () => {
			node.removeEventListener('pointerdown', on_pointerdown)
			document.removeEventListener('pointermove', on_pointermove)
			document.removeEventListener('pointerup', on_pointerup)
			node.removeEventListener('focus', on_focus)
			node.removeEventListener('blur', on_blur)
			document.removeEventListener('keydown', on_keypress)
		}
	}
}
