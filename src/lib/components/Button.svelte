<script lang="ts">
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements'
	import type { Variant } from './Button'
	import type { IconName } from './Icon.svelte'
	import Icon from './Icon.svelte'

	type Size = 'sm' | 'md' | 'lg'

	type GenericButtonProps = {
		variant?: Variant
		size?: Size
		icon?: IconName | undefined
		on_click?: (event: MouseEvent) => void
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
		on_click = () => {},
		children,
		...rest
	}: Props = $props()
</script>

<!-- We know this is either a <a> or a <button> -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element this={element} onclick={on_click} class="btn {variant} {size} {classname}" {...rest}>
	{#if icon}
		<Icon name={icon} size={14} />
	{/if}
	{@render children?.()}
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
		border: 0 solid transparent;
		transition:
			color 0.1s ease-out,
			background-color 0.1s ease-out,
			box-shadow 0.1s ease-out;

		@media print {
			border: var(--space-1) solid;
		}

		:is(&:hover, &:focus) :global(.icon) {
			opacity: 1;
		}
	}

	.primary {
		font-family: var(--font-display);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-wider);
		line-height: var(--leading-tight);
		font-style: normal;
		text-transform: uppercase;
		background-color: var(--accent);
		color: var(--gray-800);

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
		padding: 0.3em var(--space-2);
		font-size: var(--size-sm);
	}

	.md {
		padding: var(--space-3) var(--space-4);
		font-size: var(--size-base);
	}

	.lg {
		padding: 0.9em var(--space-5);
		font-size: var(--size-lg);
	}
</style>
