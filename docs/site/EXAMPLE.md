---
title: MDC Components Example
description: A comprehensive example demonstrating all available MDC components in the KWAMI documentation site.
---

# MDC Components Example

This page demonstrates all available Markdown Components (MDC) you can use in your documentation.

## Alerts

Use alerts to highlight important information:

::note
This is a note with additional information. Notes are great for providing context or helpful details that supplement the main content.
::

::tip
This is a helpful tip! Use tips to share best practices, shortcuts, or recommendations that can improve the user's experience.
::

::warning
Be careful with this action as it might have unexpected results. Warnings help users avoid common pitfalls or mistakes.
::

::caution
This action cannot be undone. Critical warnings should be used sparingly for the most important safety information.
::

## Badges

Use badges to label features, versions, or status:

:badge[New]{color="green"} :badge[Beta]{color="blue"} :badge[Deprecated]{color="red"} :badge[v1.5.8]{color="emerald" variant="outline"}

You can use them inline like this: The :badge[Premium] feature requires authentication.

## Cards

Cards are great for organizing related content:

::card{title="Quick Start"}
Get started with KWAMI in just a few minutes:

1. Install the package
2. Configure your environment
3. Start building!

#footer
[Read the full guide →](/1_kwami/getting-started/quickstart)
::

::card{title="API Reference"}
Explore the complete API documentation to learn about all available methods, properties, and options.

#footer
[View API docs →](/1_kwami/api/kwami)
::

## Code Blocks

Standard code blocks with syntax highlighting:

```typescript
import { KWAMI } from 'kwami'

const kwami = new KWAMI({
  canvas: document.getElementById('canvas'),
  autoStart: true
})

kwami.initialize()
```

```javascript
// JavaScript example
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('KWAMI'))
```

```bash
# Install dependencies
npm install kwami

# Run development server
npm run dev
```

## Steps

Use steps for sequential instructions:

::steps
::step{step="1"}
**Install the KWAMI package**

Run the following command in your terminal:

```bash
npm install kwami
```
::

::step{step="2"}
**Create a configuration file**

Create a `kwami.config.ts` file in your project root:

```typescript
export default {
  canvas: '#app',
  autoStart: true
}
```
::

::step{step="3"}
**Initialize KWAMI**

Import and initialize KWAMI in your application:

```typescript
import { KWAMI } from 'kwami'

const kwami = new KWAMI()
await kwami.initialize()
```
::
::

## Tables

Standard Markdown tables are fully supported:

| Feature | Core | App | Playground |
|---------|------|-----|------------|
| 3D Rendering | ✅ | ✅ | ✅ |
| AI Behavior | ✅ | ✅ | ❌ |
| Voice Interaction | ❌ | ✅ | ❌ |
| Visual Editor | ❌ | ❌ | ✅ |

## Lists

### Unordered Lists

- Feature one
- Feature two
  - Nested item
  - Another nested item
- Feature three

### Ordered Lists

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task Lists

- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Another pending task

## Blockquotes

> "The KWAMI ecosystem provides everything you need to build interactive 3D character experiences."
>
> — KWAMI Documentation Team

## Links and References

- [Internal link to Core docs](/1_kwami/README)
- [External link to GitHub](https://github.com/kwami-io)
- [Link with title](/1_kwami/ARCHITECTURE "KWAMI Architecture")

## Images

Images are automatically optimized:

![KWAMI Logo](https://via.placeholder.com/800x400/1a1a2e/34d399?text=KWAMI+Ecosystem)

## Horizontal Rules

Use horizontal rules to separate sections:

---

## Inline Formatting

You can use **bold text**, *italic text*, ***bold and italic***, `inline code`, ~~strikethrough~~, and even <mark>highlighted text</mark>.

## Combining Components

You can combine multiple components for rich documentation:

::card{title="⚠️ Important Setup Note"}
Before you begin, make sure you have the required dependencies installed:

::steps
::step{step="1"}
Install Node.js 18 or higher
::

::step{step="2"}
Install npm 10 or higher
::

::step{step="3"}
Clone the KWAMI repository
::
::

::tip
Use :badge[nvm] to manage multiple Node.js versions easily!
::
::

---

## Need Help?

::note
If you encounter any issues or have questions, check out our [troubleshooting guide](/1_kwami/getting-started/troubleshooting) or [open an issue on GitHub](https://github.com/kwami-io/kwami/issues).
::

