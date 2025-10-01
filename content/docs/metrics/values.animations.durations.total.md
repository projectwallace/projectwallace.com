---
title: Total animation durations
---

The total number of `animation-duration`s and `transition-duration`s, including the ones that are part of the `animation` and `transition` shorthand.

## Example

```css
selector {
	/* Regular animation-duration properties */
	animation-duration: 0s;
	animation-duration: 1s;
	transition-duration: 2000ms;

	/* `animation` shorthand property */
	animation: 5s my-animation;
}
```

The resulting metric looks like this:

```js
{
  "values.animations.durations.total": 4
}
```

## Further reading

- [Analyzing CSS animations](/blog/analyzing-animations)
