# README

Made for scripted Groovy.

## Feature List

Added *basic* support for:
* [Document symbol provider](###document-symbol-provider)
* [Definition provider](###definition-provider)
* [Hover provider](###hover-provider)

### Document symbol provider

Searches document for function, variable, and field declarations.

#### Function
Searches for `<type> <name> (<parameters>)` in the document.
Implemented using the Regex pattern:

```typescript
`^(${utils.types.join('|')})\\s+[a-zA-Z_]\\w*\\s*\\(.*\\)`
```

#### Variable

Searches for `def <name> =` in the document.
Implemented using the Regex pattern:

```typescript
`(${utils.types.join('|')})\\s+[a-zA-Z_]\\w*\\s*=`
```

Note that variables are limited to the scope of the functions

#### Field

Searches for `@groovy.transform.Field` in the document.
Note that the field has to be declared globally.

```groovy
// Supported
@groovy.transform.Field def GLOBAL

void function() {
    // Not supported
    @groovy.transform.Field def LOCAL
}
```

### Definition Provider

Searches workspace Groovy files (`.groovy` and `.gvy`) asynchronously and returns the *first* declaration line found.

Uses the Regex pattern:

```typescript
`(${utils.types.join('|')})\\s+${word}`
```

Note that the plugin will *not* search if the cursor position is inside a string (Groovy string interpolation not supported) or in a inline comment.

```groovy
// Will not search
"variables is ${variable}"
```

### Hover Provider

Upon hover, shows the declaration line.
Supports *functions* and *fields*.

#### Function

Tests the hovered word using:

```typescript
// function call: <name> (<args>)
`${word}\\s*\\(.*\\)`

// pass function as closure: .&<name>
`\\.&${word}`
```

Then searches the document for:

```typescript
`^(${utils.types.join('|')})\\s+${word}\\s*\\(.*\\)`
```

#### Field

Tests the hovered word using:

```typescript
`[A-Z_][A-Z0-9_]*`
```

Then searches the document for:

```typescript
`^@groovy.transform.Field\\s+(${utils.types.join('|')})\\s+${word}`
```
