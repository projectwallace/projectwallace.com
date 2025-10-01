---
title: Analyzing CSS animations
excerpt: Project Wallace now supports analysis of CSS animation and transition durations and timing functions.
author: bartveneman
---

Animations and transitions are becoming part of many design systems. In the early days of style guides it used to be enough to keep track of font-sizes and colors. But these days design systems have evolved into full-blown user experience documents and animations are now first-class citizens. That's why Wallace now also analyzes animation-related properties. Let's take a look at [the new features](https://www.projectwallace.com/~teamwallace/project-wallace/animations).

## Animation and transition durations

Most design systems with animations have standardized their [animation durations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration). The animation-duration is the time it takes from the start of an animation until it has finished.

```css
.example {
	/* in seconds */
	animation-duration: 2s;
	/* in miliseconds */
	animation-duration: 200ms;

	/* with shorthand notation */
	animation: 2s animationName;
	/* with shorthand AND animation-delay */
	animation: 2s animationName 1s linear;

	/* with transition shorthand */
	transition: color 200ms ease-in;
}
```

Analysis result:

```json
{
	"values.animations.durations.total": 5,
	"values.animations.durations.totalUnique": 2,
	"values.animations.durations.unique": [
		{
			"value": "200ms",
			"count": 2
		},
		{
			"value": "2s",
			"count": 3
		}
	]
}
```

The Wallace CSS Analyzer finds an animation-duration of `2s` or `200ms` for all these declarations. Note that Wallace also analyzes `transition`-related declarations.

## Animation and transition timing functions

Similar to analyzing animation-durations, the Wallace CSS Analyzer looks at animation and transition [timing functions](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function). Timing functions can be keywords like `linear`, or `ease-in-out`, but also `cubic-bezier(0, 1, 1, 0)` or even `steps(4, step-end)`. These timing functions add liveliness to your animations and a lot of studies have been done to optimize timing functions. So once you have found the perfect timing for your animation, it's good to stick to it.

```css
.example {
	transition: background 0.2s ease-in-out;
	animation: 2s animationName steps(4);
	animation-timing-function: cubic-bezier(0, 1, 0, 1);
}
```

Result:

```json
{
	"values.animations.timingFunctions.total": 5,
	"values.animations.timingFunctions.totalUnique": 2,
	"values.animations.timingFunctions.unique": [
		{
			"value": "cubic-bezier(0, 1, 0, 1)",
			"count": 1
		},
		{
			"value": "ease-in-out",
			"count": 1
		},
		{
			"value": "steps(4)",
			"count": 1
		}
	]
}
```

## Next steps

These reports are also available in [projectwallace.com](https://www.projectwallace.com), [Wallace CLI](https://github.com/bartveneman/wallace-cli) and [Constyble](https://github.com/bartveneman/constyble). What are you going to do with these reports? What scary values did you find? Let me know [on Twitter](https://twitter.com/bartveneman)!
