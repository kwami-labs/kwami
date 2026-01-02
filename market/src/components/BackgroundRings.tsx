import { useEffect, useRef } from 'react'
import { createBackgroundRings, type BackgroundRingsHandle } from 'kwami/ui/rings'

export function BackgroundRings() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<BackgroundRingsHandle | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    handleRef.current?.destroy()
    handleRef.current = createBackgroundRings({
      mount: host,
      resize: 'auto',
      sizeSource: 'mount',
      zIndex: '0',
      initialOpacity: 1,
      ringCount: 90,
      baseRadius: 2,
      expansionFactor: 0.006,
      maxRingOpacity: 0.26,
      centerOffset: { x: -0.5, y: 0.5 },
    })

    return () => {
      handleRef.current?.destroy()
      handleRef.current = null
    }
  }, [])

  return <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />
}





