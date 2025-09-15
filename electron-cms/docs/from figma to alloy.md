# Titanium SDK Alloy MVC Framework Structure

This document outlines the structure and best practices for implementing Titanium Alloy mobile applications, with a focus on converting Figma designs into functional mobile apps.

## Table of Contents

- Basic Folder and File Organization
- Creating UI Components in Alloy
- Best Practices for Implementing Views from Designs
- Handling Styles, Colors, and Fonts
- Considerations for Modern UI Designs

## Basic Folder and File Organization

Titanium Alloy follows the Model-View-Controller (MVC) architectural pattern, which separates application logic from presentation. The default project structure includes:

### Default Project Structure
```
/
├── Resources/        # Contains platform-specific assets (usually hidden in IDEs)
├── app/              # Main application directory where development occurs
│   ├── controllers/  # JavaScript files managing app logic
│   ├── views/        # XML files defining UI layout
│   ├── styles/       # TSS (Titanium Style Sheets) files for styling UI components
│   ├── models/       # (Optional) Data models, especially when using Backbone
│   ├── assets/       # Application assets like images and fonts
│   ├── lib/          # JavaScript libraries and utility functions
│   └── widgets/      # Reusable UI components
├── tiapp.xml         # Configuration file for app metadata
└── app.js            # Bootstrap file that initializes the app
```

### Alternative Entity-Based Structure
Some developers prefer an entity-based organization that groups related files together:

```
/app
├── ui/
│   ├── index/
│   │   ├── index.xml
│   │   ├── index.tss
│   │   └── index.js
│   ├── detail/
│   │   ├── index.xml
│   │   ├── index.tss
│   │   └── index.js
│   └── components/
│       └── movie_cell/
│           ├── index.xml
│           ├── index.tss
│           └── index.js
├── assets/
├── lib/
└── tests/
```

This approach aligns with Node.js module conventions and improves locality and ease of management.

## Creating UI Components in Alloy

Alloy uses a triad of files to create UI components:

### 1. XML Views (.xml)
XML files define the structure and hierarchy of UI elements:

```xml
<Alloy>
    <Window>
        <View class="container">
            <Label id="titleLabel" text="Hello World" />
            <Button id="actionButton" title="Click Me" onClick="handleClick" />
        </View>
    </Window>
</Alloy>
```

Key features:

- Each UI element is represented by an XML tag
- IDs (id) uniquely identify elements for styling and controller access
- Classes (class) apply shared styles to multiple elements
- Event handlers (e.g., onClick) link to controller functions

### 2. Style Sheets (.tss)
TSS files use JSON-like syntax to define the appearance of UI elements:

```javascript
".container": {
    backgroundColor: "#ffffff",
    layout: "vertical"
},
"#titleLabel": {
    color: "#333333",
    font: {
        fontSize: "18dp",
        fontWeight: "bold"
    },
    top: "20dp"
},
"#actionButton": {
    backgroundColor: "#4285f4",
    color: "#ffffff",
    width: "200dp",
    height: "40dp",
    borderRadius: "5dp"
}
```

Styles are applied hierarchically:

- Element styles (e.g., "Label": {}) apply to all elements of that type
- Class styles (e.g., ".container": {}) apply to elements with that class
- ID styles (e.g., "#titleLabel": {}) apply to specific elements and override other styles

### 3. Controllers (.js)
JavaScript files contain the business logic and event handlers:

```javascript
function handleClick(e) {
    alert("Button clicked!");
}

// Export functions to make them available to the view
exports.handleClick = handleClick;
```

Controllers can:

- Access UI elements via $.id (e.g., $.titleLabel.text = "New Text")
- Handle events from the view
- Manage data and application state
- Communicate with other controllers and models

### Conditional Rendering
Alloy supports conditional rendering using the if attribute:

```xml
<View if="Alloy.Globals.isLoggedIn()" id="loggedInView">
    <Label text="Welcome back!" />
</View>
<View if="!Alloy.Globals.isLoggedIn()" id="loginView">
    <Label text="Please log in" />
</View>
```

This optimizes performance by only rendering the necessary components.

## Best Practices for Implementing Views from Designs

When converting Figma designs to Titanium Alloy:

### 1. Analyze the Design First
- Break down the design into reusable components
- Identify common patterns, styles, and UI elements
- Understand the navigation flow and screen transitions

### 2. Create a Component Hierarchy
- Start with larger containers and work down to smaller elements
- Use appropriate layout managers (vertical, horizontal, composite)
- Implement reusable components as Alloy widgets for complex UI elements

### 3. Use Proper Layout Techniques
- Prefer Ti.UI.createView with layout properties over absolute positioning
- Use dp (density-independent pixels) for consistent sizing across devices
- Implement responsive layouts that adapt to different screen sizes

### 4. Implement Atomic Design Principles
- Break UI into atoms (buttons, inputs), molecules (search bars), organisms (headers), templates, and pages
- Create reusable widgets for complex components
- Maintain consistency through shared styles

### 5. Leverage Alloy's Capabilities
- Use data binding to connect UI elements with data models
- Implement event delegation for efficient event handling
- Utilize Alloy's built-in templating for list views and repeating elements

## Handling Styles, Colors, and Fonts

### Global Styles
Define global styles in app.tss to maintain consistency:

```javascript
// app.tss
"Window": {
    backgroundColor: "#ffffff"
},
"Label": {
    font: {
        fontSize: "14dp",
        fontFamily: "Helvetica Neue"
    },
    color: "#333333"
}
```

### Color Management
Create a centralized color system:

```javascript
// app.tss
"Alloy.Globals.Colors": {
    primary: "#4285f4",
    secondary: "#34a853",
    accent: "#fbbc05",
    error: "#ea4335",
    text: {
        primary: "#212121",
        secondary: "#757575",
        disabled: "#9e9e9e"
    },
    background: {
        light: "#ffffff",
        dark: "#121212"
    }
}
```

Reference these colors in your styles:

```javascript
"#myButton": {
    backgroundColor: Alloy.Globals.Colors.primary,
    color: "#ffffff"
}
```

### Font Management
#### Custom Fonts

Place font files in platform-specific locations:
- iOS: app/assets/fonts/
- Android: app/assets/android/fonts/

Reference fonts in TSS:
```javascript
".heading": {
    font: {
        fontSize: "24dp",
        fontFamily: "CustomFont-Regular"
    }
}
```

Handle platform differences:
- iOS expects the PostScript name (e.g., CustomFont-Regular)
- Android expects the filename without extension (e.g., custom_font)

Use platform-specific styles when necessary:

```javascript
".heading[platform=ios]": {
    font: {
        fontFamily: "CustomFont-Regular"
    }
},
".heading[platform=android]": {
    font: {
        fontFamily: "custom_font"
    }
}
```

### Platform-Specific Styles
Apply styles conditionally based on platform or device characteristics:

```javascript
"Label[platform=ios]": {
    font: { fontSize: "14dp" }
},
"Label[platform=android]": {
    font: { fontSize: "12dp" }
},
"Button[formFactor=tablet]": {
    width: "300dp",
    height: "60dp"
}
```

### Dynamic Theming
Implement theme switching with global variables:

```javascript
// alloy.js
Alloy.Globals.Theme = {
    current: "light",
    light: {
        backgroundColor: "#ffffff",
        textColor: "#333333"
    },
    dark: {
        backgroundColor: "#121212",
        textColor: "#ffffff"
    }
};
```

Reference theme variables in styles:

```javascript
".container": {
    backgroundColor: Alloy.Globals.Theme[Alloy.Globals.Theme.current].backgroundColor
}
```

## Considerations for Modern UI Designs

### 1. Responsive Design
- Use percentage-based sizing and flexible layouts
- Implement different layouts for phone and tablet using formFactor selectors
- Test on multiple device sizes and orientations

### 2. Material Design and iOS Guidelines
- Follow platform-specific design guidelines
- Use platform-specific UI components when appropriate
- Implement platform-specific navigation patterns

### 3. Animation and Transitions
- Use Titanium's animation API for smooth transitions
- Implement gesture recognition for interactive elements
- Consider performance implications of complex animations

### 4. Accessibility
- Set accessibility labels and hints
- Ensure sufficient color contrast
- Support dynamic text sizes

### 5. Dark Mode Support
- Implement theme switching capability
- Use semantic colors that adapt to light/dark modes
- Test both themes thoroughly

### 6. Modern UI Patterns
- Implement swipe gestures for navigation
- Use bottom navigation for primary actions
- Consider floating action buttons for primary actions
- Implement pull-to-refresh for content updates

### 7. From Figma to Alloy
When converting Figma designs to Titanium Alloy:

- Export colors, typography, and spacing from Figma as design tokens
- Create a style guide in Alloy that matches the Figma design system
- Export assets at appropriate resolutions for different device densities
- Use Figma's inspect mode to get exact measurements and properties
- Implement components in the same hierarchy as the Figma design
- Maintain a reference between Figma components and Alloy widgets

## Conclusion

Titanium Alloy provides a powerful MVC framework for building cross-platform mobile applications. By understanding its structure and following best practices for implementing designs, developers can efficiently convert Figma designs into functional, maintainable mobile applications.

When implementing a Figma design in Titanium Alloy, focus on creating reusable components, maintaining consistent styles, and leveraging Alloy's conditional rendering and platform-specific capabilities to deliver a polished user experience across different devices and platforms. 