---
title: Introducing Gromit
excerpt: Gromit is a tool that runs in your builds and checks if the stats do not exceed any tresholds that you have set.
author: bartveneman
---

Woof! 🐶 [Introducing Gromit](https://github.com/projectwallace/constyble), a guard dog for your CSS. It is built on top of [Project Wallace's CSS Analyzer](https://github.com/projectwallace/css-analyzer#readme) and checks if your final output CSS does not exceed any tresholds that you've set.

## A quick look

Gromit is at his best when you let him play in your build pipeline. You feed him your CSS and a configuration with tresholds, and he will entertain himself.

```shell
npm test
> cat my-concatenated-styles.css | gromit --config=.gromitrc

TAP version 13

# Subtest: atrules.fontfaces.totalUnique
    ok 1 - atrules.fontfaces.totalUnique should not belarger than 1 (actual: 1)
    1..1
ok 1 - atrules.fontfaces.totalUnique # time=2.298ms

# Subtest: atrules.mediaqueries.totalUnique
    ok 1 - atrules.mediaqueries.totalUnique should notbe larger than 11 (actual: 11)
    1..1
ok 2 - atrules.mediaqueries.totalUnique # time=1.169ms

# Subtest: selectors.id.total
    ok 1 - selectors.id.total should not be larger than 0 (actual: 0)
    1..1
ok 3 - selectors.id.total # time=0.877ms

# Subtest: selectors.js.total
    ok 1 - selectors.js.total should not be larger than 0 (actual: 0)
    1..1
ok 4 - selectors.js.total # time=1.455ms

# Subtest: values.colors.totalUnique
    ok 1 - values.colors.totalUnique should not be larger than 28 (actual: 28)
    1..1
ok 5 - values.colors.totalUnique # time=1.041ms

1..5
# time=40.526ms

 ✔ "Well done, lad! Very well done..."
✨  Done in 2.66s.
```

## The configuration

The configuration is based on all the metrics that Wallace's CSS Analyzer can measure. All metrics are optional by default. Here's an example from the [Gromit repo readme](https://github.com/projectwallace/constyble#config-file):

### .gromitrc config file example

```jsonc
{
	// Do not exceed 4095, otherwise IE9
	// will drop any subsequent rules
	"selectors.total": 4095,
	"selectors.id.total": 0,
	"values.colors.totalUnique": 2,
	"values.colors.unique": ["#fff", "#000"]
}
```

This example configuration disallows having more than 4095 selectors in total, disallows any ID selectors, and allows only the colors `#fff` and `#000` to be present in the CSS.

## Why not use CSS linters?

Who said you can't use both? Linters like Stylelint, EsLint and many more have proven to be very helpful in many ways, but we usually configure them to look at our to-be-transformed CSS, like Less or Stylus. That means that we don't often look at the CSS that these preprcessors generate. Using a preprocessor sometimes makes it hard to guess what CSS eventually comes out. Gromit looks at the actual CSS and warns you if some Sass mixin accidentally created a color you don't want to exist.

### Example of preprocessor creating undesired values

```scss
// This will produce a color based on your $grey variable,
// but darker and less opaque
.box {
	box-shadow: 1em 1em 1em opacify(darken($grey, 10%), 0.5);
}
```

Setting up Gromit or any linter is probably equally hard or easy for both (which isn't very hard).
