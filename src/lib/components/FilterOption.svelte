<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		name: HTMLInputElement['name']
		id?: HTMLInputElement['id']
		value: string
		group: string
		children: Snippet
	}

	let { name, value, group = $bindable(), children, id: _id }: Props = $props()

	let id = $derived(_id || `${name}-${value}`)
</script>

<div class="option">
	<input bind:group type="radio" {name} {id} {value} />
	<label for={id}>
		{@render children()}
	</label>
</div>

<style>
	.option {
		display: inline-flex;
		gap: var(--space-2);
		align-items: center;
	}
</style>
