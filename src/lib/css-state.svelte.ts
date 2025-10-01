import { onDestroy, setContext, getContext } from "svelte"
import { format } from "@projectwallace/format-css"
import type { CSSOrigin } from "./css-origins"
import { SvelteSet } from "svelte/reactivity"
import type { CssLocation } from "./css-location"
import { type NodeType } from "$components/use-css-highlight"

type Selectable = {
	type: string
	node_type?: NodeType
	value: string
	locations: CssLocation[]
}

class CssState {
	should_prettify = $state<boolean>(true)
	enabled_origins = new Set<number>()
	origins: CSSOrigin[] = $state([])
	css = $state<string>('')
	selected_origin = $state<number | undefined>()
	selected_item = $state<Selectable | undefined>()
	selected_item_node_type = $state<NodeType | undefined>()
	selected_location = $state<number | undefined>()
	run_id = $state<string | undefined>()
	url = $state<string | undefined>()

	constructor() {
		onDestroy(() => {
			this.enabled_origins.clear()
		})
	}

	#join_origins() {
		let blob = ''
		for (let i of this.enabled_origins) {
			blob += this.origins[i].css
		}
		return this.should_prettify ? format(blob) : blob
	}

	set_origins(origins: CSSOrigin[]) {
		this.origins = origins
		this.enabled_origins = new SvelteSet(origins.map((_, i) => i))
		this.css = this.#join_origins()
		this.selected_item = undefined
		this.selected_location = undefined
		this.selected_origin = undefined
		this.run_id = crypto.randomUUID()
	}

	disable_origin_at(index: number) {
		this.enabled_origins.delete(index)
		this.css = this.#join_origins()
	}

	enable_origin_at(index: number) {
		this.enabled_origins.add(index)
		this.css = this.#join_origins()
	}

	enable_origins_at(indices: number[]) {
		this.enabled_origins = new Set(indices)
		this.css = this.#join_origins()
	}

	prettify(enabled = true) {
		this.should_prettify = enabled
		this.css = this.#join_origins()
		this.unselect_item()
		this.unselect_location()
	}

	uglify() {
		this.should_prettify = false
		this.css = this.#join_origins()
		this.unselect_item()
		this.unselect_location()
	}

	select_origin_at(index: number) {
		this.selected_origin = index
	}

	unselect_origin() {
		this.selected_origin = undefined
	}

	enable_all_origins() {
		this.enabled_origins = new SvelteSet(this.origins.map((_, i) => i))
		this.css = this.#join_origins()
	}

	disable_all_origins() {
		this.enabled_origins.clear()
		this.css = ''
		this.unselect_item()
	}

	select_item(item: Selectable) {
		this.selected_item = item
		this.selected_location = 0
		this.selected_item_node_type = item.node_type
	}

	unselect_item() {
		this.selected_item = undefined
		this.selected_location = undefined
		this.selected_item_node_type = undefined
	}

	select_location_at(index: number) {
		this.selected_location = index
	}

	unselect_location() {
		this.selected_location = undefined
	}

	get_css_at(index: number) {
		let blob = this.origins[index].css
		if (this.should_prettify) {
			blob = format(blob)
		}
		return blob
	}
}

const STATE_KEY = Symbol('css-state')

export function set_css_state() {
	return setContext(STATE_KEY, new CssState())
}

export function get_css_state() {
	return getContext<ReturnType<typeof set_css_state>>(STATE_KEY)
}
