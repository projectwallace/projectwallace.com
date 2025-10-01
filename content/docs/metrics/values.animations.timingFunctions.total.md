---
title: Total animation timing functions
---

The total number of `animation-timing-function`s and `transition-timing-function`s, including the ones that are part of the `animation` and `transition` shorthand.

## Example

```css
selector {
	/* Regular animation- & transition-timing-function properties */
	animation-timing-function: linear;
	animation-timing-function: ease-in-out;
	transition-timing-function: cubic-bezier(0, 0, 1, 1);

	/* `animation` shorthand property */
	animation: 2s my-animation linear;
}
```

The resulting metric looks like this:

```js
{
  "values.animations.timingFunctions.total": 4
}
```

## Further reading

- [Analyzing CSS animations](/blog/analyzing-animations)
