# Background Image Debugging Guide

## Quick Test Steps

### 1. Check if the image file loads
Open browser console (F12) and run:
```javascript
fetch('src/assets/img/alaska.jpeg').then(r => console.log('Image exists:', r.ok))
```

### 2. Check if background-image element exists
```javascript
const bgImg = document.getElementById('background-image');
console.log('Element exists:', !!bgImg);
console.log('Display style:', bgImg?.style.display);
console.log('Background image:', bgImg?.style.backgroundImage);
```

### 3. Check if Three.js background is transparent
```javascript
console.log('Scene background:', window.kwami?.body?.getScene()?.background);
// Should be null when image is active
```

### 4. Manual test - Force display image
Run in console:
```javascript
const bgImg = document.getElementById('background-image');
bgImg.style.display = 'block';
bgImg.style.backgroundImage = "url('src/assets/img/galaxy.jpg')";
bgImg.style.zIndex = '1';
console.log('Forced image display');
```

### 5. Check CSS z-index layers
```javascript
const layers = {
  video: window.getComputedStyle(document.getElementById('background-video')).zIndex,
  image: window.getComputedStyle(document.getElementById('background-image')).zIndex,
  canvas: window.getComputedStyle(document.getElementById('kwami-canvas')).zIndex
};
console.log('Z-index layers:', layers);
```

### 6. Check renderer alpha
```javascript
console.log('Renderer has alpha:', window.kwami?.body?.renderer?.getContextAttributes()?.alpha);
```

## Expected Values
- `background-image` display: `'block'` when image is selected
- `background-image` z-index: `1`
- `canvas` z-index: `3`
- Scene background: `null` when image is active
- Renderer alpha: `true`

## Common Issues

### Issue: Canvas has opaque background
**Solution**: Canvas CSS should have `background: transparent`

### Issue: Scene background covers image
**Solution**: Call `setBackgroundTransparent()` when image is set

### Issue: Wrong z-index order
**Expected order** (bottom to top):
1. background-video (z-index: 0)
2. background-image (z-index: 1)
3. canvas-overlay (z-index: 2)
4. canvas (z-index: 3)

### Issue: File path incorrect
**Check**: Files should be at `src/assets/img/*.jpeg` not `assets/*.jpeg`

