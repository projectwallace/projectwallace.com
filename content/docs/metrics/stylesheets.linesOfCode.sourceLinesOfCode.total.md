---
title: Source Lines of Code
---

Source lines of code are counted as the sum of these things:

- The number of selectors;
- The number of declarations;
- The number of atrules;

```css
/* 2 Source Lines Of Code */
selector {
	property: value;
}

/* 4 Source Lines Of Code */
selector1,
selector2 {
	property: value;
	property: value;
}

/* 5 Source Lines of Code */
@media (min-width: 400px) {
	selector1,
	selector2 {
		property: value;
		property: value;
	}
}

/* 4 Source Lines of Code */
@media (min-width: 400px) and (max-width: 800px) {
	@supports (display: grid) {
		.deep-selector {
			color: tomato;
		}
	}
}
```

## Further reading

- [Counting Lines of Code in CSS](/blog/counting-lines-of-code-in-css)
