import { useEffect, useMemo, useRef, useState } from 'react'
import { Kwami, type BlobConfig, type BlobSkinSelection } from 'kwami'

type AnyBodyConfig = {
  resolution?: number
  spikes?: { x?: number; y?: number; z?: number }
  time?: { x?: number; y?: number; z?: number }
  rotation?: { x?: number; y?: number; z?: number }
  colors?: { x?: unknown; y?: unknown; z?: unknown }
  shininess?: number
  wireframe?: boolean
  skin?: { skin?: string; subtype?: string } | BlobSkinSelection
  baseScale?: number
  opacity?: number
  lightIntensity?: number
  amplitude?: { x?: number; y?: number; z?: number }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function toHexColor(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const v = value.trim()
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
      if (v.length === 4) {
        // Expand #rgb -> #rrggbb
        const r = v[1]!
        const g = v[2]!
        const b = v[3]!
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
      }
      return v.toLowerCase()
    }
    return undefined
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    // Accept either 0..1 floats or 0..255 ints
    const n = value <= 1 ? Math.round(clamp(value, 0, 1) * 255) : Math.round(clamp(value, 0, 255))
    return `#${n.toString(16).padStart(2, '0')}${n.toString(16).padStart(2, '0')}${n.toString(16).padStart(2, '0')}`
  }

  return undefined
}

function normalizeSkin(skin: AnyBodyConfig['skin']): BlobSkinSelection {
  // The library currently supports tricolor + subtypes; default to poles.
  if (skin && typeof skin === 'object') {
    const subtype =
      'subtype' in skin && typeof (skin as any).subtype === 'string' ? ((skin as any).subtype as any) : 'poles'
    return { skin: 'tricolor', subtype }
  }
  return { skin: 'tricolor', subtype: 'poles' }
}

function normalizeBlobConfig(bodyConfig?: AnyBodyConfig): BlobConfig {
  const skin = normalizeSkin(bodyConfig?.skin)

  const colors = bodyConfig?.colors
    ? {
        x: toHexColor(bodyConfig.colors.x) ?? '#ff0066',
        y: toHexColor(bodyConfig.colors.y) ?? '#00ff66',
        z: toHexColor(bodyConfig.colors.z) ?? '#6600ff',
      }
    : undefined

  return {
    skin,
    resolution: typeof bodyConfig?.resolution === 'number' ? bodyConfig.resolution : undefined,
    spikes: bodyConfig?.spikes
      ? { x: bodyConfig.spikes.x ?? 0.2, y: bodyConfig.spikes.y ?? 0.2, z: bodyConfig.spikes.z ?? 0.2 }
      : undefined,
    time: bodyConfig?.time
      ? { x: bodyConfig.time.x ?? 1, y: bodyConfig.time.y ?? 1, z: bodyConfig.time.z ?? 1 }
      : undefined,
    rotation: bodyConfig?.rotation
      ? { x: bodyConfig.rotation.x ?? 0, y: bodyConfig.rotation.y ?? 0, z: bodyConfig.rotation.z ?? 0 }
      : undefined,
    colors,
    shininess: typeof bodyConfig?.shininess === 'number' ? bodyConfig.shininess : undefined,
    wireframe: typeof bodyConfig?.wireframe === 'boolean' ? bodyConfig.wireframe : undefined,
  }
}

function safeStableStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

export function KwamiBlobPreview(props: {
  bodyConfig?: AnyBodyConfig
  className?: string
  fallbackImageUrl?: string
  alt?: string
}) {
  const { bodyConfig, className, fallbackImageUrl, alt } = props

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [inView, setInView] = useState(false)

  const configKey = useMemo(() => safeStableStringify(bodyConfig), [bodyConfig])

  useEffect(() => {
    if (!wrapperRef.current) return
    const el = wrapperRef.current
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) setInView(true)
      },
      { root: null, threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    if (!canvasRef.current) return
    if (!bodyConfig) return

    const canvas = canvasRef.current
    const blobConfig = normalizeBlobConfig(bodyConfig)
    const initialSkin = normalizeSkin(bodyConfig.skin)

    let kwami: Kwami | null = null

    try {
      kwami = new Kwami(canvas, {
        body: {
          initialSkin,
          blob: {
            ...blobConfig,
            skin: initialSkin,
          },
          scene: {
            background: { type: 'transparent', opacity: 1 },
          },
        },
      })

      // Keep market previews clean (no right-click overlays / app dashboard).
      kwami.body.disableContextMenu()
      kwami.body.disableBlobInteraction()

      // Candy-like framing for square previews.
      kwami.body.setCameraPosition(0, 0, 6)
      kwami.body.setBackgroundTransparent()

      // Apply extra config that isn't part of the BlobConfig constructor options.
      if (typeof bodyConfig.baseScale === 'number') kwami.body.blob.setScale(bodyConfig.baseScale)
      if (typeof bodyConfig.opacity === 'number') kwami.body.blob.setOpacity(bodyConfig.opacity)
      if (typeof bodyConfig.lightIntensity === 'number') kwami.body.blob.setLightIntensity(bodyConfig.lightIntensity)
      if (bodyConfig.amplitude) {
        const ax = typeof bodyConfig.amplitude.x === 'number' ? bodyConfig.amplitude.x : undefined
        const ay = typeof bodyConfig.amplitude.y === 'number' ? bodyConfig.amplitude.y : undefined
        const az = typeof bodyConfig.amplitude.z === 'number' ? bodyConfig.amplitude.z : undefined
        if (ax !== undefined && ay !== undefined && az !== undefined) {
          kwami.body.blob.setAmplitude(ax, ay, az)
        }
      }

      // Ensure centered (some configs can drift when minted/recorded).
      kwami.body.blob.position.reset()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[KwamiBlobPreview] Failed to init preview:', err)
    }

    return () => {
      try {
        kwami?.dispose()
      } catch {
        // ignore
      } finally {
        kwami = null
      }
    }
    // Recreate on config changes to guarantee accurate appearance.
  }, [inView, configKey])

  const showFallback = !bodyConfig && Boolean(fallbackImageUrl)

  return (
    <div ref={wrapperRef} className={className}>
      {showFallback ? (
        <img src={fallbackImageUrl} alt={alt ?? ''} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" aria-label={alt} />
      )}
    </div>
  )
}


