<script lang="ts">
	interface Props {
		url?: string
		name: string
		id: string
		described_by?: string | undefined
		valid?: boolean
	}

	let { url = $bindable(''), name, id, described_by = undefined, valid = true }: Props = $props()
</script>

<input
	type="text"
	{name}
	{id}
	inputmode="url"
	placeholder="projectwallace.com"
	required
	class="input"
	autocapitalize="off"
	autocorrect="off"
	spellcheck="false"
	aria-invalid={valid === false ? 'true' : undefined}
	aria-describedby={described_by}
	bind:value={url}
/>
