---
title: Unique animation durations
---

A list of all unique `animation-duration`s and `transition-duration`s, including the ones that are part of the `animation` and `transition` shorthand.

## Example

```css
selector {
	/* Regular animation-duration properties */
	animation-duration: 1s;
	transition-duration: 2000ms;

	/* `animation` shorthand property */
	animation: 2s my-animation;
	transition: 1s my-animation; /* duplicate duration */
}
```

The resulting metric looks like this. The list is [sorted by the duration values](https://github.com/bartveneman/css-time-sort), from low to high.

```js
{
  "values.animations.durations.unique": [
    {
      "value": "1s",
      "count": 2
    },
    {
      "value": "2000ms",
      "count": 1
    },
    {
      "value": "2s",
      "count": 1
    }
  ]
}
```

Note that `2s` and `2000ms` are not strictly equal, because of their different notations.

## Further reading

- [Analyzing CSS animations](/blog/analyzing-animations)
- [Sorting CSS `<time>` values](/blog/sorting-css-time)
