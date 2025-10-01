class KeywordSet {
    #set: Set<string>

    constructor(items: string[]) {
        this.#set = new Set(items)
    }

    has(item: string) {
        return this.#set.has(item.toLowerCase())
    }
}

export const shorthands = new KeywordSet([
    'all',
    'animation',
    'background',
    'border',
    'border-block-end',
    'border-block-start',
    'border-bottom',
    'border-color',
    'border-image',
    'border-inline-end',
    'border-inline-start',
    'border-left',
    'border-radius',
    'border-right',
    'border-style',
    'border-top',
    'border-width',
    'column-rule',
    'columns',
    'contain-intrinsic-size',
    'flex',
    'flex-flow',
    'font',
    'gap',
    'grid',
    'grid-area',
    'grid-column',
    'grid-row',
    'grid-template',
    'inset',
    'list-style',
    'margin',
    'mask',
    'offset',
    'outline',
    'overflow',
    'padding',
    'place-content',
    'place-items',
    'place-self',
    'scroll-margin',
    'scroll-padding',
    'scroll-timeline',
    'text-decoration',
    'text-emphasis',
    'transition',
])
