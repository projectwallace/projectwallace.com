---
title: Unique animation timing functions
---

A list of all unique `animation-timing-function`s and `transition-timing-function`s, including the ones that are part of the `animation` and `transition` shorthand.

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
  "values.animations.timingFunctions.unique": [
    {
      "value": "cubic-bezier(0, 0, 1, 1)",
      "count": 1
    },
    {
      "value": "ease-in-out",
      "count": 1
    },
    {
      "value": "linear",
      "count": 2
    }
  ]
}
```

Note that `linear` and `cubic-bezier(0, 0, 1, 1)` are not strictly equal, because of their different notations.

## Further reading

- [Analyzing CSS animations](/blog/analyzing-animations)
