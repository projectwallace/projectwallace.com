<script module lang="ts">
	const supports_highlights = typeof window !== 'undefined' && 'highlights' in window.CSS

	const token_types = ['AtruleName', 'Selector', 'Property', 'Value']

	if (supports_highlights) {
		for (let type of token_types) {
			window.CSS.highlights.set(type, new Highlight())
		}
	}

	// TODO: cleanup CSS.highlights on unmount
	// Keep track of instance count and when it reaches 0, cleanup by clearing Highlights
</script>

<script lang="ts">
	import type { Hunk } from '$lib/diff-css'

	interface Props {
		hunk: Hunk
	}

	let { hunk }: Props = $props()

	function highlight_line(node: HTMLElement, { value }: { value: string }) {
		if (value.length === 0) return
		if (!supports_highlights) return

		let text_node = node.firstChild!
		let end_char_pos = value.length - 1
		let end_char = value.charCodeAt(end_char_pos)
		let highlights = window.CSS.highlights

		function create_range(start: number, end: number) {
			return new StaticRange({
				startContainer: text_node,
				startOffset: start,
				endContainer: text_node,
				endOffset: end
			})
		}

		if (end_char === 123 /* { */) {
			let start_char = value.charCodeAt(0)
			if (start_char === 64 /* @ */) {
				// AtruleName + optional AtrulePrelude + {
				highlights.get('AtruleName')?.add(create_range(0, value.indexOf(' ')))
			} else {
				// selector + {
				highlights.get('Selector')?.add(create_range(0, end_char_pos))
			}
		} else if (end_char === 44 /* , */) {
			// selector + ,
			highlights.get('Selector')?.add(create_range(0, end_char_pos))
		} else if (end_char === 59 /* ; */) {
			// property + : + value + ;
			let colon_index = value.indexOf(':')
			if (colon_index !== -1) {
				highlights.get('Property')?.add(create_range(0, colon_index))
				highlights.get('Value')?.add(create_range(colon_index + 1, end_char_pos))
			}
		} else if (end_char === 125 /* } */ && value.charCodeAt(end_char_pos - 1) === 123 /* { */) {
			// Empty block === Selector/AtRulePrelude + {}
			let start_char = value.charCodeAt(0)
			if (start_char === 64 /* @ */) {
				// AtruleName + optional AtrulePrelude + {}
				highlights.get('AtruleName')?.add(create_range(0, value.indexOf(' ')))
			} else {
				// selector + {}
				highlights.get('Selector')?.add(create_range(0, end_char_pos))
			}
		}
	}
</script>

<pre
	dir="ltr"
	translate="no"
	aria-hidden="true"
	class="hunk-diff">@@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@</pre>
<table>
	<thead hidden>
		<tr>
			<th scope="col">Original file line number</th>
			<th scope="col">Diff line number</th>
			<th scope="col">Diff line change</th>
		</tr>
	</thead>
	<!-- The 'fixed' height is to help the browser get to the expected height faster, this makes rendering 3-4 faster -->
	<tbody style:height={`calc(var(--leading-base) * var(--size-xs) * ${hunk.lines.length}`}>
		{#each hunk.lines as { added, deleted, old_line_number, new_line_number, value }}
			{@const unchanged = !added && !deleted}
			<tr
				class={{
					added,
					deleted,
					unchanged
				}}
				data-testid={added ? 'diff-line-added' : deleted ? 'diff-line-deleted' : 'diff-line-unchanged'}
			>
				<td class="line-number line-number-old">
					{old_line_number}
				</td>
				<td class="line-number line-number-new">
					{new_line_number}
				</td>
				<td class="code-cell">
					<code use:highlight_line={{ value }} class:added class:deleted class:unchanged>{value}</code>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.hunk-diff {
		font-family: var(--font-mono);
		padding-inline: 2ch;
		padding-block: var(--space-1);
		background-color: light-dark(var(--bg-200), var(--blue-800));
		color: var(--fg-300);
	}

	table {
		width: 100%;
		--diff-font-size: var(--size-xs);
		font-size: var(--diff-font-size);
		border-collapse: collapse;
	}

	td:nth-of-type(1),
	td:nth-of-type(2) {
		/* Should fit up to line number 999_999 */
		width: 6ch;
	}

	tr {
		/* Speed up rendering */
		--pw-diff-tr-height: calc(var(--diff-font-size) * var(--leading-base));
		height: var(--pw-diff-tr-height);
		content-visibility: auto;
		contain-intrinsic-block-size: var(--pw-diff-tr-height);
	}

	tr.deleted {
		background-color: light-dark(var(--red-100), var(--red-700));
		color: var(--fg-100);

		& :is(.line-number-old, .line-number-new) {
			background-color: light-dark(var(--red-200), var(--red-600));
			color: light-dark(var(--red-900), var(--red-100));
		}

		& .line-number-new {
			color: rgb(0 0 0 / 0);
		}
	}

	tr.added {
		background-color: light-dark(var(--green-100), var(--green-700));
		color: var(--fg-100);

		& :is(.line-number-old, .line-number-new) {
			background-color: light-dark(var(--green-200), var(--green-600));
		}

		& .line-number-old {
			color: rgb(0 0 0 / 0);
		}
	}

	tr.unchanged {
		color: var(--fg-200);

		& :is(.line-number-old, .line-number-new) {
			background-color: transparent;
			color: var(--fg-300);
		}
	}

	code {
		tab-size: 4;
		white-space: pre;
		display: block;
	}

	.line-number {
		user-select: none;
		font-family: var(--font-mono);
		color: var(--fg-0);
		padding-inline: 2ch 1ch;
	}

	td.code-cell {
		padding-left: 1ch;
	}

	code.added::before {
		content: '+	';
	}

	code.deleted::before {
		content: '-	';
	}

	code.unchanged::before {
		content: ' 	';
	}
</style>
