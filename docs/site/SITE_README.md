# KWAMI Documentation Site

A modern documentation site built with [Nuxt 4](https://nuxt.com), [Nuxt Content](https://content.nuxt.com), and [Nuxt UI](https://ui.nuxt.com).

## Features

✨ **Beautiful Design**: Modern, clean interface with dark mode support  
📝 **Markdown-based**: Write documentation in Markdown with MDC (Markdown Components)  
🔍 **Full-text Search**: Built-in search functionality for easy navigation  
🎨 **Syntax Highlighting**: Code blocks with beautiful syntax highlighting  
📱 **Responsive**: Works perfectly on all devices  
🚀 **Fast**: Optimized for performance with Nuxt 4  
♿ **Accessible**: WCAG compliant with keyboard navigation  

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm 10+

### Development

From the monorepo root:

```bash
npm run docs
```

This will start the development server at `http://localhost:9999`

From the docs/site directory:

```bash
cd docs/site
npm run dev
```

### Build

```bash
npm run build:docs
```

### Preview

```bash
npm run preview:docs
```

## Project Structure

```
docs/site/
├── app.vue                 # Main app component
├── app.config.ts          # App configuration
├── nuxt.config.ts         # Nuxt configuration
├── assets/
│   └── css/
│       └── main.css       # Global styles
├── components/
│   ├── content/           # MDC components
│   │   ├── Note.vue       # ::note blocks
│   │   ├── Tip.vue        # ::tip blocks
│   │   ├── Warning.vue    # ::warning blocks
│   │   ├── Caution.vue    # ::caution blocks
│   │   ├── Card.vue       # ::card blocks
│   │   ├── Badge.vue      # :badge component
│   │   ├── Steps.vue      # ::steps blocks
│   │   ├── Step.vue       # ::step blocks
│   │   └── Tabs.vue       # ::tabs blocks
│   ├── DocArticle.vue     # Article layout
│   ├── DocBreadcrumbs.vue # Breadcrumb navigation
│   ├── DocNotFound.vue    # 404 component
│   ├── DocSidebar.vue     # Sidebar navigation
│   ├── DocSidebarList.vue # Sidebar list items
│   ├── DocToc.vue         # Table of contents
│   ├── HomeHero.vue       # Home page hero
│   └── HomeProjects.vue   # Home page projects grid
├── layouts/
│   └── default.vue        # Default layout
├── pages/
│   ├── index.vue          # Home page
│   └── [...slug].vue      # Dynamic documentation pages
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── types/
│   └── navigation.ts      # TypeScript types
└── utils/
    └── strings.ts         # String utility functions
```

## Content Organization

Documentation content lives in the parent `docs/` directory and is organized by project:

```
docs/
├── README.md              # Main documentation hub
├── 1_kwami/              # KWAMI Core library docs
├── 2_pg/                 # Playground docs
├── 3_app/                # KWAMI App docs
├── 4_solana/             # Solana programs docs
├── 5_candy/              # Candy Machine docs
├── 6_market/             # Marketplace docs
├── 7_dao/                # DAO docs
└── 8_web/                # Website docs
```

## MDC Components

The site supports several custom Markdown Components (MDC) for enhanced documentation:

### Alerts

```markdown
::note
This is a note with helpful information.
::

::tip
This is a helpful tip or best practice.
::

::warning
This is a warning about potential issues.
::

::caution
This is a critical warning that requires attention.
::
```

### Cards

```markdown
::card{title="Card Title"}
Card content goes here. Supports **markdown** formatting.

#footer
Optional footer content
::
```

### Badges

```markdown
:badge[New]{color="green"}
:badge[Beta]{color="blue" variant="outline"}
:badge[Deprecated]{color="red"}
```

### Steps

```markdown
::steps
::step{step="1"}
First step description with **markdown** support.
::

::step{step="2"}
Second step description.
::

::step{step="3"}
Final step.
::
::
```

### Tabs

```markdown
::tabs{:labels='["JavaScript", "TypeScript", "Rust"]'}
#tab-0
\`\`\`javascript
console.log('Hello World')
\`\`\`

#tab-1
\`\`\`typescript
console.log('Hello World' as string)
\`\`\`

#tab-2
\`\`\`rust
println!("Hello World");
\`\`\`
::
```

## Configuration

### Theme Colors

Edit `app.config.ts` to customize colors:

```typescript
export default defineAppConfig({
  ui: {
    primary: 'emerald',
    gray: 'slate'
  }
})
```

### Content Sources

Edit `nuxt.config.ts` to configure content sources:

```typescript
content: {
  sources: {
    docs: {
      driver: 'fs',
      base: docsDir,
      prefix: '/'
    }
  }
}
```

## Deployment

The site can be deployed to any platform that supports Nuxt:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect to Git repository
- **Cloudflare Pages**: Connect to Git repository
- **Static hosting**: Run `npm run generate` and deploy the `.output/public` directory

## Contributing

1. Add or edit Markdown files in the `docs/` directory
2. Use MDC components for enhanced formatting
3. Test locally with `npm run docs`
4. Submit a pull request

## Technologies

- [Nuxt 4](https://nuxt.com) - Vue framework
- [Nuxt Content](https://content.nuxt.com) - File-based CMS
- [Nuxt UI](https://ui.nuxt.com) - UI component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

See [LICENSE](../../LICENSE) in the repository root.

