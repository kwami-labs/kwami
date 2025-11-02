# Background Image Debugging Guide

## Quick Test Steps

### 1. Verify that the asset resolves through Vite
```javascript
// Should print a bundled URL when the asset exists
resolveMediaPath('src/assets/img/alaska.jpeg');
resolveMediaPath('src/assets/vid/stars.mp4');
```

### 2. Apply the background through Kwami core
```javascript
// Image
const url = resolveMediaPath('src/assets/img/galaxy.jpg');
window.kwami?.body?.setBackgroundImage(url);
console.log('Background type:', window.kwami?.body?.getBackgroundType());

// Video
const videoUrl = resolveMediaPath('src/assets/vid/stars.mp4');
window.kwami?.body?.setBackgroundVideo(videoUrl, { muted: true });
console.log('Background type:', window.kwami?.body?.getBackgroundType());
```

### 3. Inspect the Three.js scene state
```javascript
const scene = window.kwami?.body?.getScene();
console.log('Scene background:', scene?.background); // Should stay null for media backgrounds
```

### 4. Confirm the background plane exists
```javascript
const plane = scene?.children.find(node => node.name === 'KwamiBackgroundPlane');
console.log('Background plane found:', !!plane);
```

### 5. Check renderer transparency support
```javascript
console.log('Renderer has alpha:', window.kwami?.body?.getRenderer()?.getContextAttributes()?.alpha);
```

## Expected Values
- `kwami.body.getBackgroundType()` returns `'texture'` for both images and videos
- `scene.background` remains `null` when media backgrounds are active (the plane renders the media)
- Renderer alpha is `true`
- Camera plane scales with viewport to honor the selected `fit` option (`cover` by default)

## Common Issues

### Issue: Asset URL resolves to `undefined`
**Solution**: Ensure the file lives under `src/assets/img` or `src/assets/vid` so Vite's glob import can bundle it.

### Issue: Media does not appear after calling `setBackgroundImage`
**Solution**: Confirm that the resolved URL loads (open it in a new tab) and that `kwami.body` has been created before invoking the method.

### Issue: Video fails to autoplay
**Solution**: Videos are muted by default; verify the source allows cross-origin usage and that browser autoplay policies permit muted playback.

### Issue: Canvas displays opaque color instead of media
**Solution**: Call `kwami.body.clearBackgroundMedia()` followed by `kwami.body.setBackgroundImage(...)` to reset the internal background state.

### Issue: Gradient controls overwrite media backgrounds
**Solution**: Set `Media Source` back to `None` in the playground before adjusting gradient sliders so the gradient system can take over again.

