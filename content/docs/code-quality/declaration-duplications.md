---
title: Declaration Duplications
unit: Declaration duplication
format: percentage
category: performance
---

To keep filesize at a minimum, Declarations should not be repeated too often. A lot of duplicated Declarations are a sign that something could be abstracted away or pieces are possibly obsolete and need a cleanup.

Scoring high here means a lot of Declarations (combinations of the same Property and Value) are duplicated across the CSS.

```css
/* The same declaration repeated several times */
.warning {
	font-size: 14px;
}

.small {
	font-size: 14;
}

.footer {
	font-size: 14px;
}
```
