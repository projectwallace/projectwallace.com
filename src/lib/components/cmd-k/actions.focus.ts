/**
 * @see https://github.com/sveltejs/svelte.dev/blob/main/packages/site-kit/src/lib/actions/focus.ts
 */
export function focusable_children(node: HTMLElement) {
	const nodes: HTMLElement[] = Array.from(
		// this rather intimating selector selects elements that aren't children of closed <details> elements,
		// except for the <summary> elements that are their direct children
		node.querySelectorAll(
			':where(a[href], button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])):not(details:not([open]) *), summary:not(details:not([open]) details *)'
		)
	);

	const index = nodes.indexOf(document.activeElement as HTMLElement);

	function traverse(d: number, selector?: string) {
		const reordered = [...nodes.slice(index), ...nodes.slice(0, index)];

		let i = (reordered.length + d) % reordered.length;
		let node;

		while ((node = reordered[i])) {
			i += d;

			if (!selector || node.matches(selector)) {
				node.focus();
				return;
			}
		}
	}

	return {
		first: (selector?: string) => {
			for (let node of nodes) {
				if (!selector || node.matches(selector)) {
					node.focus()
					break
				}
			}
		},
		last: (selector?: string) => {
			for (let i = nodes.length - 1; i >= 0; i--) {
				const node = nodes[i]
				if (!selector || node.matches(selector)) {
					node.focus()
					break
				}
			}
		},
		next: (selector?: string) => traverse(1, selector),
		prev: (selector?: string) => traverse(-1, selector),
	};
}

export function trap(node: HTMLElement, { reset_focus = true }: { reset_focus?: boolean } = {}) {
	const previous = document.activeElement as HTMLElement;

	const handle_keydown = (e: KeyboardEvent) => {
		if (e.key === 'Tab') {
			e.preventDefault();

			const group = focusable_children(node);
			if (e.shiftKey) {
				group.prev();
			} else {
				group.next();
			}
		}
	};

	node.addEventListener('keydown', handle_keydown);

	return {
		destroy: () => {
			node.removeEventListener('keydown', handle_keydown);
			if (reset_focus) {
				previous?.focus({ preventScroll: true });
			}
		}
	};
}
