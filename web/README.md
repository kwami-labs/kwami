# Kwami Website

A beautiful single-page scrolling website showcasing the Kwami project - an interactive 3D AI companion.

## Features

- 🎨 **Progressive Color Transitions**: Colors smoothly change as you scroll through different sections
- 👻 **Animated Kwami Blob**: The blob morphs into different shapes for each section
- 📱 **Fully Responsive**: Works beautifully on desktop, tablet, and mobile devices
- ✨ **Smooth Animations**: Engaging text and visual animations throughout
- 🎲 **Interactive**: Click the Kwami blob to randomize colors!

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
web/
├── index.html          # Main HTML structure
├── src/
│   ├── main.ts        # TypeScript logic for scroll animations
│   └── style.css      # All styling and animations
└── README.md
```

## Features Explained

### Split Screen Layout

- **Left Half**: Scrollable text content explaining different aspects of Kwami (Mind, Body, Soul, etc.)
- **Right Half**: Fixed position with an animated blob that changes shape and color

### Section-Based Animations

Each section triggers different blob shapes:
1. **Meet Kwami** - Circular blob
2. **Mind** - Star-like pattern
3. **Body** - Squiggly organic shape
4. **Soul** - Pulsing animation
5. **Customization** - Spiral pattern
6. **Get Started** - Heart-like shape

### Color System

The website uses 6 color palettes that rotate through sections:
- Purple gradient (default)
- Red-pink
- Teal-green
- Orange-yellow
- Purple-pink
- Blue gradient

Additionally, colors have progressive random variations as you scroll for a more dynamic experience.

## Technologies

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **SVG** - Scalable vector graphics for the blob
- **CSS Animations** - Smooth transitions and effects

## Easter Eggs

- Click on the Kwami blob to randomize all colors instantly
- The blob continuously "breathes" with subtle scale animations
- Color variations are applied progressively with random intervals

## License

Part of the Kwami project - see main repository for license details.


