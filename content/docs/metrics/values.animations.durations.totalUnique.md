---
title: Total unique animation durations
---

The total number of _unique_ `animation-duration`s and `transition-duration`s, including the ones that are part of the `animation` and `transition` shorthand.

## Example

```css
selector {
	/* Regular animation-duration properties */
	animation-duration: 1s;
	transition-duration: 2000ms;

	/* `animation` shorthand property */
	animation: 2s my-animation;
}
```

The resulting metric looks like this:

```js
{
  "values.animations.durations.totalUnique": 3
}
```

Note that `2s` and `2000ms` are not strictly equal, because of their different notations.

## Further reading

- [Analyzing CSS animations](/blog/analyzing-animations)
