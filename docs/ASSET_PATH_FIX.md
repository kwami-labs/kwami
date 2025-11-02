# Asset Path Fix

## Issue
Background images and videos were not displaying because the code was referencing paths like `assets/alaska.jpeg` but the actual files were located in `src/assets/img/` and `src/assets/vid/`.

## Root Cause
The project structure was reorganized to have assets in `src/assets/` but the playground code still referenced the old `assets/` paths.

## Changes Made

### 1. Updated Image Paths in `playground/main.js`
Changed all entries in the `BACKGROUND_IMAGES` array from:
```javascript
'assets/alaska.jpeg'
```
to:
```javascript
'src/assets/img/alaska.jpeg'
```

### 2. Updated HTML Image Options in `playground/index.html`
Changed all `<option>` values in the `#bg-media-image` select from:
```html
<option value="assets/alaska.jpeg">Alaska</option>
```
to:
```html
<option value="src/assets/img/alaska.jpeg">Alaska</option>
```

### 3. Updated Video Options in `playground/index.html`
Added the local video file:
```html
<option value="src/assets/vid/stars.mp4">Stars (Local)</option>
```

### 4. Enhanced `resolveMediaPath()` Function
Updated the path resolution logic to handle the new `src/assets/` structure:
```javascript
function resolveMediaPath(value) {
  if (!value) return '';
  // If it's a URL, return as-is
  if (/^(https?:)?\/\//i.test(value)) {
    return value;
  }
  // If it starts with src/assets/, return as-is (new path structure)
  if (value.startsWith('src/assets/')) {
    return value;
  }
  // Remove leading slashes
  const sanitized = value.replace(/^\/+/, '');
  // If it already has assets/ prefix (old format), return as-is
  if (sanitized.startsWith('assets/')) {
    return sanitized;
  }
  // Otherwise add assets/ prefix (legacy support)
  return `assets/${sanitized}`;
}
```

## Asset Structure
```
src/
└── assets/
    ├── img/          # Background images
    │   ├── alaska.jpeg
    │   ├── galaxy.jpg
    │   ├── planet.jpg
    │   └── ... (27 images total)
    ├── vid/          # Background videos
    │   └── stars.mp4
    ├── audio/        # Audio files
    └── personalities/ # Personality presets
```

## Result
✅ Background images now load correctly from `src/assets/img/`  
✅ Background videos now load correctly from `src/assets/vid/`  
✅ External video URLs (from coverr.co) still work  
✅ The Three.js canvas background becomes transparent when media is active  
✅ Backwards compatibility maintained for any old `assets/` paths

