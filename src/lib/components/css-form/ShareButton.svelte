<script lang="ts">
	import Button from '$components/Button.svelte'

	let copied = $state(false)

	async function share() {
		await navigator.clipboard.writeText(window.location.href)
		copied = true
		setTimeout(() => { copied = false }, 2000)
	}
</script>

<Button onclick={share} size="sm">{copied ? 'Copied!' : 'Copy share link'}</Button>
