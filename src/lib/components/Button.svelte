<script lang="ts">
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements'
	import type { Variant } from './Button.ts'
	import type { IconName } from './Icon.svelte'
	import Icon from './Icon.svelte'

	type Size = 'sm' | 'md' | 'lg'

	type GenericButtonProps = {
		variant?: Variant
		size?: Size
		icon?: IconName | undefined
	}

	type AnchorProps = GenericButtonProps &
		HTMLAnchorAttributes & {
			element?: 'a'
		}
	type ButtonProps = GenericButtonProps &
		HTMLButtonAttributes & {
			element?: 'button'
		}

	type Props = AnchorProps | ButtonProps

	let {
		class: classname = '',
		element = 'button',
		variant = 'primary',
		size = 'md',
		icon = undefined,
		children,
		...rest
	}: Props = $props()
</script>

<!-- We know this is either a <a> or a <button> -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- A <button> defaults to type=button so it never submits a surrounding form by accident; pass type="submit" explicitly -->
<svelte:element
	this={element}
	type={element === 'button' ? 'button' : undefined}
	class="btn {variant} {size} {classname}"
	{...rest}
>
	{@render children?.()}
	{#if icon}
		<Icon name={icon} size={size === 'lg' ? 20 : 14} />
	{/if}
</svelte:element>

<style>
	.btn {
		appearance: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		cursor: pointer;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		border: 1px solid transparent;
		transition:
			color var(--duration-fast) ease-out,
			background-color var(--duration-fast) ease-out,
			box-shadow var(--duration-fast) ease-out;

		@media print {
			border: var(--space-1) solid;
		}

		@media (forced-colors: active) {
			background-color: ButtonFace !important;
			color: ButtonText !important;
		}
	}

	.primary {
		font-family: var(--font-display);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-wider);
		line-height: var(--leading-none);
		font-style: normal;
		text-transform: uppercase;
		background-color: var(--accent);
		color: var(--gray-800);
		border: 1px solid var(--accent);

		&:focus,
		&:hover {
			background-color: var(--accent-300);
			color: var(--black);
		}
	}

	.secondary {
		background-color: var(--bg-200);
		color: var(--fg-200);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-snug);
		border-width: 1px;
		border-color: var(--fg-450);

		&:hover {
			background-color: var(--bg-400);
			border-color: var(--fg-400);
		}
	}

	.minimal {
		background-color: transparent;
		color: var(--fg-200);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-tight);
		line-height: var(--leading-none);

		&:focus,
		&:hover {
			background-color: var(--bg-200);
			color: var(--fg-100);
		}
	}

	.sm {
		padding-block: 0.3em;
		padding-inline: var(--space-2);
		font-size: var(--size-sm);
		line-height: var(--leading-base);
	}

	.md {
		padding-block: var(--space-3);
		padding-inline: var(--space-4);
		font-size: var(--size-base);
	}

	.lg {
		padding-block: 0.8em;
		padding-inline: var(--space-5);
		font-size: var(--size-lg);

		& :global(.icon) {
			margin-block-start: -0.2em;
			zoom: 1.2;
		}
	}
</style>
