# Nuxt App Migration to @kwami v2.0

## Summary of Updates

The Nuxt app has been updated to work with the refactored @kwami v2.0 library.

## Files Updated

### 1. **Store** (`app/stores/q.ts`)
- ✅ Updated import from `~/@kwami/core/body` to `~/@kwami`
- ✅ Added audioFiles import
- ✅ Changed `body` type from `Kwami` to `Kwami | null`
- ✅ Updated initialization to use new config-based API
- ✅ Added proper configuration object with audioFiles and initial settings

### 2. **Canvas Component** (`app/components/Canvas/Index.vue`)
- ✅ Updated blob method call from `exportBlobGLTF()` to `exportGLTF()`
- ✅ Added null check for `q.body`
- ✅ Updated path: `q.body.blob` → `q.body.body.blob`

### 3. **Body Component** (`app/components/Quami/Kwami/Body/Index.vue`)
- ✅ Updated all `q.body.blob` references to `q.body.body.blob`
- ✅ Added null checks throughout
- ✅ Updated spikes, time, and rotation property access

### 4. **Blob Component** (`app/components/Quami/Kwami/Body/Blob/Index.vue`)
- ✅ Updated import from `~/@kwami/utils/randoms` to `~/@kwami`
- ✅ Updated all blob references to use new path structure
- ✅ Added null checks for `q.body`
- ✅ Updated DNA property access

### 5. **Skin Component** (`app/components/Quami/Kwami/Body/Blob/Skin.vue`)
- ✅ Updated imports from `~/@kwami/utils/randoms` to `~/@kwami`
- ✅ Replaced `options` import with `defaultBlobConfig`
- ✅ Updated all blob property access paths
- ✅ Changed `q.body.camera` to `q.body.body.getCamera()`
- ✅ Updated color property access from `colorX` to `colors.x`
- ✅ Removed direct access to `skins.tricolor` (now uses `setWireframe()` method)
- ✅ Added null checks throughout

### 6. **Music Component** (`app/components/Quami/Music/Index.vue`)
- ✅ Updated audio API:
  - `playAudio()` → `play()`
  - `pauseAudio()` → `pause()`
  - `nextAudio()` → `next()`
  - `prevAudio()` → `previous()`
- ✅ Updated state management:
  - `q.body.blob.state = 'speak'` → `q.body.setState('speaking')`
  - `q.body.blob.state = 'normal'` → `q.body.setState('idle')`
- ✅ Updated paused check to use `getAudioElement().paused`
- ✅ Added null checks

## Key API Changes

### Path Structure
```typescript
// OLD
q.body.blob.setRandomBlob()
q.body.audio.playAudio()
q.body.camera.fov

// NEW
q.body.body.blob.setRandomBlob()
q.body.body.audio.play()
q.body.body.getCamera().fov
```

### Initialization
```typescript
// OLD
this.body = new Kwami(canvas);

// NEW
this.body = new Kwami(canvas, {
  body: {
    audioFiles,
    initialSkin: 'tricolor',
    blob: {
      resolution: 180
    }
  }
});
```

### Imports
```typescript
// OLD
import Kwami from '~/@kwami/core/body';
import { genDNA } from '~/@kwami/utils/randoms';
import options from '~/@kwami/core/body/lib/Blob/options';

// NEW
import { Kwami } from '~/@kwami';
import { genDNA, defaultBlobConfig } from '~/@kwami';
```

### Audio API
```typescript
// OLD
await q.body.audio.playAudio()
q.body.audio.pauseAudio()
q.body.audio.nextAudio()
q.body.audio.prevAudio()

// NEW
await q.body.body.audio.play()
q.body.body.audio.pause()
q.body.body.audio.next()
q.body.body.audio.previous()
```

### State Management
```typescript
// OLD
q.body.blob.state = 'speak'
q.body.blob.state = 'normal'

// NEW
q.body.setState('speaking')
q.body.setState('idle')
```

### Property Access
```typescript
// OLD
q.body.blob.colorX
q.body.blob.skins.tricolor.wireframe
q.body.camera

// NEW
q.body.body.blob.colors.x
q.body.body.blob.setWireframe(value)
q.body.body.getCamera()
```

## Null Safety

All components now properly check for `q.body` being null before accessing its properties:

```typescript
if (!q.body) return;
// or
q.body?.body.blob.setRandomBlob()
```

## Testing Checklist

- [ ] Canvas initializes without errors
- [ ] Blob renders correctly
- [ ] Random blob generation works
- [ ] Color customization works
- [ ] Spikes/time/rotation controls work
- [ ] Audio playback works (play/pause/next/previous)
- [ ] Resolution changes work
- [ ] Wireframe toggle works
- [ ] GLTF export works

## Notes

- The store now properly initializes `body` as `null` until the canvas is ready
- All blob customization must go through the proper API methods
- Direct access to internal properties (like skins) should be avoided
- Use getter methods like `getCamera()`, `getScene()`, `getRenderer()` for accessing THREE.js objects

---

Your Nuxt app should now work with @kwami v2.0! 🚀

