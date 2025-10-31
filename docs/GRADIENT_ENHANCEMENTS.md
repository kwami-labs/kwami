# Gradient Background Enhancements

## Overview
Enhanced the random gradient background feature to support three different gradient styles and added a new "random spheres" mode.

## Changes Made

### 1. Updated `src/core/Body.ts`

#### Enhanced `randomizeBackground()` method
- Now randomly selects between three gradient styles:
  - **Linear**: Traditional linear gradient with random angle
  - **Radial**: Circular gradient emanating from the center
  - **Random**: Three color spheres placed randomly in the background

#### Added new public method `setBackgroundSpheres(colors: string[])`
- Creates a visually appealing background with 3 colored spheres
- Each sphere is positioned randomly on the canvas
- Spheres have varying sizes (150-350px radius)
- Uses radial gradients with transparency for a smooth blend effect
- Can be called directly from the playground UI

### 2. Updated `playground/main.js`

#### Modified `applyBackground()` function
- Now properly handles the "random" gradient style option
- When "random" is selected, it calls `setBackgroundSpheres()` with the user-selected colors
- Maintains support for linear and radial gradients

#### Simplified gradient style selector event handler
- Removed the automatic `randomizeGradientLayout()` call when "random" is selected
- Now just applies the background, allowing users to manually control the colors

### 3. UI Behavior

#### Gradient Layout Selector (`bg-gradient-style`)
The dropdown now has three options:
- **Linear**: Creates a linear gradient using the angle slider
- **Radial**: Creates a radial gradient from the center
- **Random**: Creates 3 color spheres at random positions using the selected colors

#### Random Gradient Button
When clicking "🎲 Random Gradient", the system will:
1. Generate 3 random colors
2. Randomly select one of the three styles (linear, radial, or random spheres)
3. Apply the background with randomized parameters

## Technical Details

### Color Spheres Implementation
The spheres are created using HTML5 Canvas API:
```javascript
- Canvas size: 512x512px
- Base layer: First color at 30% opacity
- Three spheres with:
  - Random positions (x, y)
  - Random radius (150-350px)
  - Gradient color stops:
    - 0%: Full color
    - 50%: Semi-transparent (80 alpha)
    - 100%: Fully transparent
```

### Gradient Direction Mapping
- `linear` → Uses angle parameter for direction
- `radial` → Uses radial direction with centered origin
- `random` → Creates custom canvas texture with multiple radial gradients

## User Experience

### Manual Color Selection + Random Style
Users can now:
1. Select their preferred colors using the color pickers
2. Choose "Random" from the gradient style dropdown
3. Get a unique sphere-based background with their chosen colors

### Fully Random Background
Clicking the "🎲 Random Gradient" button provides:
- Completely random colors
- Random gradient style (linear/radial/spheres)
- Random angle (for linear)
- Random color stops
- Occasional random opacity (every 3rd click)
- **UI automatically updates** to show which style was chosen in the dropdown

## Benefits

1. **More Visual Variety**: Three distinct gradient styles provide more diverse backgrounds
2. **Better User Control**: Users can manually create sphere backgrounds with their chosen colors
3. **Enhanced Aesthetics**: The sphere mode creates more organic, visually interesting backgrounds
4. **Maintained Compatibility**: All existing functionality continues to work as expected

## Background Image/Video Visibility Fix

### Issue
Previously, when a background image or video was set, it was not visible because the Three.js scene gradient was rendering as an opaque layer on top of the HTML background elements.

### Solution
Updated `setBackgroundImage()` and `setBackgroundVideo()` functions to automatically call `setBackgroundTransparent()` when an image or video is applied. This makes the Three.js scene background transparent (sets to `null`), allowing the HTML background media to show through the canvas.

### Changes Made
1. **`setBackgroundImage()`**: Now calls `window.kwami.body.setBackgroundTransparent()` when an image is applied
2. **`setBackgroundVideo()`**: Now calls `window.kwami.body.setBackgroundTransparent()` when a video is applied
3. **Initialization**: Updated to set background image first, then populate gradient color pickers without applying them

### Result
- Background images and videos are now properly visible behind the blob
- The Three.js canvas has alpha channel enabled (already was configured)
- The scene background becomes transparent when media is active
- Gradient backgrounds can still be re-applied by selecting a gradient style or clicking "Random Gradient"

