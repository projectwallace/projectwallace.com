---
title: Average cohesion
deprecated: 2.7.0
removed: 4.0.0
---

The average number of declarations per RuleSet.

## Examples

```css
/* 1 declaration */
selector {
	property: value;
}

/* 2 declarations */
selector {
	property1: value1;
	property2: value2;
}

/* 3 declarations */
selector {
	property1: value1;
	property2: value2;
	property3: value3;
}

/* The average here is (1 + 2 + 3) / 3 = 2 */
```
