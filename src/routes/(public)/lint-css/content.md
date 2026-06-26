## About this linter

This linter uses the [`@projectwallace/stylelint-plugin`](https://github.com/projectwallace/stylelint-plugin) package to lint your CSS. Use the preset radio buttons to select a preset that is relevant to you. Our Stylelint is unique in that it lints some very unique things as well as doing holistic linting.

## Presets

Apart from exposing all 60+ rules individually, we also ship some opinionated presets.

### Recommended

The recommended preset contains settings for all rules that this plugins has. All settings are sensible defaults, but also opnionated. It is very likely that it will flag many issues in your CSS.

[Recommended preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/recommended.ts)

### Correctness

This preset contains only rules that prevent potential bugs in your CSS, like the use of not-declared container names, invalid z-indexes or the use of pseudo elements in `:is()` or `:where()`.

[Correctness preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/correctness.ts)

### Maintainability

The maintainability preset contains rules aimed at keeping rule sizes, complexity, specificity and spacing resets low and avoid the use of vendor prefixes and browserhacks. And avoid complex shorthands.

[Maintainability preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/maintainability.ts)

### Design tokens

The Design Tokens preset contains all rules that keep track of unique design tokens in your CSS and raises issues if you use too many different font-sizes, colors and other tokens.

[Design Tokens preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/design-tokens.ts)

### Performance

The performance preset contains rule settings that will help you keep your overall stylesheet size low, does not allow comments, does not allow unused custom properties, layers and containers. It also hates duplicate data URL's.

[Performance preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/performance.ts)

### Holistic

The holistic preset is a little different from other presets. It is meant to run on your _entire_ CSS codebase, not the individual resets or component styles. It contains rules that guard the usage of `!important` and overall size and complexity.

[Holistic preset settings](https://github.com/projectwallace/stylelint-plugin/blob/main/src/configs/holistic.ts)
