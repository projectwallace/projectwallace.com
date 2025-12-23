# Recommendations for @projectwallace/css-parser Improvements

Based on migrating from css-tree to @projectwallace/css-parser in `analyze-custom-properties.ts`, here are recommendations that would improve the migration experience and overall API usability:

## 1. Consistent Location/Length Behavior

**Issue**: The parser includes the trailing semicolon in `Declaration` node lengths, while css-tree excluded it. This creates migration friction.

### Detailed Example:

Given this CSS:
```css
x {
  color: var(--undeclared);
}
```

**css-tree behavior**:
```javascript
declaration.loc.end.offset - declaration.loc.start.offset = 24
// "color: var(--undeclared)" (24 characters, no semicolon)
```

**@projectwallace/css-parser behavior**:
```javascript
declaration.length = 25
declaration.text = "color: var(--undeclared);" (25 characters, includes semicolon)
```

### Why This Matters:

When migrating existing tests or tools that depend on precise byte offsets:
- All expected lengths need manual adjustment (+1 for each declaration)
- Tests fail with cryptic "expected 24, got 25" errors
- No way to know if the difference is the semicolon or a real bug without manual inspection

### Impact on Migration:

In our migration, every single test assertion for declaration locations needed investigation:
```javascript
// Tests expected (css-tree format):
{ column: 3, length: 24, line: 3, offset: 8 }

// Parser returned:
{ column: 3, length: 25, line: 3, offset: 8 }  // +1 for semicolon
```

**Resolution**: After consideration, the new parser's behavior is **more correct** - the semicolon is part of the declaration in the source. We updated all test expectations to match the parser's output:
```javascript
// Updated tests to reflect the correct length including semicolon
{ column: 3, length: 25, line: 3, offset: 8 }
```

### Recommendation:

**Primary**: Document this difference prominently in migration guides. The new parser's behavior is more accurate (semicolons are part of declarations in the source), so migrators should update their tests rather than work around it.

**Add to README**:
```markdown
### ⚠️ Migrating from css-tree?

**Declaration lengths include the semicolon**. This is more accurate than css-tree's
behavior. When migrating tests, add 1 to expected declaration lengths:

    // css-tree (excluded semicolon)
    expect(decl.loc.end.offset - decl.loc.start.offset).toBe(24)

    // @projectwallace/css-parser (includes semicolon - correct!)
    expect(decl.length).toBe(25)
```

**Optional - For Gradual Migration**: Add a parser option for strict css-tree compatibility:
```javascript
parse(css, {
  declaration_length_includes_semicolon: false  // css-tree compatibility mode
})
```

### Why This Is Important:

1. **Test migration burden**: Every location assertion needs manual verification
2. **Silent bugs**: Easy to ship off-by-one errors in location reporting
3. **Tooling compatibility**: Source mapping, error underlining, and code actions rely on exact positions
4. **Developer experience**: The first thing that broke during migration, causing confusion

**This single difference accounted for 6 out of 8 initial test failures.**

## 2. Walker Context API

**Issue**: css-tree's walker provided context like `this.declaration` to access parent nodes during traversal. The new parser requires manual context tracking.

**Example from css-tree**:
```javascript
walk(ast, function (node) {
  if (node.type === 'Function' && node.name === 'var') {
    // Can access the parent declaration via this.declaration
    let loc = to_loc(this.declaration.loc)
  }
})
```

**Recommendation**: Add an optional context parameter to the walk callback:
```javascript
walk(ast, (node, depth, context) => {
  if (node.type === FUNCTION && node.name === 'var') {
    // context.declaration, context.rule, context.atrule, etc.
    let loc = to_loc(context.declaration)
  }
})
```

**Why**: Tracking parent context manually requires additional data structures and complexity. Common use cases like "find all var() usage and report at the declaration level" become harder.

## 3. Consistent Property Naming for Identifiers

**Issue**: For `@property --test`, the Identifier node has:
- `node.name` → `''` (empty string)
- `node.text` → `'--test'` (the actual identifier)

This is counterintuitive. The `name` property seems like it should contain the identifier name.

**Recommendation**:
- Make `node.name` return the identifier text for Identifier nodes, or
- Document clearly when to use `.name` vs `.text` for each node type, or
- Add a convenience property like `node.identifier` for cases where the "main content" is ambiguous

**Why**: Developers expect `name` to contain the semantic content. Having to discover `.text` through trial and error slows migration.

## 4. Migration Guide from css-tree

**Issue**: No dedicated migration guide exists for css-tree users.

**Recommendation**: Create a migration guide covering:
- API differences (walk signature, node access patterns)
- Type checking changes (strings → constants)
- Location/position differences
- Children access patterns (`.children.first` → `.first_child`)
- Common patterns and their equivalents

Example structure:
```markdown
# Migrating from css-tree

## Node Type Checking
- css-tree: `node.type === 'Declaration'`
- css-parser: `node.type === DECLARATION` or `node.type_name === 'Declaration'`

## Accessing Children
- css-tree: `node.children.first` / `node.children.toArray()`
- css-parser: `node.first_child` / `node.children` (already an array)

[etc...]
```

## 5. Enhanced Type Definitions for Common Patterns

**Issue**: It's not immediately obvious that:
- You need `parse_values: true` to get parsed values
- `node.values` only exists on Declaration nodes
- Some nodes have `.name`, others need `.text`, others need `.value`

**Recommendation**:
- Make `node.values` available for all nodes (empty array if not applicable)
- Add JSDoc comments with examples on key methods
- Consider union types that make available properties clear:

```typescript
type DeclarationNode = CSSNode & {
  type: typeof DECLARATION
  property: string
  value: string
  values: CSSNode[]  // Only available with parse_values: true
}
```

## 6. Performance Optimization Hints

**Issue**: Not clear when to use which parsing options for best performance.

**Recommendation**: Document the performance implications:
```javascript
// Fast: Skip parsing values if you don't need them
parse(css, { parse_values: false })  // ~2x faster

// Medium: Parse values but not selectors
parse(css, { parse_values: true, parse_selectors: false })

// Slow: Parse everything
parse(css, { parse_values: true, parse_selectors: true })
```

**Why**: The migration showed `parse_values: true` was needed for this use case, but understanding the tradeoffs would help optimize other migrations.

## 7. Convenience Methods for Common Queries

**Issue**: Finding all var() functions requires custom recursive traversal.

**Recommendation**: Add query helpers:
```javascript
// Find all nodes matching criteria
node.find_all(node => node.type === FUNCTION && node.name === 'var')

// Find all descendants of a specific type
declaration.find_descendants(FUNCTION)

// Get all var() references in a declaration
declaration.get_custom_property_references()
```

**Why**: Common patterns should be easy. Every tool that analyzes custom properties needs to walk values recursively.

## 8. Backward Compatibility Layer (Optional)

**Recommendation**: Consider providing a css-tree compatibility adapter:
```javascript
import { parse } from '@projectwallace/css-parser/css-tree-compat'

// Returns nodes with css-tree-like API
const ast = parse(css, { positions: true })
walk(ast, function(node) {
  // Works like css-tree
  if (node.type === 'Declaration') {
    console.log(this.declaration)
  }
})
```

**Why**: Large codebases could migrate incrementally rather than all at once.

---

## Summary

The parser is fast and well-designed, but migration friction comes from:
1. Subtle behavioral differences (semicolon in length)
2. Missing context during traversal
3. Inconsistent property naming conventions
4. Lack of migration documentation

Addressing these would make @projectwallace/css-parser the obvious choice for anyone considering leaving css-tree.
