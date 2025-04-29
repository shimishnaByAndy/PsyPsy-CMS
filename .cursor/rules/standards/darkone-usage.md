# Darkone Usage Policy

## Rule Type: Code Pattern

## Description
Darkone is a UI template provided as a reference implementation only. Components in the `src/darkone` directory should **never** be directly imported into application code.

## Purpose
This rule prevents build errors and ensures consistent UI implementation by requiring developers to create their own components based on Darkone references rather than directly importing them.

## Implementation Details

### ❌ Prohibited Pattern
```jsx
// DON'T import Darkone components directly
import { AnyComponent } from 'src/darkone';
import { SomeOtherComponent } from '../../darkone/components';
```

### ✅ Correct Pattern
```jsx
// DO create your own components based on Darkone examples
import React from 'react';

// After studying the Darkone example implementation
function MyComponent() {
  return (
    <div className="my-component">
      {/* Your implementation */}
    </div>
  );
}
```

## Enforcement
- The `src/darkone/index.js` file has all exports commented out to prevent direct imports
- A README.md has been added to the darkone directory to clarify usage
- The DarkoneExample component demonstrates the correct approach

## Reference
The Darkone directory contains:
- UI components (`components/`)
- Context providers (`context/`) 
- Custom hooks (`hooks/`)
- Utility functions (`utils/`)

Study these implementations to understand patterns and create your own components following the same design principles. 