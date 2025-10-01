---
title: Keep average Selector Complexity low
format: number
unit: Complexity points
category: complexity
---

Low Selector Complexity generally means that Selectors are simple. High complexity means that a Selector consists of several parts, each of which adds to the complexity of understanding what the Selector targets.

```css
/* complexity = 1 */
.selector {
}

/* complexity = 5 */
.selector :where(#many, .parts, [exist]) {
}
```
